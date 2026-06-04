
var starLabels = {
    1: '😞 Poor — not what I expected',
    2: '😐 Fair — could be better',
    3: '🙂 Good — decent experience',
    4: '😊 Great — very satisfied!',
    5: '🤩 Amazing — absolutely loved it!'
};
document.querySelectorAll('input[name="rating"]').forEach(function(input) {
    input.addEventListener('change', function() {
        document.getElementById('star-label').textContent = starLabels[this.value] || '';
        document.getElementById('form-error').style.display = 'none';
    });
});
function updateCounter(textarea) {
    document.getElementById('char-count').textContent = textarea.value.trim().length;
}
function submitReview() {
    var selected = document.querySelector('input[name="rating"]:checked');
    if (!selected) {
        document.getElementById('form-error').style.display = 'block';
        document.getElementById('star-rating').style.animation = 'shake 0.3s ease';
        setTimeout(function(){ document.getElementById('star-rating').style.animation = ''; }, 300);
        return;
    }

    var rating = parseInt(selected.value);
    var text   = document.getElementById('review-text').value.trim();
    var params = new URLSearchParams(window.location.search);

    var reviewData = {
        professionalId: params.get('proId'),
        clientId:       localStorage.getItem('userId'),
        clientName:     localStorage.getItem('name'),
        rating:         rating,
        text:           text
    };

    const token = localStorage.getItem('token');
fetch('http://localhost:3000/api/reviews', {
    method: 'POST',
    headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify(reviewData)
})
    .then(function(res) { return res.json(); })
    .then(function(data) {
        // Show the success UI exactly as before
        var stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
        document.getElementById('success-stars').textContent = stars;
        document.getElementById('success-text').textContent  = text || 'No written review — just a star rating.';
        document.getElementById('review-form-section').style.display = 'none';
        document.getElementById('review-success').style.display = 'flex';
    })
    .catch(function(err) {
        console.error('Failed to submit review:', err);
    });
}

var styleEl = document.createElement('style');
styleEl.textContent = '@keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }';
document.head.appendChild(styleEl);
(function() {
    var params = new URLSearchParams(window.location.search);
    if (params.get('pro'))     document.getElementById('pro-name').textContent    = params.get('pro');
    if (params.get('service')) document.getElementById('pro-service').textContent = params.get('service') + ' · Completed';
})();

function toggleMenu(){
    var m=document.getElementById("mobile-menu");
    var b=document.getElementById("hamburger");
    if(m) m.classList.toggle("open");
    if(b) b.classList.toggle("open");
}