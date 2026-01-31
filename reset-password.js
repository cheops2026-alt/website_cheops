// Firebase Configuration for Password Reset
import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js';
import { 
    getAuth, 
    sendPasswordResetEmail
} from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js';

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

// Reset Password Function
document.getElementById('resetBtn').addEventListener('click', async () => {
    const email = document.getElementById('resetEmail').value;
    const messageElement = document.getElementById('resetMessage');
    const resetBtn = document.getElementById('resetBtn');

    if (!email) {
        showMessage(messageElement, 'Please enter your email address', 'error');
        return;
    }

    // Disable button and show loading state
    resetBtn.disabled = true;
    resetBtn.textContent = 'Sending...';

    try {
        await sendPasswordResetEmail(auth, email);
        showMessage(
            messageElement, 
            'Password reset link sent! Check your email inbox.', 
            'success'
        );
        
        // Clear the input field
        document.getElementById('resetEmail').value = '';
        
        // Redirect to login page after 3 seconds
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 3000);
    } catch (error) {
        handleResetError(error, messageElement);
    } finally {
        // Re-enable button
        resetBtn.disabled = false;
        resetBtn.textContent = 'Send Reset Link';
    }
});

// Error handling
function handleResetError(error, messageElement) {
    let message = 'An error occurred. Please try again.';
    
    switch (error.code) {
        case 'auth/invalid-email':
            message = 'Invalid email address.';
            break;
        case 'auth/user-not-found':
            message = 'No account found with this email address.';
            break;
        case 'auth/too-many-requests':
            message = 'Too many requests. Please try again later.';
            break;
    }
    
    showMessage(messageElement, message, 'error');
}

// Show message
function showMessage(element, message, type) {
    element.textContent = message;
    element.style.display = 'block';
    if (type === 'success') {
        element.className = 'text-success mt-3';
        element.style.color = '#51cf66';
    } else {
        element.className = 'text-danger mt-3';
        element.style.color = '#ff6b6b';
    }
    element.style.fontSize = '14px';
}

