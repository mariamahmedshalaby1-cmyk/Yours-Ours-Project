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

    // If validation passes send to backend
    if (valid) {
        fetch('/api/auth/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        })
        .then(res => res.json())
        .then(data => {
            // Show success message no matter what
            document.getElementById('emailError').innerText = 'Check your inbox — if this email is registered, a reset link is on its way.';
            document.getElementById('emailError').style.color = 'green';
        })
        .catch(err => {
            document.getElementById('emailError').innerText = 'Something went wrong. Please try again.';
        });
    }

    return false;
}