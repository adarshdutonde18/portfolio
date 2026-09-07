/**
 * ==========================================================================
 * ADARSH GAJANAN DUTONDE - PORTFOLIO INTERACTIVITY ENGINE
 * Features: 4 Themes, Particle Constellation Canvas, Typing Effect,
 *           Counters, 3D Card Tilt, GitHub Heatmap, Form Validation & Modals
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Feather Icons
  if (window.feather) {
    feather.replace();
  }

  /* ==================== 1. THEME SWITCHER ENGINE ==================== */
  const THEMES = {
    'dark-black': { label: 'Dark', color: '#00f2fe' },
    'purple-dark': { label: 'Purple', color: '#c084fc' },
    'blue-dark': { label: 'Blue', color: '#38bdf8' },
    'light': { label: 'Light', color: '#4f46e5' }
  };

  const themeWrapper = document.getElementById('theme-switcher-wrapper');
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const themeOptions = document.querySelectorAll('.theme-option');
  const mobilePills = document.querySelectorAll('.mobile-pill');
  const currentThemeLabel = document.querySelector('.current-theme-label');

  function applyTheme(themeKey) {
    if (!THEMES[themeKey]) themeKey = 'dark-black';
    document.documentElement.setAttribute('data-theme', themeKey);
    localStorage.setItem('portfolio_theme', themeKey);

    // Update label
    if (currentThemeLabel) {
      currentThemeLabel.textContent = THEMES[themeKey].label;
    }

    // Update active state in desktop dropdown
    themeOptions.forEach(opt => {
      opt.classList.toggle('active', opt.getAttribute('data-theme-val') === themeKey);
    });

    // Update active state in mobile drawer
    mobilePills.forEach(pill => {
      pill.classList.toggle('active', pill.getAttribute('data-theme-val') === themeKey);
    });

    // Update canvas particle color if running
    if (window.updateCanvasThemeColor) {
      window.updateCanvasThemeColor(THEMES[themeKey].color);
    }
  }

  // Load saved theme or default
  const savedTheme = localStorage.getItem('portfolio_theme') || 'dark-black';
  applyTheme(savedTheme);

  // Toggle theme dropdown
  if (themeToggleBtn && themeWrapper) {
    themeToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      themeWrapper.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
      if (!themeWrapper.contains(e.target)) {
        themeWrapper.classList.remove('open');
      }
    });
  }

  // Handle dropdown option clicks
  themeOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      const selected = opt.getAttribute('data-theme-val');
      applyTheme(selected);
      if (themeWrapper) themeWrapper.classList.remove('open');
      if (window.feather) feather.replace();
    });
  });

  // Handle mobile drawer pill clicks
  mobilePills.forEach(pill => {
    pill.addEventListener('click', () => {
      const selected = pill.getAttribute('data-theme-val');
      applyTheme(selected);
    });
  });

  /* ==================== 2. INTERACTIVE CANVAS PARTICLE NETWORK ==================== */
  const canvas = document.getElementById('particles-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let particleColor = THEMES[savedTheme] ? THEMES[savedTheme].color : '#00f2fe';
    window.updateCanvasThemeColor = (color) => {
      particleColor = color;
    };

    const particleCount = Math.min(Math.floor(width / 16), 80);
    const particles = [];
    const maxDist = 120;
    const mouse = { x: null, y: null, radius: 150 };

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
      mouse.x = null;
      mouse.y = null;
    });

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.7;
        this.vy = (Math.random() - 0.5) * 0.7;
        this.radius = Math.random() * 2 + 1;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx = -this.vx;
        if (this.y < 0 || this.y > height) this.vy = -this.vy;

        // Subtle mouse push
        if (mouse.x !== null && mouse.y !== null) {
          const dx = this.x - mouse.x;
          const dy = this.y - mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            this.x += (dx / dist) * force * 1.5;
            this.y += (dy / dist) * force * 1.5;
          }
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = particleColor;
        ctx.globalAlpha = 0.5;
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    function animateParticles() {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.hypot(dx, dy);

          if (dist < maxDist) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = particleColor;
            ctx.globalAlpha = (1 - dist / maxDist) * 0.2;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(animateParticles);
    }
    animateParticles();
  }

  /* ==================== 3. TYPING ANIMATION ==================== */
  const typingElement = document.getElementById('typing-text');
  if (typingElement) {
    const roles = [
      'Data Science Solutions.',
      'Machine Learning Models.',
      'Data Analytics & Insights.',
      'AgroTech & Precision AI.',
      'Python & C++ Engineering.'
    ];
    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const typeSpeed = 70;
    const deleteSpeed = 35;
    const delayBetweenWords = 1800;

    function typeLoop() {
      const currentWord = roles[roleIndex];

      if (isDeleting) {
        typingElement.textContent = currentWord.substring(0, charIndex - 1);
        charIndex--;
      } else {
        typingElement.textContent = currentWord.substring(0, charIndex + 1);
        charIndex++;
      }

      let speed = isDeleting ? deleteSpeed : typeSpeed;

      if (!isDeleting && charIndex === currentWord.length) {
        speed = delayBetweenWords;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        speed = 400;
      }

      setTimeout(typeLoop, speed);
    }
    typeLoop();
  }

  /* ==================== 4. STICKY NAVBAR & SCROLLSPY ==================== */
  const navbar = document.getElementById('navbar');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  const backToTopBtn = document.getElementById('back-to-top');

  function handleScroll() {
    const scrollY = window.scrollY;

    // Navbar Scrolled State
    if (navbar) {
      if (scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }

    // Back to top button visibility
    if (backToTopBtn) {
      if (scrollY > 400) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    }

    // ScrollSpy active link detection
    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 120;
      const sectionId = current.getAttribute('id');

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', handleScroll);
  handleScroll();

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ==================== 5. MOBILE DRAWER NAVIGATION ==================== */
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileNavDrawer = document.getElementById('mobile-nav-drawer');
  const closeDrawerBtn = document.getElementById('close-drawer-btn');
  const mobileBackdrop = document.getElementById('mobile-backdrop');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  function toggleDrawer(open) {
    if (open) {
      mobileNavDrawer.classList.add('open');
      mobileBackdrop.classList.add('open');
      mobileMenuBtn.classList.add('active');
      document.body.style.overflow = 'hidden';
    } else {
      mobileNavDrawer.classList.remove('open');
      mobileBackdrop.classList.remove('open');
      mobileMenuBtn.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
      const isOpen = mobileNavDrawer.classList.contains('open');
      toggleDrawer(!isOpen);
    });
  }

  if (closeDrawerBtn) closeDrawerBtn.addEventListener('click', () => toggleDrawer(false));
  if (mobileBackdrop) mobileBackdrop.addEventListener('click', () => toggleDrawer(false));

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => toggleDrawer(false));
  });

  /* ==================== 6. SCROLL REVEAL & NUMBER COUNTERS ==================== */
  const revealElements = document.querySelectorAll('.reveal-on-scroll');

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');

          // Trigger number counter inside element if present
          const counters = entry.target.querySelectorAll('.stat-counter');
          counters.forEach(counter => {
            if (!counter.classList.contains('counted')) {
              counter.classList.add('counted');
              const target = parseInt(counter.getAttribute('data-target'), 10);
              animateCounter(counter, target);
            }
          });

          // Trigger skill progress fill if inside skills
          const progressFills = entry.target.querySelectorAll('.skill-progress-fill');
          progressFills.forEach(fill => {
            const val = fill.getAttribute('data-progress');
            fill.style.width = `${val}%`;
          });

          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  revealElements.forEach(el => revealObserver.observe(el));

  function animateCounter(element, target) {
    const duration = 1800; // ms
    const startTime = performance.now();

    function updateCount(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out quad
      const current = Math.floor(progress * (2 - progress) * target);
      element.textContent = current;

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      } else {
        element.textContent = target;
      }
    }
    requestAnimationFrame(updateCount);
  }

  /* ==================== 7. SKILLS CATEGORY FILTER ==================== */
  const skillTabs = document.querySelectorAll('.skill-tab');
  const skillCards = document.querySelectorAll('.skill-card');

  skillTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      skillTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.getAttribute('data-filter');

      skillCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.classList.remove('hidden');
          // re-trigger animation width
          const fill = card.querySelector('.skill-progress-fill');
          if (fill) fill.style.width = `${fill.getAttribute('data-progress')}%`;
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });

  /* ==================== 8. 3D CARD TILT EFFECT ==================== */
  const tiltCards = document.querySelectorAll('[data-tilt]');

  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const deltaX = (x - centerX) / centerX;
      const deltaY = (y - centerY) / centerY;

      const rotateX = -deltaY * 6; // max 6 deg
      const rotateY = deltaX * 6;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
    });
  });

  /* ==================== 9. GITHUB HEATMAP SIMULATION ==================== */
  const heatmapGrid = document.getElementById('github-heatmap-grid');
  if (heatmapGrid) {
    // 52 weeks x 7 days = 364 cells
    const totalWeeks = 52;
    const daysPerWeek = 7;
    const fragment = document.createDocumentFragment();

    for (let w = 0; w < totalWeeks; w++) {
      for (let d = 0; d < daysPerWeek; d++) {
        const cell = document.createElement('div');
        cell.className = 'heatmap-cell';

        // Deterministic realistic activity weights
        const rand = Math.random();
        let level = 0;
        if (rand > 0.82) level = 4;
        else if (rand > 0.65) level = 3;
        else if (rand > 0.45) level = 2;
        else if (rand > 0.25) level = 1;

        cell.classList.add(`level-${level}`);
        const count = level === 0 ? 0 : level * 2 + Math.floor(Math.random() * 3);
        cell.setAttribute('title', `${count} contributions on Week ${w + 1}, Day ${d + 1}`);
        fragment.appendChild(cell);
      }
    }
    heatmapGrid.appendChild(fragment);
  }

  /* ==================== 10. CERTIFICATE MODAL VIEWER ==================== */
  const certModal = document.getElementById('cert-modal');
  const certModalTitle = document.getElementById('cert-modal-title');
  const certModalImg = document.getElementById('cert-modal-img');
  const certModalOrg = document.getElementById('cert-modal-org');
  const certModalId = document.getElementById('cert-modal-id');
  const closeCertModalBtn = document.getElementById('close-cert-modal');
  const certViewBtns = document.querySelectorAll('.cert-view-btn');

  function openCertModal(src, title, org, id) {
    certModalTitle.textContent = title;
    certModalImg.src = src;
    certModalOrg.textContent = org;
    certModalId.textContent = id;
    certModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeCertModal() {
    certModal.classList.remove('open');
    document.body.style.overflow = '';
  }

  certViewBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const src = btn.getAttribute('data-cert-src');
      const title = btn.getAttribute('data-cert-title');
      const org = btn.getAttribute('data-cert-org');
      const id = btn.getAttribute('data-cert-id');
      openCertModal(src, title, org, id);
    });
  });

  if (closeCertModalBtn) closeCertModalBtn.addEventListener('click', closeCertModal);
  if (certModal) {
    certModal.addEventListener('click', (e) => {
      if (e.target === certModal) closeCertModal();
    });
  }

  /* ==================== 11. PROJECT DETAILS MODAL ==================== */
  const PROJECT_DATA = {
    agrovision: {
      title: 'AgroVision AI',
      subtitle: 'Smart Agriculture Intelligence & Recommendation Platform',
      image: 'assets/images/agrovision-preview.jpg',
      repo: 'https://github.com/adarshdutonde18/PortRepo-collab',
      desc: 'An intelligent agriculture platform designed to help farmers with crop recommendations and smart agricultural insights using Artificial Intelligence. It evaluates real-time telemetry from soil sensors, rainfall projections, and historical crop yields to optimize farm output.',
      highlights: [
        'Multi-factor machine learning recommendation engine for soil-crop compatibility',
        'Real-time soil health analytics telemetry dashboard with N-P-K nutrient tracking',
        'Automated climate and weather risk forecasting for early drought or rain planning',
        'Engineered with Python, Scikit-Learn algorithms, and intuitive glassmorphic UI'
      ],
      tags: ['Python', 'Machine Learning', 'Data Analysis', 'Scikit-Learn', 'IoT Sensors', 'Smart Ag']
    },
    farmguard: {
      title: 'FarmGuard AI',
      subtitle: 'Precision Crop Selection & Computer Vision Disease Detection',
      image: 'assets/images/farmguard-preview.jpg',
      repo: 'https://github.com/adarshdutonde18/PortRepo-collab',
      desc: 'An AI-powered system focused on precision crop selection and crop disease detection. By leveraging deep computer vision models, it detects leaf blights, fungal infections, and nutrient deficiencies from uploaded photos in seconds.',
      highlights: [
        'Automated plant pathology classification using convolutional neural networks',
        'Bounding box visualizer marking infected leaf sectors with confidence percentage',
        'Actionable treatment recommendations and organic fungicide guidelines',
        'Real-time camera & drone telemetry integration pipeline'
      ],
      tags: ['Python', 'Computer Vision', 'AI', 'Machine Learning', 'Disease Classification']
    },
    placement: {
      title: 'Student Placement Prediction System',
      subtitle: 'Predictive Analytics & Student Career Readiness Platform',
      image: 'assets/images/placement-preview.jpg',
      repo: 'https://github.com/adarshdutonde18/PortRepo-collab',
      desc: 'A Machine Learning project that predicts student placement opportunities based on academic, internship, and skill-related data. It gives students personalized scorecards and probability meters to improve placement prospects.',
      highlights: [
        'Supervised classification models predicting tier 1 & 2 corporate placement likelihood',
        'Feature importance analysis identifying high-impact skill gaps (DSA, CGPA, Projects)',
        'Interactive radar charts and probability gauges with 94%+ model accuracy',
        'Built with Pandas, NumPy, Scikit-Learn pipelines, and interactive web metrics'
      ],
      tags: ['Python', 'Machine Learning', 'Data Analysis', 'Predictive Modeling', 'Education Tech']
    },
    portrepo: {
      title: 'PortRepo Collab',
      subtitle: 'GitHub → Portfolio Real-Time Project Synchronization System',
      image: 'assets/images/portrepo-preview.jpg',
      repo: 'https://github.com/adarshdutonde18/PortRepo-collab',
      desc: 'An automated project synchronization system that connects your GitHub repositories with your developer portfolio using FastAPI, SQLAlchemy Database, GitHub API, portfolio.yml YAML configuration files, and real-time GitHub Webhooks. Whenever you create, update, or complete a project repository on GitHub, your portfolio automatically reflects the project without requiring manual code changes!',
      highlights: [
        'Real-time GitHub Webhook listeners triggering automated repository updates',
        'portfolio.yml YAML configuration parser for dynamic tags, statuses, and demo links',
        'FastAPI backend with SQLite/PostgreSQL caching layer and CORS-enabled REST endpoints',
        'Interactive collaboration pipeline syncing multiple project repositories seamlessly'
      ],
      tags: ['Python', 'FastAPI', 'GitHub REST API', 'Webhooks', 'YAML', 'SQLAlchemy', 'Sync Engine']
    }
  };

  const projectModal = document.getElementById('project-modal');
  const projectModalTitle = document.getElementById('project-modal-title');
  const projectModalSubtitle = document.getElementById('project-modal-subtitle');
  const projectModalImg = document.getElementById('project-modal-img');
  const projectModalDesc = document.getElementById('project-modal-desc');
  const projectModalHighlights = document.getElementById('project-modal-highlights');
  const projectModalTags = document.getElementById('project-modal-tags');
  const closeProjectModalBtn = document.getElementById('close-project-modal');
  const projectModalLaunchBtn = document.getElementById('project-modal-launch-btn');
  const projectTriggers = document.querySelectorAll('.project-modal-trigger');

  function openProjectModal(key) {
    const data = PROJECT_DATA[key];
    if (!data) return;

    projectModalTitle.textContent = data.title;
    projectModalSubtitle.textContent = data.subtitle;
    projectModalImg.src = data.image;
    projectModalDesc.textContent = data.desc;

    // Highlights
    projectModalHighlights.innerHTML = '';
    data.highlights.forEach(item => {
      const li = document.createElement('li');
      li.textContent = item;
      projectModalHighlights.appendChild(li);
    });

    // Tags
    projectModalTags.innerHTML = '';
    data.tags.forEach(t => {
      const span = document.createElement('span');
      span.className = 'tech-pill';
      span.textContent = t;
      projectModalTags.appendChild(span);
    });

    const repoLink = document.getElementById('project-modal-repo-link');
    if (repoLink) repoLink.href = data.repo || 'https://github.com/adarshdutonde18/PortRepo-collab';

    projectModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeProjectModal() {
    projectModal.classList.remove('open');
    document.body.style.overflow = '';
  }

  projectTriggers.forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-project');
      openProjectModal(key);
    });
  });

  if (closeProjectModalBtn) closeProjectModalBtn.addEventListener('click', closeProjectModal);
  if (projectModal) {
    projectModal.addEventListener('click', (e) => {
      if (e.target === projectModal) closeProjectModal();
    });
  }

  if (projectModalLaunchBtn) {
    projectModalLaunchBtn.addEventListener('click', () => {
      showToast('Interactive Demo Preview', 'Demo loaded in demonstration sandbox mode!');
    });
  }

  // Close modals on ESC key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (certModal && certModal.classList.contains('open')) closeCertModal();
      if (projectModal && projectModal.classList.contains('open')) closeProjectModal();
    }
  });

  /* ==================== 12. CONTACT FORM CLIENT-SIDE VALIDATION ==================== */
  const contactForm = document.getElementById('contact-form');
  const nameInput = document.getElementById('contact-name');
  const emailInput = document.getElementById('contact-email');
  const subjectInput = document.getElementById('contact-subject');
  const messageInput = document.getElementById('contact-message');
  const submitBtn = document.getElementById('contact-submit-btn');

  // Real-time error clearing
  [nameInput, emailInput, subjectInput, messageInput].forEach(input => {
    if (input) {
      input.addEventListener('input', () => {
        const group = input.closest('.form-group');
        if (group) group.classList.remove('has-error');
      });
    }
  });

  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  }

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let isValid = true;

      // Validate Name
      if (!nameInput.value.trim() || nameInput.value.trim().length < 2) {
        nameInput.closest('.form-group').classList.add('has-error');
        isValid = false;
      }

      // Validate Email
      if (!emailInput.value.trim() || !validateEmail(emailInput.value.trim())) {
        emailInput.closest('.form-group').classList.add('has-error');
        isValid = false;
      }

      // Validate Subject
      if (!subjectInput.value.trim() || subjectInput.value.trim().length < 3) {
        subjectInput.closest('.form-group').classList.add('has-error');
        isValid = false;
      }

      // Validate Message
      if (!messageInput.value.trim() || messageInput.value.trim().length < 10) {
        messageInput.closest('.form-group').classList.add('has-error');
        isValid = false;
      }

      if (!isValid) return;

      // Simulate sending
      const origBtnContent = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Sending...</span>';

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = origBtnContent;
        if (window.feather) feather.replace();

        showToast(
          'Message Delivered!',
          `Thank you ${nameInput.value.trim()}, Adarsh has received your inquiry.`
        );

        contactForm.reset();
      }, 900);
    });
  }

  /* ==================== 13. TOAST NOTIFICATION SYSTEM ==================== */
  const toast = document.getElementById('toast');
  const toastTitle = document.getElementById('toast-title');
  const toastMessage = document.getElementById('toast-message');
  const toastClose = document.getElementById('toast-close');
  let toastTimer = null;

  function showToast(title, message) {
    if (!toast) return;
    toastTitle.textContent = title;
    toastMessage.textContent = message;
    toast.classList.add('show');

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 4500);
  }

  if (toastClose) {
    toastClose.addEventListener('click', () => {
      toast.classList.remove('show');
    });
  }
});