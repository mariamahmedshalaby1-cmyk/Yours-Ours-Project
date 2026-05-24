window.addEventListener('DOMContentLoaded', async function() {
    var userId = localStorage.getItem('userId');
    var token  = localStorage.getItem('token');

    if (!userId) {
        window.location.href = 'login.html';
        return;
    }

    try {
        var response = await fetch('http://localhost:3000/api/auth/user/' + userId, {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        var user = await response.json();

        // ⚠️ Replace these IDs with the real ones from your account.html
        if (document.getElementById('account-name'))
            document.getElementById('account-name').textContent = user.name;
        if (document.getElementById('account-email'))
            document.getElementById('account-email').textContent = user.email;
        if (document.getElementById('account-phone'))
            document.getElementById('account-phone').textContent = user.phone;

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