
function toggleMenu() {
    var m = document.getElementById("mobile-menu");
    var b = document.getElementById("hamburger");
    if (m) m.classList.toggle("open");
    if (b) b.classList.toggle("open");
}

const token = localStorage.getItem('token');
const userId = localStorage.getItem('userId');

if (!token || !userId) {
    window.location.href = '/html/landing-page/login.html';
}

// Format date nicely
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

// Load confirmed bookings into the Planned Agenda table
async function loadConfirmedBookings() {
    const tbody = document.querySelector('.data-table tbody');

    try {
        // First get the professional's ID
        const proRes = await fetch(`/api/professionals/user/${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!proRes.ok) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Could not load profile.</td></tr>';
            return;
        }

        const pro = await proRes.json();

        // Then get their confirmed bookings
        const bookingsRes = await fetch(`/api/bookings/professional/${pro._id}?status=confirmed`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!bookingsRes.ok) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Could not load bookings.</td></tr>';
            return;
        }

        const data = await bookingsRes.json();
        const bookings = data.bookings;

        if (!bookings || bookings.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No confirmed bookings yet.</td></tr>';
            return;
        }

        tbody.innerHTML = '';
        bookings.forEach(function(booking) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${formatDate(booking.scheduledTime)}</td>
                <td>${booking.scheduledTime}</td>
                <td>${booking.service || 'N/A'}</td>
                <td>${booking.address ? booking.address.neighborhood + ', ' + booking.address.street : 'N/A'}</td>
                <td><span class="badge status-inprogress">Confirmed</span></td>
            `;
            tbody.appendChild(row);
        });

    } catch (err) {
        console.error('Error loading bookings:', err);
        document.querySelector('.data-table tbody').innerHTML = '<tr><td colspan="5" style="text-align:center;">Error loading bookings.</td></tr>';
    }
}

// Handle Add Work Session form
const form = document.querySelector('.form-section form');
if (form) {
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const date        = document.getElementById('work-date').value;
        const startTime   = document.getElementById('start-time').value;
        const endTime     = document.getElementById('end-time').value;
        const serviceType = document.getElementById('service').value;
        const location    = document.getElementById('location').value.trim();

        if (!date || !startTime || !endTime) {
            alert('Please fill in all required fields.');
            return;
        }

        try {
            const proRes = await fetch(`/api/professionals/user/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const pro = await proRes.json();

            const res = await fetch(`/api/professionals/${pro._id}/sessions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ date, startTime, endTime, serviceType, location })
            });

            if (res.ok) {
                alert('Work session logged successfully!');
                form.reset();
                loadConfirmedBookings();
            } else {
                const data = await res.json();
                alert('Error: ' + data.error);
            }

        } catch (err) {
            alert('Something went wrong. Please try again.');
        }
    });
}

// Load on page start
loadConfirmedBookings();