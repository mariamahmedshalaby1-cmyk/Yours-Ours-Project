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

    // If all validation passes send to backend
    if (valid) {
        fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        })
        .then(res => res.json())
        .then(data => {
            if (data.token) {
                // Save token and user info in localStorage
                localStorage.setItem('token', data.token);
                localStorage.setItem('role', data.role);
                localStorage.setItem('userId', data.userId);
                localStorage.setItem('name', data.name);

                // Redirect based on role
                if (data.role === 'admin') {
                    window.location.href = '../admin/dashboard.html';
                } else if (data.role === 'professional') {
                    window.location.href = '../professional/dashboard.html';
                } else {
                    window.location.href = '../client/account.html';
                }
            } else {
                // Show error from backend
                document.getElementById('emailError').innerText = data.message;
            }
        })
        .catch(err => {
            document.getElementById('emailError').innerText = 'Something went wrong. Please try again.';
        });
    }

    return false;
}