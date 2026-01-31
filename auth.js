// Firebase Configuration for Cheops Project
import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js';
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    updateProfile
} from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js';
import { 
    getFirestore, 
    doc, 
    setDoc 
} from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC28sbqBffQQRNsv7DAckYTISBQmm82V-Q",
    authDomain: "cheops-26.firebaseapp.com",
    projectId: "cheops-26",
    storageBucket: "cheops-26.firebasestorage.app",
    messagingSenderId: "277043348468",
    appId: "1:277043348468:web:bc8fae2c84203914cdefa1",
    measurementId: "G-3BNYBLE2KL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Sign Up Function
document.getElementById('signUpBtn').addEventListener('click', async () => {
    const email = document.getElementById('signUpEmail').value.trim();
    const password = document.getElementById('signUpPassword').value;
    const name = document.getElementById('signUpName').value.trim();
    const phone = document.getElementById('signUpPhone').value.trim();
    const errorElement = document.getElementById('signUpError');

    // Clear previous error messages
    errorElement.style.display = 'none';

    if (!email || !password || !name || !phone) {
        showError(errorElement, 'Please fill in all fields');
        return;
    }

    if (password.length < 6) {
        showError(errorElement, 'Password must be at least 6 characters');
        return;
    }

    try {
        // Create user account
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Update user profile with name
        await updateProfile(user, {
            displayName: name
        });

        // Store additional user data in Firestore
        await setDoc(doc(db, 'users', user.uid), {
            name: name,
            email: email,
            phone: phone,
            createdAt: new Date().toISOString()
        });

        // Store credentials temporarily for auto sign-in
        sessionStorage.setItem('tempEmail', email);
        sessionStorage.setItem('tempPassword', password);

        // Switch to sign-in page
        document.getElementById('reg-log').checked = false;
        
        // Auto sign-in after a short delay
        setTimeout(() => {
            autoSignIn();
        }, 500);

        showSuccess(errorElement, 'Account created! Signing you in...');
    } catch (error) {
        handleAuthError(error, errorElement);
    }
});

// Sign In Function
document.getElementById('signInBtn').addEventListener('click', async () => {
    const email = document.getElementById('signInEmail').value.trim();
    const password = document.getElementById('signInPassword').value;
    const errorElement = document.getElementById('signInError');

    // Clear previous error messages
    errorElement.style.display = 'none';

    if (!email || !password) {
        showError(errorElement, 'Please fill in all fields');
        return;
    }

    if (password.length < 6) {
        showError(errorElement, 'Password must be at least 6 characters');
        return;
    }

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        showSuccess(errorElement, 'Sign in successful!');

        // Redirect to home page after 1 second
        setTimeout(() => {
            window.location.href = 'home.html';
        }, 1000);
    } catch (error) {
        handleAuthError(error, errorElement);
    }
});

// Auto Sign-In Function (after registration)
async function autoSignIn() {
    const email = sessionStorage.getItem('tempEmail');
    const password = sessionStorage.getItem('tempPassword');
    const errorElement = document.getElementById('signInError');

    if (email && password) {
        // Clear temporary credentials
        sessionStorage.removeItem('tempEmail');
        sessionStorage.removeItem('tempPassword');

        // Auto-fill sign-in form
        document.getElementById('signInEmail').value = email;
        document.getElementById('signInPassword').value = password;

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            showSuccess(errorElement, 'Signed in successfully!');

            // Redirect to home page after 1 second
            setTimeout(() => {
                window.location.href = 'home.html';
            }, 1000);
        } catch (error) {
            handleAuthError(error, errorElement);
        }
    }
}

// Error handling
function handleAuthError(error, errorElement) {
    let message = 'An error occurred. Please try again.';
    
    switch (error.code) {
        case 'auth/email-already-in-use':
            message = 'This email is already registered.';
            break;
        case 'auth/invalid-email':
            message = 'Invalid email address.';
            break;
        case 'auth/weak-password':
            message = 'Password must be at least 6 characters.';
            break;
        case 'auth/user-not-found':
            message = 'Incorrect email or password.';
            break;
        case 'auth/wrong-password':
            message = 'Incorrect email or password.';
            break;
        case 'auth/invalid-credential':
            message = 'Incorrect email or password.';
            break;
        case 'auth/invalid-login-credentials':
            message = 'Incorrect email or password.';
            break;
        case 'auth/user-disabled':
            message = 'This account has been disabled.';
            break;
        case 'auth/too-many-requests':
            message = 'Too many attempts. Please try again later.';
            break;
        case 'auth/network-request-failed':
            message = 'Network error. Check your connection.';
            break;
    }
    
    showError(errorElement, message);
}

// Show error message
function showError(element, message) {
    element.textContent = message;
    element.style.display = 'block';
    element.className = 'text-danger mt-2';
    element.style.color = '#ff6b6b';
}

// Show success message
function showSuccess(element, message) {
    element.textContent = message;
    element.style.display = 'block';
    element.className = 'text-success mt-2';
    element.style.color = '#51cf66';
}

