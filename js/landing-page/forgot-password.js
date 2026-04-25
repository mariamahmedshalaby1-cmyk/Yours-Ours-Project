  function validateForm() {
        let valid = true;

        // Clear previous error
        document.getElementById('emailError').innerText = '';

        // Email validation
        const email = document.getElementById('email').value.trim();
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            document.getElementById('emailError').innerText = 'Please enter a valid email address.';
            valid = false;
        }

        return valid;
    }