function validateForm() {
    let valid = true;

    // Clear previous errors
    document.getElementById('nameError').innerText     = '';
    document.getElementById('emailError').innerText    = '';
    document.getElementById('phoneError').innerText    = '';
    document.getElementById('passwordError').innerText = '';
    document.getElementById('confirmError').innerText  = '';
    document.getElementById('roleError').innerText     = '';

    // Name validation
    const name = document.getElementById('name').value.trim();
    if (name.length < 2) {
        document.getElementById('nameError').innerText = 'Please enter your full name.';
        valid = false;
    }

    // Email validation
    const email = document.getElementById('email').value.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        document.getElementById('emailError').innerText = 'Please enter a valid email address.';
        valid = false;
    }

    // Phone validation
    const phone = document.getElementById('phone').value.trim();
    const phonePattern = /^\+?[0-9]{10,15}$/;
    if (!phonePattern.test(phone)) {
        document.getElementById('phoneError').innerText = 'Please enter a valid phone number.';
        valid = false;
    }

    // Password validation
    const password = document.getElementById('password').value.trim();
    if (password.length < 8) {
        document.getElementById('passwordError').innerText = 'Password must be at least 8 characters.';
        valid = false;
    }

    // Confirm password validation
    const confirm = document.getElementById('confirm').value.trim();
    if (confirm !== password) {
        document.getElementById('confirmError').innerText = 'Passwords do not match.';
        valid = false;
    }

    // Role validation
    const role = document.getElementById('role').value;
    if (!role) {
        document.getElementById('roleError').innerText = 'Please select your role.';
        valid = false;
    }

    // If all validation passes send to backend
    if (valid) {
        fetch('http://localhost:3000/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, phone, password, role })
        })
        .then(res => res.json())
        .then(data => {
            if (data.message === 'Account created successfully') {
                // Redirect to login page
                window.location.href = 'login.html';
            } else {
                // Show error from backend
                document.getElementById('emailError').innerText = data.message;
            }
        })
        .catch(err => {
            document.getElementById('emailError').innerText = 'Something went wrong. Please try again.';
        });
    }

    return false; // prevent default form submit
}