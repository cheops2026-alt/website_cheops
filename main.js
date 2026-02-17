// Navigation functionality
document.addEventListener('DOMContentLoaded', function () {
    // Get all navigation links and sections
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');

    // Function to highlight active nav link
    function setActiveNav(sectionId) {
        navLinks.forEach(link => {
            link.classList.remove('active');
        });
        const targetLink = document.querySelector(`a[href="#${sectionId}"]`);
        if (targetLink) {
            targetLink.classList.add('active');
        }
    }

    // Make sure all sections are visible for normal page scrolling.
    sections.forEach(section => {
        section.classList.add('active-section');
    });

    // Smooth scroll for in-page anchor links (home buttons + nav links).
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            const target = href ? document.querySelector(href) : null;
            if (!target) {
                return;
            }
            e.preventDefault();
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            if (target.id) {
                setActiveNav(target.id);
                history.pushState(null, '', `#${target.id}`);
            }
        });
    });

    // Keep nav state in sync while scrolling.
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                setActiveNav(entry.target.id);
            }
        });
    }, {
        threshold: 0.45
    });
    sections.forEach((section) => sectionObserver.observe(section));

    // Handle initial load - scroll to hash if present.
    const initialSection = window.location.hash.substring(1) || 'home';
    const initialTarget = document.getElementById(initialSection);
    if (initialTarget) {
        setActiveNav(initialSection);
        if (window.location.hash) {
            setTimeout(() => {
                initialTarget.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }, 50);
        }
    }

    // Handle browser back/forward buttons
    window.addEventListener('popstate', function () {
        const section = window.location.hash.substring(1) || 'home';
        const target = document.getElementById(section);
        if (target) {
            setActiveNav(section);
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });

    // Language toggle functionality
    const langToggle = document.getElementById('langToggle');
    const currentLang = document.getElementById('currentLang');
    let isEnglish = true;

    // Function to update language
    function updateLanguage() {
        const elements = document.querySelectorAll('[data-en], [data-ar]');
        const lang = isEnglish ? 'en' : 'ar';

        elements.forEach(element => {
            const text = element.getAttribute(`data-${lang}`);
            if (text) {
                if (element.tagName === 'INPUT' && element.hasAttribute('placeholder')) {
                    element.setAttribute('placeholder', text);
                } else {
                    element.textContent = text;
                }
            }
        });

        // Update button text
        currentLang.textContent = isEnglish ? 'EN' : 'AR';

        // Toggle body class for RTL support
        document.body.classList.toggle('rtl', !isEnglish);
    }

    // Language toggle click handler
    if (langToggle) {
        langToggle.addEventListener('click', function () {
            isEnglish = !isEnglish;
            updateLanguage();
        });
    }

    // Contact form functionality
    const contactForm = document.getElementById('contactForm');
    const sendEmailBtn = document.getElementById('sendEmail');
    const sendWhatsAppBtn = document.getElementById('sendWhatsApp');
    const contactMessage = document.getElementById('contactMessage');

    // Send via Email
    if (sendEmailBtn) {
        sendEmailBtn.addEventListener('click', function () {
            const name = document.getElementById('contactName').value.trim();
            const email = document.getElementById('contactEmail').value.trim();
            const message = document.getElementById('contactMessage').value.trim();

            if (!name || !email || !message) {
                showContactMessage('Please fill in all fields', 'error');
                return;
            }

            const subject = encodeURIComponent('Contact from Cheops Team Website');
            const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
            const mailtoLink = `mailto:cheops2026@gmail.com?subject=${subject}&body=${body}`;

            window.location.href = mailtoLink;
            showContactMessage('Opening email client...', 'success');
        });
    }

    // Send via WhatsApp
    if (sendWhatsAppBtn) {
        sendWhatsAppBtn.addEventListener('click', function () {
            const name = document.getElementById('contactName').value.trim();
            const email = document.getElementById('contactEmail').value.trim();
            const message = document.getElementById('contactMessage').value.trim();

            if (!name || !email || !message) {
                showContactMessage('Please fill in all fields', 'error');
                return;
            }

            const whatsappMessage = encodeURIComponent(`*Contact from Cheops Team Website*\n\n*Name:* ${name}\n*Email:* ${email}\n\n*Message:*\n${message}`);
            const whatsappLink = `https://wa.me/201070075480?text=${whatsappMessage}`; // Replace with actual WhatsApp number

            window.open(whatsappLink, '_blank');
            showContactMessage('Opening WhatsApp...', 'success');
        });
    }

    // Function to show contact messages
    function showContactMessage(text, type) {
        if (contactMessage) {
            contactMessage.textContent = text;
            contactMessage.className = `contact-feedback ${type}`;
            contactMessage.style.display = 'block';

            setTimeout(() => {
                contactMessage.style.display = 'none';
            }, 3000);
        }
    }

    // Add animation delays to team members
    const teamMembers = document.querySelectorAll('.team-member');
    teamMembers.forEach((member, index) => {
        member.style.animationDelay = `${index * 0.1}s`;
    });
});


