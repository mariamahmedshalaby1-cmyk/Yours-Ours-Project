document.querySelectorAll('.filter-tag').forEach(function(tag) {
    tag.addEventListener('click', function() {
        document.querySelectorAll('.filter-tag').forEach(function(t) {
            t.classList.remove('active');
        });
        this.classList.add('active');
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