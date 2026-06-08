window.addEventListener('DOMContentLoaded', async function() {
    var userId = localStorage.getItem('userId');
    var token  = localStorage.getItem('token');

    if (!userId || !token) {
       window.location.href = '../landing-page/login.html';
        return;
   }

    try {
        var response = await fetch('http://localhost:3000/api/auth/user/' + userId, {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        if (!response.ok) {
            window.location.href = '../landing-page/login.html';
            return;
        }
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
        var tbody = document.getElementById('history-body');
        if (!bookingRes.ok) {
            if (tbody) {
                var errRow = document.createElement('tr');
                errRow.innerHTML = '<td colspan="5" style="text-align:center; color:var(--error);">Could not load booking history. Please try again later.</td>';
                tbody.appendChild(errRow);
            }
            return;
        }
        var bookingData = await bookingRes.json();
        var bookings    = bookingData.bookings;

        if (bookings && bookings.length > 0) {
            bookings.forEach(function(b) {
                var proName = b.professional ? b.professional.fullName : 'Unknown';
                var date = new Date(b.scheduledTime).toLocaleDateString();
                var pin  = b.pin || '----';
                var tr   = document.createElement('tr');
                tr.innerHTML =
                    '<td>' + (b.service || 'Service') + '</td>' +
                    '<td>' + proName + '</td>' +
                    '<td>' + date + '</td>' +
                    '<td>' + b.status + '</td>' +
                    '<td><button class="call-btn" onclick="showReceipt(\'' + (b.service || 'Service') + '\',\'' + proName + '\',\'' + date + '\',\'' + b.status + '\',\'' + pin + '\',\'' + (b.price || '') + '\')">View Receipt</button></td>';
                tbody.appendChild(tr);
            });
        } else {
            var tr = document.createElement('tr');
            tr.innerHTML = '<td colspan="5" style="text-align:center;">No past bookings yet.</td>';
            tbody.appendChild(tr);
        }


    } catch (err) {
        console.error('Could not load account data:', err);
        var tbody = document.getElementById('history-body');
        if (tbody) {
            var errRow = document.createElement('tr');
            errRow.innerHTML = '<td colspan="5" style="text-align:center; color:var(--error);">Server error. Please try again later.</td>';
            tbody.appendChild(errRow);
        }
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

function showReceipt(service, pro, date, status, pin, price) {
    document.getElementById('receipt-service').textContent = service;
    document.getElementById('receipt-pro').textContent     = pro;
    document.getElementById('receipt-date').textContent    = date;
    document.getElementById('receipt-status').textContent  = status;
    if (document.getElementById('receipt-price'))
        document.getElementById('receipt-price').textContent = price ? '💰 Price: ' + price + ' EGP' : '';
    if (document.getElementById('receipt-pin'))
        document.getElementById('receipt-pin').textContent = '🔐 Safety PIN: ' + pin;
    document.getElementById('receipt-modal').style.display = 'flex';
}

function closeReceipt() {
    document.getElementById('receipt-modal').style.display = 'none';
}

// toggle the inline edit profile form
function toggleEditForm() {
    var form    = document.getElementById('edit-profile-form');
    var nameEl  = document.getElementById('account-name');
    var phoneEl = document.getElementById('account-phone');
    var emailEl = document.getElementById('account-email');

    if (form.style.display === 'none' || form.style.display === '') {
        // pre-fill inputs with currently displayed values
        document.getElementById('edit-name').value  = nameEl  ? nameEl.textContent.trim() : '';
        document.getElementById('edit-phone').value = phoneEl ? phoneEl.textContent.replace('📞 ', '').trim() : '';
        document.getElementById('edit-email').value = emailEl ? emailEl.textContent.replace('✉️ ', '').trim() : '';
        form.style.display = 'block';
    } else {
        form.style.display = 'none';
    }
}

// save edited values back to the display
function saveProfile() {
    var newName  = document.getElementById('edit-name').value.trim();
    var newPhone = document.getElementById('edit-phone').value.trim();
    var newEmail = document.getElementById('edit-email').value.trim();

    if (!newName || !newPhone || !newEmail) {
        alert('Please fill in all fields before saving.');
        return;
    }

    if (document.getElementById('account-name'))
        document.getElementById('account-name').textContent = newName;
    if (document.getElementById('account-phone'))
        document.getElementById('account-phone').textContent = '📞 ' + newPhone;
    if (document.getElementById('account-email'))
        document.getElementById('account-email').textContent = '✉️ ' + newEmail;

    document.getElementById('edit-profile-form').style.display = 'none';
    alert('✅ Profile updated!');
}

// avatar photo upload, preview selected image and hide the SVG default
var avatarUpload = document.getElementById('avatar-upload');
if (avatarUpload) {
    avatarUpload.addEventListener('change', function() {
        var file = this.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function(e) {
            var img = document.getElementById('avatar-img');
            var svg = document.getElementById('avatar-default');
            if (img) {
                img.src = e.target.result;
                img.style.display = 'block';
            }
            if (svg) svg.style.display = 'none';
        };
        reader.readAsDataURL(file);
    });
}