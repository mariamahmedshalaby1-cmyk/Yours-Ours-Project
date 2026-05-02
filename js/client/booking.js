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