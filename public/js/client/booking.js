(function() {
    var params = new URLSearchParams(window.location.search);
    var pro     = params.get('pro')     || 'Samy Ahmed';
    var service = params.get('service') || 'Electrical Repair';
    var proEl  = document.getElementById('booking-pro-name');
    var svcEl  = document.getElementById('booking-service');
    if (proEl)  proEl.textContent  = pro.replace(/\+/g, ' ');
    if (svcEl)  svcEl.textContent  = service.replace(/\+/g, ' ');
    document.title = 'Book ' + pro.replace(/\+/g, ' ') + ' | Yours&Ours';
})();

function validateBookingForm() {
    var valid = true;

    var textarea = document.querySelector('.smart-booking-form textarea');
    var neighborhood = document.querySelector('.address-inputs input:first-child');
    var street = document.querySelector('.address-inputs input:nth-child(2)');
    var checkbox = document.querySelector('.safety-agreement input[type="checkbox"]');
    var selectedTime = document.querySelector('.time-pill.selected');

    document.querySelectorAll('.booking-field-error').forEach(function(el) {
        el.remove();
    });

    function showError(element, message) {
        var err = document.createElement('p');
        err.className = 'booking-field-error';
        err.style.color = 'var(--error)';
        err.style.fontSize = '0.82rem';
        err.style.marginTop = '6px';
        err.textContent = message;
        element.parentNode.insertBefore(err, element.nextSibling);
        valid = false;
    }

    if (!textarea.value.trim()) {
        showError(textarea, 'Please describe the issue before continuing.');
    }

    if (!selectedTime) {
        var timeGrid = document.querySelector('.time-grid');
        showError(timeGrid, 'Please select a time slot.');
    }

    if (!neighborhood.value.trim()) {
        showError(neighborhood, 'Please enter your neighborhood.');
    }

    if (!street.value.trim()) {
        showError(street, 'Please enter your street and building number.');
    }

    if (!checkbox.checked) {
        showError(checkbox, 'You must confirm an adult will be present.');
    }

    return valid;
}

var form = document.querySelector('.smart-booking-form');
if (form) {
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        if (!validateBookingForm()) return;
        var btn = document.querySelector('.primary-confirm-btn');
        btn.textContent = '✅ Request Sent!';
        btn.disabled = true;
        btn.style.backgroundColor = '#22c55e';
        setTimeout(function() {
            window.location.href = 'account.html';
        }, 1500);
    });
}

document.querySelectorAll('.time-pill').forEach(function(pill) {
    pill.addEventListener('click', function() {
        document.querySelectorAll('.time-pill').forEach(function(p) {
            p.classList.remove('selected');
        });
        this.classList.add('selected');
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

(function() {
    var params  = new URLSearchParams(window.location.search);
    var pro     = params.get('pro')     || 'Samy Ahmed';
    var service = params.get('service') || 'Electrical Repair';
    var proEl   = document.getElementById('booking-pro-name');
    var svcEl   = document.getElementById('booking-service');
    if (proEl)  proEl.textContent = pro.replace(/\+/g, ' ');
    if (svcEl)  svcEl.textContent = service.replace(/\+/g, ' ');
    document.title = 'Book ' + pro.replace(/\+/g, ' ') + ' | Yours&Ours';
})();


document.querySelectorAll('.time-pill').forEach(function(pill) {
    pill.addEventListener('click', function() {
        document.querySelectorAll('.time-pill').forEach(function(p) {
            p.classList.remove('selected');
        });
        this.classList.add('selected');
    });
});

function validateBookingForm() {
    var valid        = true;
    var textarea     = document.querySelector('.smart-booking-form textarea');
    var neighborhood = document.querySelector('.address-inputs input:first-child');
    var street       = document.querySelector('.address-inputs input:nth-child(2)');
    var checkbox     = document.querySelector('.safety-agreement input[type="checkbox"]');
    var selectedTime = document.querySelector('.time-pill.selected');

    document.querySelectorAll('.booking-field-error').forEach(function(el) {
        el.remove();
    });

    function showError(element, message) {
        var err             = document.createElement('p');
        err.className       = 'booking-field-error';
        err.style.color     = 'var(--error)';
        err.style.fontSize  = '0.82rem';
        err.style.marginTop = '6px';
        err.textContent     = message;
        element.parentNode.insertBefore(err, element.nextSibling);
        valid = false;
    }

    if (!textarea.value.trim()) {
        showError(textarea, 'Please describe the issue before continuing.');
    }
    if (!selectedTime) {
        showError(document.querySelector('.time-grid'), 'Please select a time slot.');
    }
    if (!neighborhood.value.trim()) {
        showError(neighborhood, 'Please enter your neighborhood.');
    }
    if (!street.value.trim()) {
        showError(street, 'Please enter your street and building number.');
    }
    if (!checkbox.checked) {
        showError(checkbox, 'You must confirm an adult will be present.');
    }

    return valid;
}

var form = document.querySelector('.smart-booking-form');

if (form) {
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        if (!validateBookingForm()) return;

        var params         = new URLSearchParams(window.location.search);
        var professionalId = params.get('professionalId');
        var clientId       = localStorage.getItem('userId');
        var token          = localStorage.getItem('token'); // ← ADDED
        var service        = params.get('service') || 'General Service';

        var description  = document.querySelector('.smart-booking-form textarea').value.trim();
        var isEmergency  = document.querySelector('input[name="is_emergency"]').checked;
        var selectedTime = document.querySelector('.time-pill.selected').textContent.trim();
        var neighborhood = document.querySelector('.address-inputs input:first-child').value.trim();
        var street       = document.querySelector('.address-inputs input:nth-child(2)').value.trim();
        var apartment    = document.querySelector('.address-inputs input:nth-child(3)').value.trim();
        var landmark     = document.querySelector('.address-inputs input:nth-child(4)').value.trim();

        var bookingData = {
            clientId:       clientId,
            professionalId: professionalId,
            service:        service,
            description:    description,
            isEmergency:    isEmergency,
            scheduledTime:  selectedTime,
            address: {
                neighborhood: neighborhood,
                street:       street,
                apartment:    apartment,
                landmark:     landmark
            }
        };

        var btn         = document.querySelector('.primary-confirm-btn');
        btn.textContent = 'Sending...';
        btn.disabled    = true;

        try {
            var response = await fetch('http://localhost:3000/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type':  'application/json',
                    'Authorization': 'Bearer ' + token  
                },
                body: JSON.stringify(bookingData)
            });

            var result = await response.json();

            if (response.ok) {
                btn.textContent           = '✅ Request Sent!';
                btn.style.backgroundColor = '#22c55e';
                alert('✅ Booking confirmed!\n\n🔐 Your safety PIN is: ' + result.booking.pin + '\n\nShow this to the professional when they arrive.');
                setTimeout(function() {
                    window.location.href = 'account.html';
                }, 1500);
            } else {
                btn.textContent = 'Confirm & Send Request';
                btn.disabled    = false;
                alert('Something went wrong: ' + result.message);
            }

        } catch (error) {
            btn.textContent = 'Confirm & Send Request';
            btn.disabled    = false;
            alert('Could not connect to server. Make sure the backend is running.');
            console.log('Fetch error:', error);
        }
    });
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