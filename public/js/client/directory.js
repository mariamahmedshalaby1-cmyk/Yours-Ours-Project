function formatSpecialty(value) {
    var map = {
        'electrician': 'Electrician',
        'plumber':     'Plumber',
        'carpenter':   'Carpenter',
        'cleaner':     'Cleaner',
        'ac_repair':   'AC Repair',
        'painter':     'Painter'
    };
    return map[value] || value;
}

async function loadProfessionals() {
    var container = document.querySelector('.professionals-grid');
    if (!container) return;

    try {
        var token    = localStorage.getItem('token');
        var response = await fetch('http://localhost:3000/api/professionals', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        if (!response.ok) {
            container.innerHTML = '<p style="text-align:center; color:var(--error); padding:2rem;">Could not load professionals. Please try again later.</p>';
            return;
        }
        var professionals = await response.json();
        if (professionals.length === 0) return;
        container.innerHTML = '';

        professionals.forEach(function(pro) {
            var card = document.createElement('article');
            card.className = 'pro-card';

            card.innerHTML =
                '<div class="card-header">' +
                '<button class="favorite-heart">♡</button>' +
                '</div>' +
                '<div class="pro-info">' +
                '<img src="' + (pro.profilePicture || 'https://via.placeholder.com/80') + '" alt="' + pro.fullName + '" class="pro-avatar">' +
                '<h3>' + pro.fullName + (pro.isVerified ? ' <span class="verified-badge">🛡️</span>' : '') + '</h3>' +
                '<p class="pro-title">' + formatSpecialty(pro.specialty || '') + '</p>' +
                '<p class="pro-rating">⭐ ' + (pro.averageRating > 0 ? pro.averageRating.toFixed(1) : 'New') + ' (' + (pro.completedJobs || 0) + ' jobs done)</p>' +
                '</div>' +
                '<div class="card-footer">' +
                '<a href="profile.html?id=' + pro._id + '" class="book-btn">View Profile & Book</a>' +
                '</div>';

            container.appendChild(card);
        });

    } catch (err) {
        console.error('Could not load professionals:', err);
        container.innerHTML = '<p style="text-align:center; color:var(--error); padding:2rem;">Server error. Please check your connection and try again.</p>';
    }
}

loadProfessionals();
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

document.addEventListener('click', function(e) {
    if (e.target.classList.contains('favorite-heart')) {
        if (e.target.textContent === '♡') {
            e.target.textContent = '♥';
            e.target.style.color = 'var(--error)';
        } else {
            e.target.textContent = '♡';
            e.target.style.color = '';
        }
    }
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