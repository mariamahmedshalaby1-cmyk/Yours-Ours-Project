document.querySelectorAll('.filter-tag').forEach(function(tag) {
    tag.addEventListener('click', function() {
        document.querySelectorAll('.filter-tag').forEach(function(t) {
            t.classList.remove('active');
        });
        this.classList.add('active');

        var filter = this.textContent.trim().toLowerCase();

        document.querySelectorAll('.pro-card').forEach(function(card) {
            var text = card.textContent.toLowerCase();

            if (filter === 'all') {
                card.style.display = '';
            } else if (filter.includes('electrician')) {
                card.style.display = text.includes('electrician') ? '' : 'none';
            } else if (filter.includes('plumber')) {
                card.style.display = text.includes('plumber') ? '' : 'none';
            } else if (filter.includes('emergency')) {
                card.style.display = text.includes('30 mins') || text.includes('emergency') ? '' : 'none';
            } else {
                card.style.display = '';
            }
        });
    });
});

document.querySelector('.primary-btn').addEventListener('click', function() {
    var inputs = document.querySelectorAll('.search-bar-ui input');
    var query = (inputs[0].value + ' ' + inputs[1].value).toLowerCase().trim();
    document.querySelectorAll('.pro-card').forEach(function(card) {
        if (!query) {
            card.style.display = '';
            return;
        }
        var text = card.textContent.toLowerCase();
        card.style.display = text.includes(query) ? '' : 'none';
    });
});

document.querySelectorAll('.favorite-heart').forEach(function(btn) {
    btn.addEventListener('click', function() {
        if (this.textContent === '♡') {
            this.textContent = '♥';
            this.style.color = 'var(--error)';
        } else {
            this.textContent = '♡';
            this.style.color = '';
        }
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