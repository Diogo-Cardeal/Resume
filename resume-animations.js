/* ============================================================
   resume-animations.js — Diogo Cardeal Interactive Resume
   Handles: particle canvas, scroll reveal, skill bars,
            progress bar, staggered hero entry
   ============================================================ */

"use strict";

/* ============================================================
   1. SCROLL PROGRESS BAR
   ============================================================ */
function initProgressBar() {
    const bar = document.getElementById("progress-bar");

    function updateProgress() {
        const scrollTop    = document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress     = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;

        bar.style.width = progress + "%";
    }

    window.addEventListener("scroll", updateProgress, { passive: true });
}

/* ============================================================
   2. HERO STAGGERED ANIMATE-IN
   ============================================================ */
function initHeroAnimations() {
    const elements = document.querySelectorAll(".animate-in");

    elements.forEach(function (el) {
        const delay = parseInt(el.dataset.delay, 10) || 0;

        setTimeout(function () {
            el.classList.add("visible");
        }, delay + 200);   // +200ms base offset after page load
    });
}

/* ============================================================
   3. SCROLL REVEAL (IntersectionObserver)
   Reveals .reveal sections and animates .skill-bar elements
   ============================================================ */
function initScrollReveal() {
    // --- Section reveal ---
    const revealObserver = new IntersectionObserver(
        function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    revealObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.12 }
    );

    document.querySelectorAll(".reveal").forEach(function (section) {
        revealObserver.observe(section);
    });

    // --- Skill bars (animate width when visible) ---
    const barObserver = new IntersectionObserver(
        function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    const bar   = entry.target;
                    const level = bar.dataset.level || "0";

                    bar.style.width = level + "%";
                    barObserver.unobserve(bar);
                }
            });
        },
        { threshold: 0.5 }
    );

    document.querySelectorAll(".skill-bar").forEach(function (bar) {
        barObserver.observe(bar);
    });
}

/* ============================================================
   4. PARTICLE CANVAS — subtle floating dots on background
   ============================================================ */
function initParticleCanvas() {
    const canvas = document.getElementById("bg-canvas");
    const ctx    = canvas.getContext("2d");

    // Particle configuration
    const PARTICLE_COUNT  = 60;
    const PARTICLE_SPEED  = 0.25;
    const PARTICLE_RADIUS = 1.5;
    const CONNECT_DIST    = 130;

    var particles = [];
    var W, H;

    /* Resize handler — keep canvas in sync with window */
    function resize() {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }

    /* Create a single particle with random position and velocity */
    function createParticle() {
        return {
            x:  Math.random() * W,
            y:  Math.random() * H,
            vx: (Math.random() - 0.5) * PARTICLE_SPEED,
            vy: (Math.random() - 0.5) * PARTICLE_SPEED,
            alpha: Math.random() * 0.5 + 0.2
        };
    }

    /* Initialise particle array */
    function initParticles() {
        particles = [];
        for (var i = 0; i < PARTICLE_COUNT; i++) {
            particles.push(createParticle());
        }
    }

    /* Draw a single frame */
    function draw() {
        ctx.clearRect(0, 0, W, H);

        // Update positions and draw dots
        particles.forEach(function (p) {
            p.x += p.vx;
            p.y += p.vy;

            // Wrap around edges
            if (p.x < 0)  p.x = W;
            if (p.x > W)  p.x = 0;
            if (p.y < 0)  p.y = H;
            if (p.y > H)  p.y = 0;

            // Draw particle dot
            ctx.beginPath();
            ctx.arc(p.x, p.y, PARTICLE_RADIUS, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(212, 160, 80, " + p.alpha + ")";
            ctx.fill();
        });

        // Draw connecting lines between close particles
        for (var i = 0; i < particles.length; i++) {
            for (var j = i + 1; j < particles.length; j++) {
                var dx   = particles[i].x - particles[j].x;
                var dy   = particles[i].y - particles[j].y;
                var dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < CONNECT_DIST) {
                    var lineAlpha = (1 - dist / CONNECT_DIST) * 0.15;

                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = "rgba(212, 160, 80, " + lineAlpha + ")";
                    ctx.lineWidth   = 0.8;
                    ctx.stroke();
                }
            }
        }

        requestAnimationFrame(draw);
    }

    window.addEventListener("resize", function () {
        resize();
        initParticles();
    });

    resize();
    initParticles();
    draw();
}

/* ============================================================
   5. CARD TILT EFFECT — subtle 3-D perspective on hover
   ============================================================ */
function initCardTilt() {
    var cards = document.querySelectorAll(".card, .project-card, .lang-chip");

    cards.forEach(function (card) {
        card.addEventListener("mousemove", function (e) {
            var rect   = card.getBoundingClientRect();
            var cx     = rect.left + rect.width  / 2;
            var cy     = rect.top  + rect.height / 2;
            var dx     = (e.clientX - cx) / (rect.width  / 2);
            var dy     = (e.clientY - cy) / (rect.height / 2);
            var tiltX  =  dy * 6;   // degrees
            var tiltY  = -dx * 6;

            card.style.transform = "translateY(-3px) perspective(600px) rotateX(" + tiltX + "deg) rotateY(" + tiltY + "deg)";
        });

        card.addEventListener("mouseleave", function () {
            card.style.transform = "";
        });
    });
}

/* ============================================================
   6. TYPED TAGLINE — typewriter effect on hero subtitle
   ============================================================ */
function initTypedTagline() {
    var el   = document.querySelector(".hero-tagline");
    if (!el) return;

    var full = el.textContent.trim();
    el.textContent = "";
    el.style.borderRight = "2px solid var(--accent)";

    var index = 0;

    function typeChar() {
        if (index < full.length) {
            el.textContent += full[index];
            index++;
            setTimeout(typeChar, 38 + Math.random() * 20);
        } else {
            // Remove cursor blink after typing is complete
            setTimeout(function () {
                el.style.borderRight = "none";
            }, 1200);
        }
    }

    // Start after hero animation settles
    setTimeout(typeChar, 500);
}

/* ============================================================
   INIT — run all modules after DOM is ready
   ============================================================ */
document.addEventListener("DOMContentLoaded", function () {
    initProgressBar();
    initHeroAnimations();
    initScrollReveal();
    initParticleCanvas();
    initCardTilt();
    initTypedTagline();
});
