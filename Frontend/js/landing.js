document.addEventListener('DOMContentLoaded', () => {

    // ==================== TAB SWITCHING ====================
    const tabBtns = document.querySelectorAll('.tab-btn');
    const heroTitle = document.getElementById('heroTitle');
    const heroSubtitle = document.getElementById('heroSubtitle');
    const heroBadge = document.getElementById('heroBadge');
    const badgeText = document.getElementById('badgeText');

    const tabContent = {
        student: {
            badge: 'AI-Powered Learning',
            title: 'Meet GhulamNote AI<br>and ace your exams',
            subtitle: 'Be better prepared for your exams and score higher ✨'
        },
        teacher: {
            badge: 'Teaching Made Easy',
            title: 'Empower your classroom<br>with GhulamNote',
            subtitle: 'Create, share, and manage study materials effortlessly 📚'
        },
        researcher: {
            badge: 'Research Intelligence',
            title: 'Accelerate your research<br>with AI insights',
            subtitle: 'Analyze papers, extract key findings, and organize notes 🔬'
        },
        institution: {
            badge: 'Enterprise Ready',
            title: 'Scale learning across<br>your institution',
            subtitle: 'Centralized knowledge management for teams and departments 🏫'
        }
    };

    let isAnimating = false;

    function switchTab(tabName) {
        if (isAnimating) return;

        const content = tabContent[tabName];
        if (!content) return;

        isAnimating = true;

        // Fade out
        heroTitle.style.opacity = '0';
        heroTitle.style.transform = 'translateY(12px)';
        heroSubtitle.style.opacity = '0';
        heroSubtitle.style.transform = 'translateY(8px)';
        heroBadge.style.opacity = '0';
        heroBadge.style.transform = 'translateY(-8px)';

        setTimeout(() => {
            // Update content
            badgeText.textContent = content.badge;
            heroTitle.innerHTML = content.title;
            heroSubtitle.textContent = content.subtitle;

            // Fade in
            setTimeout(() => {
                heroBadge.style.opacity = '1';
                heroBadge.style.transform = 'translateY(0)';
                heroTitle.style.opacity = '1';
                heroTitle.style.transform = 'translateY(0)';
                heroSubtitle.style.opacity = '1';
                heroSubtitle.style.transform = 'translateY(0)';
                isAnimating = false;
            }, 50);
        }, 350);
    }

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active from all
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Switch content
            const tab = btn.dataset.tab;
            switchTab(tab);
        });
    });

    // ==================== NAVBAR SCROLL EFFECT ====================
    const navbar = document.getElementById('navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;

        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    }, { passive: true });

    // ==================== MOCKUP IMAGE HANDLING ====================
    const mockupImg = document.getElementById('mockupImg');
    const mockupFallback = document.getElementById('mockupFallback');

    if (mockupImg) {
        mockupImg.onload = function () {
            this.classList.add('loaded');
            if (mockupFallback) {
                mockupFallback.classList.add('hidden');
            }
        };

        mockupImg.onerror = function () {
            this.style.display = 'none';
            if (mockupFallback) {
                mockupFallback.style.display = 'flex';
            }
        };
    }

    // ==================== INTERSECTION OBSERVER FOR ANIMATIONS ====================
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const animateOnScroll = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                animateOnScroll.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe feature cards
    document.querySelectorAll('.bento-card, .cta-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(24px)';
        el.style.transition = 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        animateOnScroll.observe(el);
    });

    // Observe trusted logos
    document.querySelectorAll('.logo-item').forEach((el, i) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(16px)';
        el.style.transition = `opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1) ${i * 0.1}s, transform 0.5s cubic-bezier(0.4, 0, 0.2, 1) ${i * 0.1}s`;
        animateOnScroll.observe(el);
    });

    // ==================== MOBILE TOGGLE ====================
    const mobileToggle = document.getElementById('mobileToggle');
    const navCenter = document.querySelector('.nav-center');

    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            navCenter.classList.toggle('mobile-open');
            mobileToggle.classList.toggle('active');
        });
    }

    // ==================== SMOOTH SCROLL FOR LEARN MORE ====================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // ==================== SYNC ANIMATION ====================
    const syncDots = document.querySelectorAll('.sync-dot');
    if (syncDots.length >= 2) {
        setInterval(() => {
            syncDots[0].classList.toggle('active');
            syncDots[1].classList.toggle('active');
        }, 2000);
    }

});
