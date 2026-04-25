 function validateForm() {
        let valid = true;

        // Clear previous errors
        document.getElementById('emailError').innerText    = '';
        document.getElementById('passwordError').innerText = '';

        // Email validation
        const email = document.getElementById('email').value.trim();
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            document.getElementById('emailError').innerText = 'Please enter a valid email address.';
            valid = false;
        }

        // Password validation
        const password = document.getElementById('password').value.trim();
        if (password.length < 8) {
            document.getElementById('passwordError').innerText = 'Password must be at least 8 characters.';
            valid = false;
        }

        return valid;
    }