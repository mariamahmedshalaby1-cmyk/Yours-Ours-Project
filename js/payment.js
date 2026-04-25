document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get('type');

    const pageTitle = document.getElementById('page-title');
    const pageSubtitle = document.getElementById('page-subtitle');
    const emailGroup = document.getElementById('recipient-email-group');
    if (pageTitle && pageSubtitle) {
        if (type === 'giftcard') {
            pageTitle.innerText = "Gift Card Checkout";
            pageSubtitle.innerText = "We'll email the digital card directly to the recipient.";
            if (emailGroup) emailGroup.classList.remove('hidden'); 
        } else if (type === 'pricing') {
            pageTitle.innerText = "Pro Subscription Checkout";
            pageSubtitle.innerText = "Upgrade your account instantly.";
        }
    }
    const checkoutForm = document.getElementById('checkout-form');
    
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function(event) {
            event.preventDefault(); 

            let isValid = true;
            const email = document.getElementById('recipient-email');
            const name = document.getElementById('card-name');
            const card = document.getElementById('card-number');
            const expiry = document.getElementById('expiry');
            const cvc = document.getElementById('cvc');

            document.querySelectorAll('.error-message').forEach(el => el.style.display = 'none');
            if (type === 'giftcard') {
                if (email.value.trim() === '') {
                    document.getElementById('email-error').style.display = 'block';
                    isValid = false;
                }
            }
            if (name.value.trim() === '') {
                document.getElementById('name-error').style.display = 'block';
                isValid = false;
            }
            if (card.value.trim() === '') {
                document.getElementById('card-error').style.display = 'block';
                isValid = false;
            }
            if (expiry.value.trim() === '') {
                document.getElementById('expiry-error').style.display = 'block';
                isValid = false;
            }
            if (cvc.value.trim() === '') {
                document.getElementById('cvc-error').style.display = 'block';
                isValid = false;
            }
            if (isValid) {
                const btn = document.getElementById('confirm-btn');
                btn.innerText = "Processing...";
                btn.style.opacity = "0.7";
                setTimeout(() => {
                    document.getElementById('payment-form-section').classList.add('hidden');
                    document.getElementById('success-section').classList.remove('hidden');
                    
                    if(type === 'giftcard') {
                        document.getElementById('success-msg').innerText = `Gift card has been emailed to ${email.value}!`;
                    } else {
                        document.getElementById('success-msg').innerText = "Your Pro Subscription is now active!";
                    }
                }, 1500);
            }
        });
    }
});