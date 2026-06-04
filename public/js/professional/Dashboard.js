const token = localStorage.getItem('token');
const professionalId = localStorage.getItem('userId');
const name = localStorage.getItem('name');

// Redirect to login if not authenticated
if (!token || !professionalId) {
    window.location.href = '/html/landing-page/login.html';
}

// Update welcome message with professional's name
if (name) {
    document.getElementById('welcome-heading').textContent = `Welcome back, ${name}!`;
}

// Format date nicely
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

// Update a booking's status via the backend
async function updateBookingStatus(bookingId, status, row) {
    try {
        const res = await fetch(`/api/bookings/${bookingId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status })
        });

        const data = await res.json();

        if (!res.ok) {
            alert('Failed to update booking: ' + data.message);
            return;
        }

        // Update the row visually without reloading
        const statusCell = row.querySelector('td:nth-child(4)');
        const actionCell = row.querySelector('td:nth-child(5)');

        if (status === 'confirmed') {
            statusCell.innerHTML = '<strong style="color: green;">Confirmed</strong>';
        } else if (status === 'cancelled') {
            statusCell.innerHTML = '<strong style="color: gray;">Declined</strong>';
        }

        actionCell.innerHTML = '—';

    } catch (err) {
        alert('Something went wrong. Please try again.');
    }
}

// Build a table row for each booking
function createBookingRow(booking) {
    const row = document.createElement('tr');

    const clientName = booking.client?.name || 'Unknown Client';
    const service = booking.service || 'N/A';
    const date = booking.scheduledTime ? formatDate(booking.scheduledTime) : 'N/A';
    const isEmergency = booking.isEmergency;

    if (isEmergency) {
        row.classList.add('emergency-row-highlight');
    }

    row.innerHTML = `
        <td>${isEmergency ? `<strong>${clientName}</strong>` : clientName}</td>
        <td>${service}</td>
        <td>${date}</td>
        <td>${isEmergency ? '<strong style="color:red;">Immediate</strong>' : '<i>Pending</i>'}</td>
        <td>
            <button type="button" class="btn-accept">${isEmergency ? 'Accept Now' : 'Accept'}</button>
            <button type="button" class="btn-decline">Decline</button>
        </td>
    `;

    const acceptBtn = row.querySelector('.btn-accept');
    const declineBtn = row.querySelector('.btn-decline');

    acceptBtn.addEventListener('click', () => updateBookingStatus(booking._id, 'confirmed', row));
    declineBtn.addEventListener('click', () => updateBookingStatus(booking._id, 'cancelled', row));

    return row;
}

// Fetch and render all pending bookings for this professional
async function loadBookings() {
    const tbody = document.getElementById('bookings-tbody');

    try {
        const res = await fetch(`/api/bookings/professional/${professionalId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await res.json();

        if (!res.ok) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Failed to load bookings.</td></tr>';
            return;
        }

        const bookings = data.bookings;

        if (!bookings || bookings.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No pending requests.</td></tr>';
            document.getElementById('request-count').textContent = '0';
            return;
        }

        // Update the notice count
        document.getElementById('request-count').textContent = bookings.length;

        // Check for emergency bookings and show banner
        const emergency = bookings.find(b => b.isEmergency);
        if (emergency) {
            const banner = document.getElementById('emergency-banner');
            const emergencyText = document.getElementById('emergency-text');
            banner.style.display = 'block';
            emergencyText.textContent = `${emergency.client?.name || 'A client'} has an emergency request (${emergency.description || 'urgent issue'}).`;
        }

        // Render rows — emergencies first
        tbody.innerHTML = '';
        const sorted = [...bookings].sort((a, b) => b.isEmergency - a.isEmergency);
        sorted.forEach(booking => tbody.appendChild(createBookingRow(booking)));

        // Update next job section with the earliest booking
        const next = sorted[0];
        if (next) {
            document.getElementById('next-job-content').innerHTML = `
                <p><strong>${next.scheduledTime ? formatDate(next.scheduledTime) : 'TBD'}</strong> — ${next.service || 'Service'}</p>
                <p>Location: ${next.address?.neighborhood || ''}, ${next.address?.street || 'Address not provided'}</p>
            `;
        }

    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Error loading requests.</td></tr>';
    }
}

// Run on page load
loadBookings();
