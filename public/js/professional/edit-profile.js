
function showFileName(input) {
    var label = document.getElementById("file-label");
    if (input.files && input.files[0]) {
        label.textContent = input.files[0].name;
    } else {
        label.textContent = "Choose a photo";
    }
}

function showNationalIdName(input) {
    var label = document.getElementById("file-name-display");
    if (input.files && input.files[0]) {
        label.textContent = input.files[0].name;
    } else {
        label.textContent = "No file chosen";
    }
}

function toggleMenu() {
    var m = document.getElementById("mobile-menu");
    var b = document.getElementById("hamburger");
    if (m) m.classList.toggle("open");
    if (b) b.classList.toggle("open");
}

const token = localStorage.getItem('token');
const userId = localStorage.getItem('userId');

if (!token || !userId) {
    window.location.href = '/html/landing-page/login.html';
}

// Load existing professional data into the form
async function loadProfile() {
    try {
        const res = await fetch(`/api/professionals/user/${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) return; // No profile yet, form stays empty

        const pro = await res.json();

        document.querySelector('[name="fullname"]').value        = pro.fullName || '';
        document.querySelector('[name="email"]').value           = pro.email || '';
        document.querySelector('[name="phone"]').value           = pro.phone || '';
        document.querySelector('[name="specialty"]').value       = pro.specialty || '';
        document.querySelector('[name="experience_years"]').value = pro.experienceYears || '';
        document.querySelector('[name="bio"]').value             = pro.bio || '';
        document.querySelector('[name="city"]').value            = pro.city || '';
        document.querySelector('[name="profile_picture_url"]').value = pro.profilePicture || '';
        document.querySelector('[name="starting_fee"]').value    = pro.startingFee || '';

        // Check the right service checkboxes
        document.querySelectorAll('[name="service"]').forEach(function(checkbox) {
            checkbox.checked = pro.services && pro.services.includes(checkbox.value);
        });

    } catch (err) {
        console.error('Could not load profile:', err);
    }
}

loadProfile();

// Handle Save Changes
document.querySelector('form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const fullName       = document.querySelector('[name="fullname"]').value.trim();
    const email          = document.querySelector('[name="email"]').value.trim();
    const phone          = document.querySelector('[name="phone"]').value.trim();
    const specialty      = document.querySelector('[name="specialty"]').value;
    const experienceYears = document.querySelector('[name="experience_years"]').value;
    const bio            = document.querySelector('[name="bio"]').value.trim();
const services       = Array.from(document.querySelectorAll('[name="service"]:checked')).map(cb => cb.value);
const city           = document.querySelector('[name="city"]').value.trim();
const profilePicture = document.querySelector('[name="profile_picture_url"]').value.trim();
const startingFee    = parseInt(document.querySelector('[name="starting_fee"]').value) || 0;

if (!fullName || !email || !specialty) {
    alert('Please fill in your name, email, and specialty.');
    return;
}

    try {
        // First check if professional record exists
        const checkRes = await fetch(`/api/professionals/user/${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        let res;

        if (checkRes.ok) {
            // Professional record exists — update it
            const pro = await checkRes.json();
            res = await fetch(`/api/professionals/${pro._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
               body: JSON.stringify({ fullName, email, phone, profilePicture, specialty, experienceYears, services, bio, city, startingFee })
            });
        } else {
            // No professional record yet — create it
            res = await fetch('/api/professionals', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ fullName, email, phone, profilePicture, specialty, experienceYears, services, bio, userId, city, startingFee })
            });
        }

       const btn = document.querySelector('[type="submit"]');
        if (res.ok) {
            btn.value = '✅ Saved!';
            btn.style.backgroundColor = 'green';
            setTimeout(() => {
                btn.value = 'Save Changes';
                btn.style.backgroundColor = '';
            }, 3000);
        } else {
            const data = await res.json();
            btn.value = '❌ Error saving';
            btn.style.backgroundColor = 'red';
            setTimeout(() => {
                btn.value = 'Save Changes';
                btn.style.backgroundColor = '';
            }, 3000);
        }

    } catch (err) {
        alert('Something went wrong. Please try again.');
    }
});
