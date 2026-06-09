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
    const date = booking.scheduledTime || 'N/A';
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

async function loadBookings() {
    const tbody = document.getElementById('bookings-tbody');

    try {
        // Step 1 — get the Professional profile using the User ID
        // userId from localStorage is the User _id
        // we need the Professional model _id which is different
        const proRes = await fetch(`/api/professionals/user/${professionalId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!proRes.ok) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Please complete your profile first.</td></tr>';
            return;
        }

        const pro = await proRes.json();

        // Step 2 — now use the Professional _id to find bookings
        const res = await fetch(`/api/bookings/professional/${pro._id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await res.json();

        if (!res.ok) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Failed to load bookings.</td></tr>';
            return;
        }

        const bookings = data.bookings;

        if (!bookings || bookings.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No pending requests yet.</td></tr>';
            if (document.getElementById('request-count'))
                document.getElementById('request-count').textContent = '0';
            return;
        }

        // Show count
        if (document.getElementById('request-count'))
            document.getElementById('request-count').textContent = bookings.length;

        // Show emergency banner if needed
        const emergency = bookings.find(b => b.isEmergency);
        if (emergency) {
            const banner      = document.getElementById('emergency-banner');
            const emergencyText = document.getElementById('emergency-text');
            if (banner) banner.style.display = 'block';
            if (emergencyText) emergencyText.textContent =
                `${emergency.client?.name || 'A client'} has an emergency request.`;
        }

        // Render rows — emergencies first
        tbody.innerHTML = '';
        const sorted = [...bookings].sort((a, b) => b.isEmergency - a.isEmergency);
        sorted.forEach(booking => tbody.appendChild(createBookingRow(booking)));

        // Show next job
        const next = sorted[0];
        if (next) {
            const nextJobEl = document.getElementById('next-job-content');
            if (nextJobEl) {
                nextJobEl.innerHTML = `
                    <p><strong>${next.scheduledTime || 'TBD'}</strong> — ${next.service || 'Service'}</p>
                    <p>Location: ${next.address?.neighborhood || ''}, ${next.address?.street || 'Not provided'}</p>
                `;
            }
        }

    } catch (err) {
        console.error(err);
        if (tbody) tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Error loading requests.</td></tr>';
    }
}

// Run on page load
loadBookings();
