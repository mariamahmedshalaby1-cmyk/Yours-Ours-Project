// inject professionalId from URL into booking link
(function() {
    var params = new URLSearchParams(window.location.search);
    var proId  = params.get('id');
    if (proId) {
        document.querySelectorAll('a.btn-primary').forEach(function(link) {
            if (link.href.indexOf('booking.html') !== -1) {
                link.href = link.href + '&professionalId=' + proId;
            }
        });
    }
})();

document.querySelectorAll('.favorite-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
        if (this.textContent.includes('❤️')) {
            this.textContent = '🤍 Remove from Favorites';
            this.style.backgroundColor = 'var(--error)';
            this.style.color = 'var(--white)';
        } else {
            this.textContent = '❤️ Save to My Favorites';
            this.style.backgroundColor = '';
            this.style.color = '';
        }
    });
});

document.querySelectorAll('.secondary-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
        var proName = this.textContent.replace('💬 Chat with ', '').trim();
        alert('💬 Chat with ' + proName + ' is coming soon! For now, call them directly after booking.');
    });
});

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