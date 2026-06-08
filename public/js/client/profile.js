// Dynamic profile loader 
// Runs when a client clicks a card in the directory (URL has ?id=MONGO_ID).
// Hides all static sections and populates #dynamic-profile with real DB data.
// If no ?id param: page stays static (all 5 demo profiles visible as normal).
(function () {
    var params = new URLSearchParams(window.location.search);
    var proId  = params.get('id');
    if (!proId) return;

    // Hide every static profile section
    document.querySelectorAll('.profile-section').forEach(function (s) {
        s.style.display = 'none';
    });

    // Reveal the dynamic section
    var dynSection = document.getElementById('dynamic-profile');
    if (dynSection) dynSection.style.display = '';

    fetch('http://localhost:3000/api/professionals/' + proId)
        .then(function (res) {
            if (!res.ok) throw new Error('Not found');
            return res.json();
        })
        .then(function (pro) {
            var specialtyLabels = {
                electrician: 'Electrician',
                plumber:     'Plumber',
                carpenter:   'Carpenter',
                cleaner:     'Cleaner',
                ac_repair:   'AC Repair',
                painter:     'Painter'
            };

            var el;

            // Photo
            el = document.getElementById('dyn-photo');
            if (el) el.src = pro.profilePicture || 'https://via.placeholder.com/180';

            // Name
            el = document.getElementById('dyn-name');
            if (el) el.textContent = pro.fullName || 'Professional';

            // Verified badge — only show if isVerified is true
            if (pro.isVerified) {
                el = document.getElementById('dyn-verified');
                if (el) el.style.display = '';
            }

            // Specialty
            el = document.getElementById('dyn-specialty');
            if (el) el.textContent = specialtyLabels[pro.specialty] || pro.specialty || '';

            // City
            el = document.getElementById('dyn-city');
            if (el) el.textContent = pro.city || 'Cairo';

            // Rating
            el = document.getElementById('dyn-rating');
            if (el) el.textContent = pro.averageRating > 0 ? pro.averageRating.toFixed(1) : 'New';

            // Jobs done
            el = document.getElementById('dyn-jobs');
            if (el) el.textContent = pro.completedJobs || 0;

            // Experience
            el = document.getElementById('dyn-experience');
            if (el && pro.experienceYears > 0) {
            el.textContent = '| ' + pro.experienceYears + ' Years Experience';
             }

            // Price
             el = document.getElementById('dyn-price');
             if (el) el.textContent = pro.startingFee > 0 ? pro.startingFee + ' EGP' : '—';

            // Bio
            el = document.getElementById('dyn-bio');
            if (el) el.textContent = pro.bio || 'No bio provided yet.';

            // Services tags
            el = document.getElementById('dyn-services');
            if (el && pro.services && pro.services.length > 0) {
                el.innerHTML = '';
                pro.services.forEach(function (s) {
                    var span = document.createElement('span');
                    span.textContent = s.charAt(0).toUpperCase() + s.slice(1);
                    el.appendChild(span);
                });
            }

           // Book button — passes professionalId, name, service, and price to booking page
            el = document.getElementById('dyn-book-btn');
            if (el) el.href = '/html/client/booking.html?professionalId=' + pro._id +
                               '&pro='     + encodeURIComponent(pro.fullName || '') +
                               '&service=' + encodeURIComponent(specialtyLabels[pro.specialty] || pro.specialty || 'General Service') +
                               '&price='   + (pro.startingFee || 0);

            // Review button
            el = document.getElementById('dyn-review-btn');
            if (el) el.href = '/html/client/write-review.html?professionalId=' + pro._id + '&pro=' + encodeURIComponent(pro.fullName || '');

            // Chat button label
            el = document.getElementById('dyn-chat-btn');
            if (el) el.textContent = '💬 Chat with ' + (pro.fullName ? pro.fullName.split(' ')[0] : 'Pro');
        })
        .catch(function (err) {
            console.error('Could not load professional profile:', err);
            // On error: fall back to showing static sections so page isn't blank
            document.querySelectorAll('.profile-section').forEach(function (s) {
                if (s.id !== 'dynamic-profile') s.style.display = '';
            });
            if (dynSection) dynSection.style.display = 'none';
        });
}());

//Favorites toggle works for both static and dynamic sections 
document.addEventListener('click', function (e) {
    if (e.target.classList.contains('favorite-btn')) {
        if (e.target.textContent.includes('❤️')) {
            e.target.textContent           = '🤍 Remove from Favorites';
            e.target.style.backgroundColor = 'var(--error)';
            e.target.style.color           = 'var(--white)';
        } else {
            e.target.textContent           = '❤️ Save to My Favorites';
            e.target.style.backgroundColor = '';
            e.target.style.color           = '';
        }
    }
});

//Chat buttons works for both static and dynamic sections too
document.addEventListener('click', function (e) {
    if (e.target.classList.contains('secondary-btn')) {
        var name = e.target.textContent.replace('💬 Chat with ', '').trim();
        alert('💬 Chat with ' + name + ' is coming soon! For now, call them directly after booking.');
    }
});

//menu
function toggleMenu() {
    var m = document.getElementById('mobile-menu');
    var b = document.getElementById('hamburger');
    if (m) m.classList.toggle('open');
    if (b) b.classList.toggle('open');
}

//Bell notification 
var bellBtn = document.querySelector('.nav-icon-btn');
if (bellBtn) {
    bellBtn.addEventListener('click', function () {
        alert('🔔 No new notifications right now.');
    });
}