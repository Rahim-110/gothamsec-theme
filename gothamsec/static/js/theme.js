/* ============================================
   GOTHAMSEC CTFd THEME - INTERACTIVE JAVASCRIPT
   Circuit Board Animation & Particle System
   ============================================ */

(function () {
    'use strict';

    // -------------------- CIRCUIT BOARD ANIMATION --------------------
    class CircuitBoard {
        constructor(canvas) {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            this.nodes = [];
            this.connections = [];
            this.particles = [];
            this.animationId = null;

            this.colors = {
                cyan: '#00d9ff',
                purple: '#b026ff',
                cyanGlow: 'rgba(0, 217, 255, 0.5)',
                purpleGlow: 'rgba(176, 38, 255, 0.5)'
            };

            this.init();
        }

        init() {
            this.resize();
            this.generateCircuit();
            this.animate();

            window.addEventListener('resize', () => this.resize());
        }

        resize() {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.generateCircuit();
        }

        generateCircuit() {
            this.nodes = [];
            this.connections = [];

            // Generate nodes in a grid pattern with some randomness
            const spacing = 80;
            const cols = Math.ceil(this.canvas.width / spacing) + 1;
            const rows = Math.ceil(this.canvas.height / spacing) + 1;

            for (let i = 0; i < cols; i++) {
                for (let j = 0; j < rows; j++) {
                    if (Math.random() > 0.7) {
                        this.nodes.push({
                            x: i * spacing + (Math.random() - 0.5) * 30,
                            y: j * spacing + (Math.random() - 0.5) * 30,
                            radius: Math.random() * 2 + 2,
                            type: Math.random() > 0.5 ? 'cyan' : 'purple',
                            pulse: Math.random() * Math.PI * 2
                        });
                    }
                }
            }

            // Generate connections between nearby nodes
            for (let i = 0; i < this.nodes.length; i++) {
                for (let j = i + 1; j < this.nodes.length; j++) {
                    const dx = this.nodes[i].x - this.nodes[j].x;
                    const dy = this.nodes[i].y - this.nodes[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < spacing * 2 && Math.random() > 0.6) {
                        this.connections.push({
                            from: i,
                            to: j,
                            progress: 0,
                            speed: 0.002 + Math.random() * 0.003,
                            type: this.nodes[i].type,
                            active: false,
                            delay: Math.random() * 5000
                        });
                    }
                }
            }

            // Generate particles
            this.particles = [];
            for (let i = 0; i < 30; i++) {
                this.createParticle();
            }
        }

        createParticle() {
            if (this.connections.length === 0) return;

            const connectionIndex = Math.floor(Math.random() * this.connections.length);
            this.particles.push({
                connectionIndex,
                progress: 0,
                speed: 0.005 + Math.random() * 0.01,
                size: Math.random() * 3 + 1,
                type: this.connections[connectionIndex].type
            });
        }

        drawNode(node, time) {
            const pulseScale = 1 + Math.sin(time * 0.003 + node.pulse) * 0.3;
            const color = node.type === 'cyan' ? this.colors.cyan : this.colors.purple;
            const glow = node.type === 'cyan' ? this.colors.cyanGlow : this.colors.purpleGlow;

            // Glow
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, node.radius * pulseScale * 3, 0, Math.PI * 2);
            const gradient = this.ctx.createRadialGradient(
                node.x, node.y, 0,
                node.x, node.y, node.radius * pulseScale * 3
            );
            gradient.addColorStop(0, glow);
            gradient.addColorStop(1, 'transparent');
            this.ctx.fillStyle = gradient;
            this.ctx.fill();

            // Core
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, node.radius * pulseScale, 0, Math.PI * 2);
            this.ctx.fillStyle = color;
            this.ctx.fill();
        }

        drawConnection(connection, index) {
            const from = this.nodes[connection.from];
            const to = this.nodes[connection.to];

            // Create path with circuit-style angles
            const midX = (from.x + to.x) / 2;
            const midY = (from.y + to.y) / 2;

            // Draw line
            this.ctx.beginPath();
            this.ctx.moveTo(from.x, from.y);

            // Add angular path
            if (Math.abs(to.x - from.x) > Math.abs(to.y - from.y)) {
                this.ctx.lineTo(midX, from.y);
                this.ctx.lineTo(midX, to.y);
            } else {
                this.ctx.lineTo(from.x, midY);
                this.ctx.lineTo(to.x, midY);
            }

            this.ctx.lineTo(to.x, to.y);

            const color = connection.type === 'cyan' ? this.colors.cyan : this.colors.purple;
            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = 1;
            this.ctx.globalAlpha = 0.3;
            this.ctx.stroke();
            this.ctx.globalAlpha = 1;
        }

        drawParticle(particle) {
            const connection = this.connections[particle.connectionIndex];
            if (!connection) return;

            const from = this.nodes[connection.from];
            const to = this.nodes[connection.to];

            // Calculate position along path
            const midX = (from.x + to.x) / 2;
            const midY = (from.y + to.y) / 2;

            let x, y;
            const progress = particle.progress;

            if (Math.abs(to.x - from.x) > Math.abs(to.y - from.y)) {
                if (progress < 0.33) {
                    x = from.x + (midX - from.x) * (progress / 0.33);
                    y = from.y;
                } else if (progress < 0.66) {
                    x = midX;
                    y = from.y + (to.y - from.y) * ((progress - 0.33) / 0.33);
                } else {
                    x = midX + (to.x - midX) * ((progress - 0.66) / 0.34);
                    y = to.y;
                }
            } else {
                if (progress < 0.33) {
                    x = from.x;
                    y = from.y + (midY - from.y) * (progress / 0.33);
                } else if (progress < 0.66) {
                    x = from.x + (to.x - from.x) * ((progress - 0.33) / 0.33);
                    y = midY;
                } else {
                    x = to.x;
                    y = midY + (to.y - midY) * ((progress - 0.66) / 0.34);
                }
            }

            const color = particle.type === 'cyan' ? this.colors.cyan : this.colors.purple;
            const glow = particle.type === 'cyan' ? this.colors.cyanGlow : this.colors.purpleGlow;

            // Draw glow
            this.ctx.beginPath();
            this.ctx.arc(x, y, particle.size * 4, 0, Math.PI * 2);
            const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, particle.size * 4);
            gradient.addColorStop(0, glow);
            gradient.addColorStop(1, 'transparent');
            this.ctx.fillStyle = gradient;
            this.ctx.fill();

            // Draw core
            this.ctx.beginPath();
            this.ctx.arc(x, y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = color;
            this.ctx.fill();
        }

        update() {
            // Update particles
            for (let i = this.particles.length - 1; i >= 0; i--) {
                this.particles[i].progress += this.particles[i].speed;

                if (this.particles[i].progress >= 1) {
                    this.particles.splice(i, 1);
                    this.createParticle();
                }
            }
        }

        draw(time) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            // Draw connections
            this.connections.forEach((connection, index) => {
                this.drawConnection(connection, index);
            });

            // Draw nodes
            this.nodes.forEach(node => {
                this.drawNode(node, time);
            });

            // Draw particles
            this.particles.forEach(particle => {
                this.drawParticle(particle);
            });
        }

        animate() {
            const time = performance.now();
            this.update();
            this.draw(time);
            this.animationId = requestAnimationFrame(() => this.animate());
        }

        destroy() {
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
            }
        }
    }

    // -------------------- PARTICLE SYSTEM --------------------
    class ParticleSystem {
        constructor(canvas) {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            this.particles = [];
            this.animationId = null;

            this.init();
        }

        init() {
            this.resize();
            this.createParticles();
            this.animate();

            window.addEventListener('resize', () => this.resize());
        }

        resize() {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }

        createParticles() {
            this.particles = [];
            const count = Math.floor((this.canvas.width * this.canvas.height) / 15000);

            for (let i = 0; i < count; i++) {
                this.particles.push({
                    x: Math.random() * this.canvas.width,
                    y: Math.random() * this.canvas.height,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    size: Math.random() * 2 + 0.5,
                    opacity: Math.random() * 0.5 + 0.2,
                    type: Math.random() > 0.5 ? 'cyan' : 'purple'
                });
            }
        }

        update() {
            this.particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;

                // Wrap around edges
                if (p.x < 0) p.x = this.canvas.width;
                if (p.x > this.canvas.width) p.x = 0;
                if (p.y < 0) p.y = this.canvas.height;
                if (p.y > this.canvas.height) p.y = 0;
            });
        }

        draw() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            this.particles.forEach(p => {
                const color = p.type === 'cyan' ? `rgba(0, 217, 255, ${p.opacity})` : `rgba(176, 38, 255, ${p.opacity})`;

                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.ctx.fillStyle = color;
                this.ctx.fill();
            });

            // Draw connections between close particles
            this.ctx.strokeStyle = 'rgba(0, 217, 255, 0.1)';
            this.ctx.lineWidth = 0.5;

            for (let i = 0; i < this.particles.length; i++) {
                for (let j = i + 1; j < this.particles.length; j++) {
                    const dx = this.particles[i].x - this.particles[j].x;
                    const dy = this.particles[i].y - this.particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 100) {
                        this.ctx.beginPath();
                        this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                        this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                        this.ctx.globalAlpha = (100 - distance) / 100 * 0.2;
                        this.ctx.stroke();
                        this.ctx.globalAlpha = 1;
                    }
                }
            }
        }

        animate() {
            this.update();
            this.draw();
            this.animationId = requestAnimationFrame(() => this.animate());
        }

        destroy() {
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
            }
        }
    }

    // -------------------- NAVIGATION --------------------
    function initNavigation() {
        const navbar = document.querySelector('.navbar');
        const navbarToggle = document.querySelector('.navbar-toggle');
        const navbarNav = document.querySelector('.navbar-nav');

        // Scroll behavior
        if (navbar) {
            window.addEventListener('scroll', () => {
                if (window.scrollY > 50) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
            });
        }

        // Mobile menu toggle
        if (navbarToggle && navbarNav) {
            navbarToggle.addEventListener('click', () => {
                navbarToggle.classList.toggle('active');
                navbarNav.classList.toggle('active');
            });

            // Close menu on link click
            navbarNav.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', () => {
                    navbarToggle.classList.remove('active');
                    navbarNav.classList.remove('active');
                });
            });
        }
    }

    // -------------------- BUTTON EFFECTS --------------------
    function initButtonEffects() {
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('click', function (e) {
                // Ripple effect
                const ripple = document.createElement('span');
                ripple.classList.add('btn-ripple');

                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;

                ripple.style.cssText = `
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    left: ${x}px;
                    top: ${y}px;
                    background: rgba(255, 255, 255, 0.3);
                    border-radius: 50%;
                    transform: scale(0);
                    animation: ripple 0.6s ease-out;
                    pointer-events: none;
                `;

                this.style.position = 'relative';
                this.style.overflow = 'hidden';
                this.appendChild(ripple);

                setTimeout(() => ripple.remove(), 600);
            });
        });

        // Add ripple keyframe if not exists
        if (!document.querySelector('#gth-ripple-style')) {
            const style = document.createElement('style');
            style.id = 'gth-ripple-style';
            style.textContent = `
                @keyframes ripple {
                    to {
                        transform: scale(4);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // -------------------- SMOOTH SCROLL --------------------
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;

                const target = document.querySelector(targetId);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // -------------------- LOADING SCREEN --------------------
    function initLoadingScreen() {
        const loadingScreen = document.querySelector('.loading-screen');

        if (loadingScreen) {
            const hideLoadingScreen = () => {
                setTimeout(() => {
                    loadingScreen.classList.add('hidden');
                    setTimeout(() => {
                        loadingScreen.remove();
                    }, 500);
                }, 500);
            };

            // If page already loaded, hide immediately
            if (document.readyState === 'complete') {
                hideLoadingScreen();
            } else {
                window.addEventListener('load', hideLoadingScreen);
            }

            // Fallback: Always hide after 3 seconds max
            setTimeout(() => {
                if (loadingScreen && loadingScreen.parentNode) {
                    loadingScreen.classList.add('hidden');
                    setTimeout(() => {
                        if (loadingScreen.parentNode) loadingScreen.remove();
                    }, 500);
                }
            }, 3000);
        }
    }

    // -------------------- TOAST NOTIFICATIONS --------------------
    window.GothamSecToast = {
        container: null,

        init() {
            if (!this.container) {
                this.container = document.createElement('div');
                this.container.className = 'toast-container';
                document.body.appendChild(this.container);
            }
        },

        show(message, type = 'info', duration = 5000) {
            this.init();

            const toast = document.createElement('div');
            toast.className = `toast ${type}`;

            const icons = {
                success: '✓',
                error: '✕',
                warning: '⚠',
                info: 'ℹ'
            };

            toast.innerHTML = `
                <span class="toast-icon">${icons[type] || icons.info}</span>
                <span class="toast-message">${message}</span>
                <button class="toast-close">×</button>
            `;

            this.container.appendChild(toast);

            // Close button
            toast.querySelector('.toast-close').addEventListener('click', () => {
                this.hide(toast);
            });

            // Auto hide
            if (duration > 0) {
                setTimeout(() => this.hide(toast), duration);
            }

            return toast;
        },

        hide(toast) {
            toast.style.animation = 'fadeInUp 0.3s ease reverse';
            setTimeout(() => toast.remove(), 300);
        },

        success(message, duration) {
            return this.show(message, 'success', duration);
        },

        error(message, duration) {
            return this.show(message, 'error', duration);
        },

        warning(message, duration) {
            return this.show(message, 'warning', duration);
        }
    };

    // -------------------- MODAL SYSTEM --------------------
    window.GothamSecModal = {
        show(modalId) {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        },

        hide(modalId) {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }
        },

        init() {
            // Close on overlay click
            document.querySelectorAll('.modal-overlay').forEach(overlay => {
                overlay.addEventListener('click', (e) => {
                    if (e.target === overlay) {
                        overlay.classList.remove('active');
                        document.body.style.overflow = '';
                    }
                });
            });

            // Close buttons
            document.querySelectorAll('.modal-close').forEach(btn => {
                btn.addEventListener('click', () => {
                    const modal = btn.closest('.modal-overlay');
                    if (modal) {
                        modal.classList.remove('active');
                        document.body.style.overflow = '';
                    }
                });
            });

            // ESC key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    const activeModal = document.querySelector('.modal-overlay.active');
                    if (activeModal) {
                        activeModal.classList.remove('active');
                        document.body.style.overflow = '';
                    }
                }
            });
        }
    };

    // -------------------- CHALLENGE INTERACTIONS --------------------
    function initChallengeCards() {
        document.querySelectorAll('.challenge-card').forEach(card => {
            // Add corner elements
            if (!card.querySelector('.corner-br')) {
                const corner = document.createElement('div');
                corner.className = 'corner-br';
                card.appendChild(corner);
            }
        });
    }

    // -------------------- FORM VALIDATION --------------------
    function initFormValidation() {
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', function (e) {
                let isValid = true;

                this.querySelectorAll('[required]').forEach(input => {
                    if (!input.value.trim()) {
                        isValid = false;
                        input.classList.add('is-invalid');

                        // Shake animation
                        input.style.animation = 'shake 0.5s ease';
                        setTimeout(() => {
                            input.style.animation = '';
                        }, 500);
                    } else {
                        input.classList.remove('is-invalid');
                    }
                });

                if (!isValid) {
                    e.preventDefault();
                    GothamSecToast.error('Please fill in all required fields');
                }
            });

            // Remove error state on input
            form.querySelectorAll('.form-control').forEach(input => {
                input.addEventListener('input', () => {
                    input.classList.remove('is-invalid');
                });
            });
        });
    }

    // -------------------- TYPING EFFECT --------------------
    window.GothamSecTyping = {
        type(element, text, speed = 50) {
            return new Promise(resolve => {
                element.textContent = '';
                let i = 0;

                const interval = setInterval(() => {
                    if (i < text.length) {
                        element.textContent += text.charAt(i);
                        i++;
                    } else {
                        clearInterval(interval);
                        resolve();
                    }
                }, speed);
            });
        }
    };

    // -------------------- INTERSECTION OBSERVER --------------------
    function initScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-fade-in-up');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        document.querySelectorAll('.challenge-card, .card, .glass-panel').forEach(el => {
            el.style.opacity = '0';
            observer.observe(el);
        });
    }

    // -------------------- SCOREBOARD UPDATES --------------------
    function initScoreboard() {
        // Add rank classes to rows
        const scoreboardRows = document.querySelectorAll('.scoreboard-table tbody tr');
        scoreboardRows.forEach((row, index) => {
            if (index === 0) row.classList.add('rank-1');
            if (index === 1) row.classList.add('rank-2');
            if (index === 2) row.classList.add('rank-3');
        });
    }

    // -------------------- INITIALIZE CANVAS BACKGROUNDS --------------------
    function initCanvasBackgrounds() {
        // Circuit board canvas
        const circuitCanvas = document.getElementById('circuit-canvas');
        if (circuitCanvas) {
            new CircuitBoard(circuitCanvas);
        }

        // Particle canvas
        const particleCanvas = document.getElementById('particle-canvas');
        if (particleCanvas) {
            new ParticleSystem(particleCanvas);
        }
    }

    // -------------------- INITIALIZE ALL --------------------
    function init() {
        initNavigation();
        initButtonEffects();
        initSmoothScroll();
        initLoadingScreen();
        initChallengeCards();
        initFormValidation();
        initScrollAnimations();
        initScoreboard();
        initCanvasBackgrounds();
        GothamSecModal.init();

        console.log('%c GothamSec Theme Loaded ',
            'background: linear-gradient(135deg, #00d9ff, #b026ff); color: white; padding: 10px 20px; border-radius: 5px; font-weight: bold;');
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose classes globally
    window.GothamSecCircuitBoard = CircuitBoard;
    window.GothamSecParticleSystem = ParticleSystem;

})();
