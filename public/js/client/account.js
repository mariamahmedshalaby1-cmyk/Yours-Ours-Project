window.addEventListener('DOMContentLoaded', async function() {
    var userId = localStorage.getItem('userId');
    var token  = localStorage.getItem('token');

    if (!userId) {
       window.location.href = '../landing-page/login.html';
        return;
   }

    try {
        var response = await fetch('http://localhost:3000/api/auth/user/' + userId, {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        var user = await response.json();

        if (document.getElementById('account-name'))
            document.getElementById('account-name').textContent = user.name;
        if (document.getElementById('account-email'))
            document.getElementById('account-email').textContent = '✉️ ' + user.email;
        if (document.getElementById('account-phone'))
            document.getElementById('account-phone').textContent = '📞 ' + user.phone;
        var bookingRes = await fetch('http://localhost:3000/api/bookings/client/' + userId, {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        var bookingData = await bookingRes.json();
        var bookings = bookingData.bookings;

        var tbody = document.getElementById('history-body');
        if (bookings && bookings.length > 0) {
            bookings.forEach(function(b) {
                var proName = b.professional ? b.professional.fullName : 'Unknown';
                var date = new Date(b.scheduledTime).toLocaleDateString();
                var tr = document.createElement('tr');
                tr.innerHTML =
                    '<td>' + (b.service || 'Service') + '</td>' +
                    '<td>' + proName + '</td>' +
                    '<td>' + date + '</td>' +
                    '<td>' + b.status + '</td>' +
                    '<td><button class="call-btn" onclick="showReceipt(\'' + (b.service || 'Service') + '\',\'' + proName + '\',\'' + date + '\',\'' + b.status + '\')">View Receipt</button></td>';
                tbody.appendChild(tr);
            });
        } else {
            var tr = document.createElement('tr');
            tr.innerHTML = '<td colspan="5" style="text-align:center;">No past bookings yet.</td>';
            tbody.appendChild(tr);
        }


    } catch (err) {
        console.error('Could not load account data:', err);
    }
});
function showPhone() {
    var btn = document.getElementById('call-btn');
    btn.textContent = '📞 +20 101 234 5678';
    btn.onclick = null;
}

function confirmProCode() {
    var input = document.getElementById('pro-code-input');
    var msg = document.getElementById('confirm-msg');
    if (input.value.length === 4) {
        msg.style.display = 'block';
        input.disabled = true;
    } else {
        input.style.border = '2px solid red';
    }
}

function toggleMenu() {
    var m = document.getElementById("mobile-menu");
    var b = document.getElementById("hamburger");
    if (m) m.classList.toggle("open");
    if (b) b.classList.toggle("open");
}
var bellBtn = document.querySelector('.nav-icon-btn');
if (bellBtn) {
    bellBtn.addEventListener('click', function() {
        alert('🔔 No new notifications right now.');
    });
}

function showReceipt(service, pro, date, status) {
    document.getElementById('receipt-service').textContent = service;
    document.getElementById('receipt-pro').textContent = pro;
    document.getElementById('receipt-date').textContent = date;
    document.getElementById('receipt-status').textContent = status;
    document.getElementById('receipt-modal').style.display = 'flex';
}

function closeReceipt() {
    document.getElementById('receipt-modal').style.display = 'none';
}