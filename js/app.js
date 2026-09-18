/**
 * Storyloom - Interactive Literary & Famous Books Master Engine
 * Lenis smooth scrolling, mouse parallax, colliding orb physics & books accordion.
 */

let lenis = null;

// Famous Books Showcase Accordion Data (Real Book Covers)
const clientProjects = {
  'Harry Potter': {
    image: 'assets/hp_cover.jpg?v=3',
    label: 'Harry Potter (J.K. Rowling)',
    tag: 'Magical Fantasy Saga • Bloomsbury'
  },
  'Twilight': {
    image: 'assets/twilight_cover.jpg?v=3',
    label: 'Twilight (Stephenie Meyer)',
    tag: 'Vampire Romance • Little, Brown'
  },
  'Lord of the Rings': {
    image: 'assets/lotr_cover.jpg?v=4',
    label: 'Lord of the Rings (J.R.R. Tolkien)',
    tag: 'High Fantasy • Allen & Unwin'
  },
  'Dune': {
    image: 'assets/dune_cover.jpg?v=4',
    label: 'Dune Chronicles (Frank Herbert)',
    tag: 'Sci-Fi Epic • Chilton Books'
  },
  'The Great Gatsby': {
    image: 'assets/gatsby_cover.jpg?v=6',
    label: 'The Great Gatsby (F. Scott Fitzgerald)',
    tag: 'Jazz Age Classic • Scribner'
  },
  '1984': {
    image: 'assets/orwell1984_cover.jpg?v=4',
    label: '1984 (George Orwell)',
    tag: 'Dystopian Fiction • Secker & Warburg'
  },
  'To Kill a Mockingbird': {
    image: 'assets/mockingbird_cover.jpg?v=7',
    label: 'To Kill a Mockingbird (Harper Lee)',
    tag: 'Pulitzer Prize • J.B. Lippincott'
  },
  'Pride & Prejudice': {
    image: 'assets/pride_cover.jpg?v=8',
    label: 'Pride & Prejudice (Jane Austen)',
    tag: 'Romance Classic • T. Egerton'
  },
  'The Hobbit': {
    image: 'assets/hobbit_cover.jpg?v=9',
    label: 'The Hobbit (J.R.R. Tolkien)',
    tag: 'Fantasy Adventure • Allen & Unwin'
  }
};

document.addEventListener('DOMContentLoaded', () => {
  initLenisSmoothScroll();
  initMobileMenu();
  initHeaderThemeToggle();
  initHeroParallax();
  initOrangeTextFlow();
  initOrbPhysics();
  initWorkAccordion();
  initProjectModal();
  initNewsletterBtn();
  initLiveClock();
});

/**
 * Mobile Navigation Drawer Toggle Handler
 */
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobileMenuToggle');
  const nav = document.getElementById('siteNav');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!toggleBtn || !nav) return;

  function openMenu() {
    nav.classList.add('mobile-active');
    toggleBtn.classList.add('is-active');
    toggleBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    if (lenis) lenis.stop();
  }

  function closeMenu() {
    nav.classList.remove('mobile-active');
    toggleBtn.classList.remove('is-active');
    toggleBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    if (lenis) lenis.start();
  }

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = nav.classList.contains('mobile-active');
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  navLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close mobile menu on clicking modal trigger inside nav
  const modalTrigger = nav.querySelector('.btn-start-project');
  if (modalTrigger) {
    modalTrigger.addEventListener('click', closeMenu);
  }

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('mobile-active')) {
      closeMenu();
    }
  });
}

/**
 * Seamless Infinite SVG Text Flow inside Orange Ribbon (Left to Right)
 */
function initOrangeTextFlow() {
  const textPath = document.getElementById('orangeTextPath');
  if (!textPath) return;

  // Single text unit percentage (1/5th of total text length)
  const unitSize = 20.0;
  let offset = -unitSize * 2;

  function animateText() {
    offset += 0.05; // Smooth movement from left to right
    if (offset >= 0) {
      offset -= unitSize; // Seamless invisible reset
    }
    textPath.setAttribute('startOffset', `${offset}%`);
    requestAnimationFrame(animateText);
  }
  animateText();
}

/**
 * Lenis Smooth Scrolling Setup
 */
function initLenisSmoothScroll() {
  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 2.0,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // In-page smooth scrolling for anchors
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const targetId = anchor.getAttribute('href');
        if (targetId && targetId !== '#') {
          e.preventDefault();
          lenis.scrollTo(targetId, { offset: -60, duration: 1.5 });
        }
      });
    });
  }
}

/**
 * Header Theme Toggle on Scroll (Dark Hero -> Light Sections)
 */
function initHeaderThemeToggle() {
  const header = document.querySelector('.site-header');
  const sectionWho = document.querySelector('.section-who');

  const handleScroll = () => {
    if (!sectionWho) return;
    const whoTop = sectionWho.getBoundingClientRect().top;

    if (whoTop <= 80) {
      header.classList.remove('scrolled-dark');
      header.classList.add('scrolled-light');
    } else if (window.scrollY > 40) {
      header.classList.remove('scrolled-light');
      header.classList.add('scrolled-dark');
    } else {
      header.classList.remove('scrolled-dark', 'scrolled-light');
    }
  };

  if (lenis) {
    lenis.on('scroll', handleScroll);
  } else {
    window.addEventListener('scroll', handleScroll);
  }
}

/**
 * Hero Stage Mouse & Touch Parallax Engine + Loop Pause Handler
 */
function initHeroParallax() {
  const collageContainer = document.querySelector('.collage-container');
  const items = document.querySelectorAll('.floating-item');
  const path = document.querySelector('.fluid-path');

  if (!collageContainer) return;

  // Pause loop ONLY when mouse/touch is DIRECTLY over a product item
  items.forEach(item => {
    item.addEventListener('mouseenter', () => {
      collageContainer.classList.add('loop-paused-item');
    });

    item.addEventListener('mouseleave', () => {
      collageContainer.classList.remove('loop-paused-item');
    });

    item.addEventListener('touchstart', () => {
      collageContainer.classList.add('loop-paused-item');
    }, { passive: true });

    item.addEventListener('touchend', () => {
      collageContainer.classList.remove('loop-paused-item');
    }, { passive: true });

    item.addEventListener('touchcancel', () => {
      collageContainer.classList.remove('loop-paused-item');
    }, { passive: true });
  });

  let mouseX = 0;
  let mouseY = 0;
  let currentX = 0;
  let currentY = 0;

  window.addEventListener('mousemove', (e) => {
    const { innerWidth, innerHeight } = window;
    mouseX = (e.clientX / innerWidth) * 2 - 1;
    mouseY = (e.clientY / innerHeight) * 2 - 1;
  });

  function animate() {
    currentX += (mouseX - currentX) * 0.05;
    currentY += (mouseY - currentY) * 0.05;

    collageContainer.style.transform = `translate3d(${currentX * 25}px, ${currentY * 25}px, 0)`;

    if (path) {
      path.style.transform = `translate3d(${currentX * 15}px, ${currentY * 10}px, 0)`;
    }

    requestAnimationFrame(animate);
  }

  animate();
}

/**
 * Section 2: Floating Orange Orbs Physics Engine
 */
/**
 * Section 2: Floating Orange Orbs Physics Engine (Collisions + Spawning/Multiplying)
 */
function initOrbPhysics() {
  const container = document.querySelector('.orbs-container');
  const section = document.querySelector('.section-who');
  if (!container || !section) return;

  container.innerHTML = '';

  const MAX_ORBS = 65;
  const ORB_RADIUS = 11;
  const orbs = [];

  let mouseX = -9999;
  let mouseY = -9999;
  let isMouseOver = false;

  class OrbParticle {
    constructor(x, y, vx, vy, isNew = false) {
      this.x = x;
      this.y = y;
      this.vx = vx || (Math.random() - 0.5) * 2.5;
      this.vy = vy || (Math.random() - 0.5) * 2.5;
      this.radius = ORB_RADIUS;
      this.cooldown = isNew ? 35 : 0;
      this.scale = isNew ? 0.1 : 1;

      this.el = document.createElement('div');
      this.el.className = 'floating-orb';
      container.appendChild(this.el);
      this.render();
    }

    render() {
      if (this.scale < 1) {
        this.scale = Math.min(1, this.scale + 0.08);
      }
      this.el.style.transform = `translate3d(${this.x - this.radius}px, ${this.y - this.radius}px, 0) scale(${this.scale})`;
    }
  }

  const initialPositions = [
    { xRatio: 0.20, yRatio: 0.15 },
    { xRatio: 0.25, yRatio: 0.12 },
    { xRatio: 0.36, yRatio: 0.28 },
    { xRatio: 0.56, yRatio: 0.25 },
    { xRatio: 0.67, yRatio: 0.30 },
    { xRatio: 0.73, yRatio: 0.32 },
    { xRatio: 0.21, yRatio: 0.46 },
    { xRatio: 0.27, yRatio: 0.44 },
    { xRatio: 0.67, yRatio: 0.43 },
    { xRatio: 0.88, yRatio: 0.55 },
    { xRatio: 0.26, yRatio: 0.64 },
    { xRatio: 0.47, yRatio: 0.65 },
    { xRatio: 0.67, yRatio: 0.66 },
    { xRatio: 0.21, yRatio: 0.77 },
    { xRatio: 0.26, yRatio: 0.78 },
    { xRatio: 0.35, yRatio: 0.80 },
    { xRatio: 0.57, yRatio: 0.81 },
    { xRatio: 0.74, yRatio: 0.79 }
  ];

  function initOrbs() {
    const w = container.offsetWidth || window.innerWidth;
    const h = container.offsetHeight || 600;
    initialPositions.forEach(pos => {
      orbs.push(new OrbParticle(pos.xRatio * w, pos.yRatio * h));
    });
  }

  initOrbs();

  section.addEventListener('mousemove', (e) => {
    const sRect = section.getBoundingClientRect();
    mouseX = e.clientX - sRect.left;
    mouseY = e.clientY - sRect.top;
    isMouseOver = true;
  });

  section.addEventListener('mouseleave', () => {
    isMouseOver = false;
  });

  section.addEventListener('click', (e) => {
    if (orbs.length >= MAX_ORBS) return;
    const sRect = section.getBoundingClientRect();
    const cx = e.clientX - sRect.left;
    const cy = e.clientY - sRect.top;
    orbs.push(new OrbParticle(cx, cy, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4, true));
  });

  function physicsLoop() {
    const containerW = container.offsetWidth || window.innerWidth;
    const containerH = container.offsetHeight || 600;
    const PAD = 25;

    orbs.forEach(orb => {
      if (orb.cooldown > 0) orb.cooldown--;

      if (isMouseOver) {
        const dx = orb.x - mouseX;
        const dy = orb.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 180 && dist > 0) {
          const force = (180 - dist) / 180;
          orb.vx += (dx / dist) * force * 0.45;
          orb.vy += (dy / dist) * force * 0.45;
        }
      }

      const speed = Math.sqrt(orb.vx * orb.vx + orb.vy * orb.vy);
      if (speed > 5) {
        orb.vx = (orb.vx / speed) * 5;
        orb.vy = (orb.vy / speed) * 5;
      }

      orb.x += orb.vx;
      orb.y += orb.vy;

      if (orb.x - orb.radius < PAD) {
        orb.x = PAD + orb.radius;
        orb.vx = Math.abs(orb.vx);
      } else if (orb.x + orb.radius > containerW - PAD) {
        orb.x = containerW - PAD - orb.radius;
        orb.vx = -Math.abs(orb.vx);
      }

      if (orb.y - orb.radius < PAD) {
        orb.y = PAD + orb.radius;
        orb.vy = Math.abs(orb.vy);
      } else if (orb.y + orb.radius > containerH - PAD) {
        orb.y = containerH - PAD - orb.radius;
        orb.vy = -Math.abs(orb.vy);
      }
    });

    const newOrbsToSpawn = [];

    for (let i = 0; i < orbs.length; i++) {
      for (let j = i + 1; j < orbs.length; j++) {
        const o1 = orbs[i];
        const o2 = orbs[j];

        const dx = o2.x - o1.x;
        const dy = o2.y - o1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        // Sensitive collision threshold (26px)
        const minDist = 26;

        if (dist < minDist && dist > 0) {
          const nx = dx / dist;
          const ny = dy / dist;

          const overlap = minDist - dist;
          o1.x -= nx * overlap * 0.5;
          o1.y -= ny * overlap * 0.5;
          o2.x += nx * overlap * 0.5;
          o2.y += ny * overlap * 0.5;

          const k = (o1.vx - o2.vx) * nx + (o1.vy - o2.vy) * ny;
          if (k > 0) {
            o1.vx -= k * nx;
            o1.vy -= k * ny;
            o2.vx += k * nx;
            o2.vy += k * ny;
          }

          // SPAWN 3rd ORANGE CIRCLE ON COLLISION!
          if (o1.cooldown <= 0 && o2.cooldown <= 0 && (orbs.length + newOrbsToSpawn.length) < MAX_ORBS) {
            const spawnX = (o1.x + o2.x) / 2;
            const spawnY = (o1.y + o2.y) / 2;

            // Visual shockwave ring flash at birth point
            const flash = document.createElement('div');
            flash.className = 'orb-birth-flash';
            flash.style.transform = `translate3d(${spawnX}px, ${spawnY}px, 0)`;
            container.appendChild(flash);
            setTimeout(() => flash.remove(), 500);

            // Perpendicular outward velocity burst for newly born 3rd orb
            const perpVx = -ny * (2.2 + Math.random() * 2);
            const perpVy = nx * (2.2 + Math.random() * 2);

            o1.cooldown = 20;
            o2.cooldown = 20;

            newOrbsToSpawn.push(new OrbParticle(spawnX, spawnY, perpVx, perpVy, true));
          }
        }
      }
    }

    newOrbsToSpawn.forEach(newOrb => orbs.push(newOrb));

    orbs.forEach(orb => orb.render());

    requestAnimationFrame(physicsLoop);
  }

  requestAnimationFrame(physicsLoop);
}

/**
 * Section 3: Pinned Scroll-Lock Work Accordion (Image Aligns Above Name)
 */
function initWorkAccordion() {
  const section = document.querySelector('.section-accordion');
  const stageContainer = document.querySelector('.accordion-stage-container');
  const imageTrack = document.getElementById('activeImageTrack');
  const clientItems = document.querySelectorAll('.client-item');
  const previewImg = document.getElementById('workFeaturedImg');
  const previewLabel = document.getElementById('workFeaturedLabel');

  if (!section || !previewImg || !clientItems.length) return;

  const clientList = Array.from(clientItems).map(item => item.getAttribute('data-client'));
  let currentIndex = -1;

  function alignCardAboveItem(index) {
    const item = clientItems[index];
    if (!item || !stageContainer || !imageTrack) return;

    const card = imageTrack.querySelector('.accordion-preview-card');
    const cardWidth = card ? card.offsetWidth : 240;
    const containerRect = stageContainer.getBoundingClientRect();

    if (window.innerWidth <= 900) {
      // On mobile/tablet viewports, ALWAYS center the preview card in the viewport
      const targetX = Math.max(0, (containerRect.width - cardWidth) / 2);
      imageTrack.style.transform = `translate3d(${targetX}px, 0, 0)`;
    } else {
      // On desktop screens, align card above the active name item
      const itemRect = item.getBoundingClientRect();
      const itemCenterX = (itemRect.left + itemRect.width / 2) - containerRect.left;
      let targetX = itemCenterX - (cardWidth / 2);

      const paddingRight = 20;
      const maxX = Math.max(0, containerRect.width - cardWidth - paddingRight);
      targetX = Math.max(0, Math.min(maxX, targetX));
      imageTrack.style.transform = `translate3d(${targetX}px, 0, 0)`;
    }

    // Auto-scroll roster pill row into view on mobile viewports
    const rosterRow = document.getElementById('clientRosterRow');
    if (window.innerWidth <= 900 && rosterRow && item) {
      const itemLeft = item.offsetLeft;
      const itemWidth = item.offsetWidth;
      const rowWidth = rosterRow.offsetWidth;
      rosterRow.scrollTo({
        left: itemLeft - (rowWidth / 2) + (itemWidth / 2),
        behavior: 'smooth'
      });
    }
  }

  function setActiveIndex(index) {
    if (index < 0 || index >= clientList.length) return;

    if (index === currentIndex) {
      alignCardAboveItem(index);
      return;
    }
    currentIndex = index;

    const clientName = clientList[index];
    const data = clientProjects[clientName];

    clientItems.forEach((item, i) => {
      if (i === index) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    if (data && previewImg) {
      previewImg.src = data.image;
      if (previewLabel) previewLabel.textContent = data.label;
      previewImg.style.opacity = '1';
      previewImg.style.transform = 'scale(1)';
    }

    alignCardAboveItem(index);
  }

  const stickyWrapper = document.querySelector('.accordion-sticky-wrapper');

  // Ultra-Fast Bulletproof JS-Driven Fixed Pinning Scroll Loop
  function updateAccordionOnScroll() {
    const rect = section.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const totalHeight = rect.height - windowHeight;

    if (totalHeight > 0) {
      if (rect.top <= 0 && rect.bottom >= windowHeight) {
        // STATE 1: PINNED (Screen stays 100% frozen while books cycle)
        if (stickyWrapper) {
          stickyWrapper.style.position = 'fixed';
          stickyWrapper.style.top = '0px';
          stickyWrapper.style.bottom = 'auto';
        }
        const scrolled = -rect.top;
        const progress = Math.max(0, Math.min(1, scrolled / totalHeight));
        const targetIndex = Math.max(0, Math.min(clientList.length - 1, Math.floor(progress * clientList.length * 0.999)));
        setActiveIndex(targetIndex);

      } else if (rect.bottom < windowHeight) {
        // STATE 2: PAST SECTION (Un-pin smoothly at bottom boundary)
        if (stickyWrapper) {
          stickyWrapper.style.position = 'absolute';
          stickyWrapper.style.top = 'auto';
          stickyWrapper.style.bottom = '0px';
        }
        setActiveIndex(clientList.length - 1);

      } else {
        // STATE 3: BEFORE SECTION
        if (stickyWrapper) {
          stickyWrapper.style.position = 'absolute';
          stickyWrapper.style.top = '0px';
          stickyWrapper.style.bottom = 'auto';
        }
        setActiveIndex(0);
      }
    }

    requestAnimationFrame(updateAccordionOnScroll);
  }

  // Start continuous RAF loop
  requestAnimationFrame(updateAccordionOnScroll);

  // Also support direct hover & click
  clientItems.forEach((item, idx) => {
    item.addEventListener('mouseenter', () => setActiveIndex(idx));
    item.addEventListener('click', () => setActiveIndex(idx));
  });

  window.addEventListener('resize', () => {
    if (currentIndex >= 0) alignCardAboveItem(currentIndex);
  });
}

/**
 * Project Inquiry Drawer Modal
 */
function initProjectModal() {
  const triggerBtns = document.querySelectorAll('.btn-start-project');
  const modal = document.getElementById('projectModal');
  const closeBtn = document.querySelector('.modal-close');
  const form = document.getElementById('projectForm');

  if (!modal) return;

  triggerBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
      if (lenis) lenis.stop();
    });
  });

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    if (lenis) lenis.start();
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('.btn-submit');
      submitBtn.textContent = 'Sending Brief...';
      
      setTimeout(() => {
        submitBtn.textContent = 'Brief Sent Successfully! ✓';
        submitBtn.style.background = '#28a745';
        setTimeout(() => {
          closeModal();
          form.reset();
          submitBtn.textContent = 'Submit Project Brief';
          submitBtn.style.background = '';
        }, 1500);
      }, 1200);
    });
  }
}

/**
 * Real-Time Studio Clock
 */
function initLiveClock() {
  const clockEl = document.getElementById('studioClock');
  if (!clockEl) return;

  function updateClock() {
    const now = new Date();
    const options = { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    clockEl.textContent = `EST: ${now.toLocaleTimeString('en-US', options)}`;
  }

  updateClock();
  setInterval(updateClock, 1000);
}

/**
 * Newsletter Join Handler
 */
function initNewsletterBtn() {
  const btn = document.querySelector('.btn-join-knot');
  if (!btn) return;

  btn.addEventListener('click', () => {
    btn.textContent = 'WELCOME TO STORYLOOM ✓';
    btn.style.background = '#e8f552';
    btn.style.color = '#1e120c';

    setTimeout(() => {
      btn.textContent = 'JOIN STORYLOOM';
      btn.style.background = '#fff';
      btn.style.color = '#1e120c';
    }, 2500);
  });
}
