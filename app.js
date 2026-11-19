(() => {
  'use strict';
  const config = window.SHILPKAR_CONFIG || {};
  const days = [
    { label: 'DAY 01 · PREPARE', title: 'Begin with intention', text: 'Discover the challenge, understand important precautions, and set an intention for a mindful week.', items: ['Welcome and orientation', 'Health and suitability checklist', 'Personal intention setting'], prompt: 'BEGIN WITH', word: 'intention.' },
    { label: 'DAY 02 · UNDERSTAND', title: 'Learn about hydration', text: 'Explore fluid balance, fasting fundamentals, and what signs mean it is time to seek help.', items: ['Hydration education', 'Fasting benefits and limitations', 'Symptoms and red flags'], prompt: 'FIND YOUR', word: 'balance.' },
    { label: 'DAY 03 · NOTICE', title: 'Listen to your body', text: 'Practice understanding hunger, mood, energy and the difference between mindful awareness and pushing past warning signs.', items: ['Body-awareness check-in', 'Guided breathing', 'Rest and recovery fundamentals'], prompt: 'WELCOME', word: 'awareness.' },
    { label: 'DAY 04 · RESTORE', title: 'Find your calm', text: 'Slow the pace with restorative yoga, relaxation and a supportive approach to everyday wellbeing.', items: ['Gentle yoga practice', 'Meditation and relaxation', 'Sleep and stress reflection'], prompt: 'BREATHE IN', word: 'calm.' },
    { label: 'DAY 05 · LEARN', title: 'Understand the science', text: 'Explore what research says about fasting, where uncertainty remains and why individual needs matter.', items: ['Evidence versus fasting myths', 'Who should avoid fasting', 'Questions for your healthcare professional'], prompt: 'GROW WITH', word: 'wisdom.' },
    { label: 'DAY 06 · PLAN', title: 'Build lasting rituals', text: 'Choose a realistic wellbeing routine and learn why stopping a prolonged fast requires appropriate medical guidance.', items: ['Mindful eating habits', 'Safety and return-to-eating education', 'Personal routine planning'], prompt: 'CREATE', word: 'harmony.' },
    { label: 'DAY 07 · CONTINUE', title: 'Carry the calm forward', text: 'Celebrate what you have learned and build a sustainable plan beyond the seven-day experience.', items: ['Reflect on the experience', 'Create a 30-day habit plan', 'Closing mindful practice'], prompt: 'CARRY FORWARD', word: 'renewal.' },
  ];
  document.querySelectorAll('[data-brand]').forEach(el => el.textContent = config.brandName || 'Shilpkar Dance & Fitness Center');
  document.querySelectorAll('[data-brand-short]').forEach(el => el.textContent = config.shortName || 'Shilpkar');
  document.getElementById('year').textContent = String(new Date().getFullYear());
  const navToggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');
  navToggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open menu');
  }));
  // Animated seven-day experience (native Web Animations API, no extra dependencies).
  let currentDay = 0;
  let changing = false;
  let queuedDay = null;
  const dayTabs = [...document.querySelectorAll('.day-tab')];
  const panel = document.getElementById('day-panel');
  const content = panel.querySelector('.day-content');
  const art = panel.querySelector('.journey-art');
  const artLabel = panel.querySelector('.journey-art-label');
  const artDay = document.getElementById('art-day');
  const progress = document.getElementById('journey-progress-fill');
  const counter = document.getElementById('journey-counter');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const animate = (element, frames, options) => {
    if (reducedMotion.matches || !element?.animate) return Promise.resolve();
    const animation = element.animate(frames, options);
    return animation.finished.catch(() => {});
  };

  function populateDay(index) {
    const d = days[index];
    document.getElementById('day-label').textContent = d.label;
    document.getElementById('day-title').textContent = d.title;
    document.getElementById('day-description').textContent = d.text;
    document.getElementById('art-prompt').textContent = d.prompt;
    document.getElementById('art-word').textContent = d.word;
    artDay.replaceChildren(document.createTextNode(String(index + 1).padStart(2, '0')));
    const suffix = document.createElement('span'); suffix.textContent = '/07'; artDay.appendChild(suffix);
    document.getElementById('day-activities').replaceChildren(...d.items.map(item => {
      const li = document.createElement('li'); li.textContent = item; return li;
    }));
    dayTabs.forEach((tab,i) => {
      tab.setAttribute('aria-selected',String(i === index));
      tab.classList.toggle('is-active',i === index);
      tab.tabIndex = i === index ? 0 : -1;
    });
    panel.setAttribute('aria-labelledby','tab-' + index);
    progress.style.transform = `scaleX(${(index + 1) / 7})`;
    counter.textContent = `${String(index + 1).padStart(2, '0')} / 07`;
    art.style.setProperty('--day-hue', `${[0,8,15,-5,20,6,-13][index]}deg`);
  }

  async function renderDay(index, focus = false) {
    const nextDay = (index + days.length) % days.length;
    if (changing) { queuedDay = nextDay; return; }
    if (nextDay === currentDay) return;
    changing = true;
    const direction = nextDay > currentDay ? 1 : -1;
    // Graceful continuity for circular navigation: 07→01 goes forward; 01→07 goes backward.
    const travel = (currentDay === 6 && nextDay === 0) ? 1 : (currentDay === 0 && nextDay === 6) ? -1 : direction;
    const exitDuration = 195;
    const out = [
      animate(content, [{opacity:1,transform:'translateX(0) scale(1)'},{opacity:0,transform:`translateX(${-travel * 22}px) scale(.985)`}], {duration:exitDuration,easing:'ease-in',fill:'forwards'}),
      animate(artLabel, [{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(-18px)'}], {duration:exitDuration,easing:'ease-in',fill:'forwards'}),
      animate(artDay, [{opacity:1},{opacity:0}], {duration:exitDuration,easing:'ease-in',fill:'forwards'})
    ];
    await Promise.all(out);
    // WAAPI fill is cleared explicitly so no lingering old style leaks into the new slide.
    [content, artLabel, artDay].forEach(el => el.getAnimations().forEach(a => a.cancel()));
    currentDay = nextDay;
    populateDay(currentDay);
    if (focus) dayTabs[currentDay].focus();
    if (!reducedMotion.matches) {
      const itemEls = [...document.querySelectorAll('#day-activities li')];
      await Promise.all([
        animate(content,[{opacity:0,transform:`translateX(${travel * 34}px) scale(.99)`},{opacity:1,transform:'translateX(0) scale(1)'}],{duration:540,easing:'cubic-bezier(.22,1,.36,1)'}),
        animate(artLabel,[{opacity:0,transform:'translateY(28px) scale(.9)',filter:'blur(5px)'},{opacity:1,transform:'translateY(0) scale(1)',filter:'blur(0)'}],{duration:650,easing:'cubic-bezier(.22,1,.36,1)'}),
        animate(artDay,[{opacity:0,transform:'translateY(24px)'},{opacity:1,transform:'translateY(0)'}],{duration:640,easing:'cubic-bezier(.22,1,.36,1)'}),
        animate(art,[{filter:'brightness(.97)'},{filter:'brightness(1)'}],{duration:550,easing:'ease-out'}),
        ...itemEls.map((el,i)=>animate(el,[{opacity:0,transform:'translateY(14px)'},{opacity:1,transform:'translateY(0)'}],{duration:400,delay:i*75,easing:'ease-out'}))
      ]);
    }
    changing = false;
    if (queuedDay !== null) {
      const target = queuedDay; queuedDay = null;
      if (target !== currentDay) renderDay(target);
    }
  }

  dayTabs.forEach((tab,index) => {
    tab.tabIndex = index === 0 ? 0 : -1;
    tab.addEventListener('click', () => renderDay(index));
    tab.addEventListener('keydown', event => {
      if (['ArrowRight','ArrowLeft','Home','End'].includes(event.key)) {
        event.preventDefault();
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? 6 : currentDay + (event.key === 'ArrowRight' ? 1 : -1);
        renderDay(next, true);
      }
    });
  });
  document.getElementById('prev-day').addEventListener('click', () => renderDay(currentDay - 1));
  document.getElementById('next-day').addEventListener('click', () => renderDay(currentDay + 1));

  // Touch swipe: horizontal gestures on the panel, never hijack normal vertical scroll.
  let startX = 0, startY = 0;
  panel.addEventListener('touchstart', event => {
    if (event.touches.length !== 1) return;
    startX = event.touches[0].clientX; startY = event.touches[0].clientY;
  }, {passive:true});
  panel.addEventListener('touchend', event => {
    if (!event.changedTouches.length) return;
    const dx = event.changedTouches[0].clientX - startX;
    const dy = event.changedTouches[0].clientY - startY;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.4) renderDay(currentDay + (dx < 0 ? 1 : -1));
  }, {passive:true});

  // Lightweight mouse-driven magnetic button polish, only on fine pointers.
  if (window.matchMedia('(hover:hover) and (pointer:fine)').matches && !reducedMotion.matches) {
    document.querySelectorAll('.button').forEach(button => {
      button.addEventListener('pointermove', e => {
        const rect = button.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) * .075;
        const y = (e.clientY - rect.top - rect.height / 2) * .12;
        button.style.setProperty('--mag-x', `${x}px`);
        button.style.setProperty('--mag-y', `${y}px`);
      });
      button.addEventListener('pointerleave', () => {
        button.style.setProperty('--mag-x','0px');button.style.setProperty('--mag-y','0px');
      });
    });
  }
  populateDay(0);
  const toast = document.getElementById('toast');
  function showToast(message) {
    toast.textContent = message;
    toast.hidden = false;
    toast.classList.add('visible');
  }
  function paymentUrl() {
    const url = String(config.paymentPageUrl || '').trim();
    try { const target = new URL(url); return target.protocol === 'https:' ? target.href : null; }
    catch (_) { return null; }
  }
  document.getElementById('pay-now').addEventListener('click', () => {
    const url = paymentUrl();
    if (url) window.location.assign(url);
    else showToast('Payment checkout is not connected yet. Add your secure ₹99 payment link in config.js.');
  });
  // V9: Non-blocking scroll reveals. The page is always visible; animations never
  // create blank content if Safari delays IntersectionObserver notifications.
  const motionSafe = !reducedMotion.matches && 'IntersectionObserver' in window;
  if (motionSafe) {
    const introItems = [
      ...document.querySelectorAll('.section-intro .overline, .section-intro h2, .section-intro > p, .benefit, .quiet-note'),
      ...document.querySelectorAll('.journey > .center > *, .day-selector, .journey-progress, .journey-card, .slider-foot'),
      ...document.querySelectorAll('.register-card, .safety, .faq > .center > *, .faq-list details')
    ];
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        const el = entry.target;
        if (el.getAnimations().length) return;
        const smallScreen = window.matchMedia('(max-width: 700px)').matches;
        const distance = smallScreen ? 14 : 28;
        // Transient animation from a partly visible state: never leave content hidden.
        el.animate([
          {opacity: .75, transform: `translate3d(0, ${distance}px, 0)`},
          {opacity: 1, transform: 'translate3d(0, 0, 0)'}
        ], {duration: smallScreen ? 550 : 750, easing: 'cubic-bezier(.22,1,.36,1)'});
      });
    }, {threshold: .08, rootMargin: '0px 0px -10px 0px'});
    introItems.forEach(el => observer.observe(el));
  }

  // Smooth directional parallax on the hero image and a subtle page-scroll indicator.
  // Single rAF and transform-only work; skip on touch or reduced-motion devices.
  const progressBar = document.getElementById('reading-progress-fill');
  const hero = document.querySelector('.hero');
  const heroBackground = document.querySelector('.hero-bg');
  const allowParallax = !reducedMotion.matches && matchMedia('(hover: hover) and (pointer: fine)').matches;
  let scrollTicking = false;
  function updateScrollMotion() {
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    if (progressBar) progressBar.style.transform = `scaleX(${Math.min(1, Math.max(0, scrollY / maxScroll))})`;
    if (allowParallax && hero && heroBackground) {
      const rect = hero.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < innerHeight) {
        const amount = Math.max(-25, Math.min(25, -rect.top * .065));
        heroBackground.style.translate = `0 ${amount}px`;
      }
    }
    scrollTicking = false;
  }
  addEventListener('scroll', () => {
    if (!scrollTicking) { scrollTicking = true; requestAnimationFrame(updateScrollMotion); }
  }, { passive: true });
  addEventListener('resize', () => requestAnimationFrame(updateScrollMotion), { passive: true });
  updateScrollMotion();

  // Refined FAQ disclosure animation without overriding native keyboard behavior.
  document.querySelectorAll('.faq-list details').forEach(details => {
    const body = details.querySelector('p');
    details.addEventListener('toggle', () => {
      if (details.open && body && !reducedMotion.matches) {
        animate(body, [
          { opacity: 0, transform: 'translateY(-8px)' },
          { opacity: 1, transform: 'translateY(0)' }
        ], { duration: 380, easing: 'cubic-bezier(.22,1,.36,1)' });
      }
    });
  });

})();
