function handleReset() {
    const password = document.getElementById('password').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();
    const errorMsg = document.getElementById('errorMsg');

    errorMsg.innerText = '';
    errorMsg.style.color = 'red';

    if (!password || !confirmPassword) {
        errorMsg.innerText = 'Please fill in both fields.';
        return false;
    }

    if (password.length < 6) {
        errorMsg.innerText = 'Password must be at least 6 characters.';
        return false;
    }

    if (password !== confirmPassword) {
        errorMsg.innerText = 'Passwords do not match.';
        return false;
    }

    // Get token from URL
    const token = new URLSearchParams(window.location.search).get('token');
    if (!token) {
        errorMsg.innerText = 'Invalid or missing reset token.';
        return false;
    }

    fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
    })
    .then(res => res.json())
    .then(data => {
        if (data.message === 'Password reset successful') {
            errorMsg.style.color = 'green';
            errorMsg.innerText = 'Password reset! Redirecting to login...';
            setTimeout(() => {
                window.location.href = '/html/landing-page/login.html';
            }, 2000);
        } else {
            errorMsg.innerText = data.message || 'Something went wrong.';
        }
    })
    .catch(() => {
        errorMsg.innerText = 'Something went wrong. Please try again.';
    });

    return false;
}