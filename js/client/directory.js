document.querySelectorAll('.filter-tag').forEach(function(tag) {
    tag.addEventListener('click', function() {
        document.querySelectorAll('.filter-tag').forEach(function(t) {
            t.classList.remove('active');
        });
        this.classList.add('active');
    });
});

document.querySelector('.primary-btn').addEventListener('click', function() {
    var query = document.querySelector('.search-bar-ui input').value.toLowerCase();
    document.querySelectorAll('.pro-card').forEach(function(card) {
        var text = card.textContent.toLowerCase();
        card.style.display = text.includes(query) ? '' : 'none';
    });
});

function toggleMenu() {
    var m = document.getElementById("mobile-menu");
    var b = document.getElementById("hamburger");
    if (m) m.classList.toggle("open");
    if (b) b.classList.toggle("open");
}