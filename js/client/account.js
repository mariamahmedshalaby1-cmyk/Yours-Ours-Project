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