(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const progressBar = document.querySelector('.page-progress span');
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    if (progressBar) progressBar.style.width = `${max > 0 ? (scrollY / max) * 100 : 0}%`;
    document.body.classList.toggle('is-scrolled', scrollY > innerHeight * .72);
  };
  addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

  const storySlider = document.querySelector('.slider--stories');
  if (storySlider) {
    const storyObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { storySlider.classList.add('is-visible'); storyObserver.disconnect(); }
    }, { threshold: 0.18 });
    storyObserver.observe(storySlider);
  }

  const countElements = [...document.querySelectorAll('[data-count-up]')];
  const renderCount = (element, value) => {
    const prefix = element.dataset.prefix || '';
    const suffix = element.dataset.suffix || '';
    element.textContent = `${prefix}${Math.round(value).toLocaleString('es-ES')}${suffix}`;
  };
  const animateCount = (element, delay = 0) => {
    const target = Number(element.dataset.countUp || 0);
    if (reduceMotion) {
      renderCount(element, target);
      return;
    }
    setTimeout(() => {
      const start = performance.now();
      const duration = 1450;
      const tick = (now) => {
        const progress = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        renderCount(element, target * eased);
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, delay);
  };
  const statsBlock = document.querySelector('.stats');
  if (countElements.length && statsBlock) {
    countElements.forEach((element) => renderCount(element, 0));
    const countObserver = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      countElements.forEach((element, index) => animateCount(element, index * 110));
      countObserver.disconnect();
    }, { threshold: 0.45 });
    countObserver.observe(statsBlock);
  } else if (countElements.length) {
    countElements.forEach((element) => animateCount(element, 0));
  }

  const saleNotification = document.querySelector('[data-sale-notification]');
  const saleTitle = saleNotification?.querySelector('[data-sale-title]');
  const saleValue = saleNotification?.querySelector('[data-sale-value]');
  const salePlatform = saleNotification?.querySelector('[data-sale-platform]');
  const saleIcon = saleNotification?.querySelector('[data-sale-icon]');
  const saleProducts = [
    { product: 'Plan anual · Comunidad', value: '7,90' },
    { product: 'Plan mensual · Comunidad', value: '19,90' },
    { product: 'Curso Mechas Rápidas', value: '267,00' },
    { product: 'Workshop Mechas de Lujo 1', value: '97,00' },
    { product: 'Workshop Mechas de Lujo 2', value: '97,00' },
    { product: 'Crea tu Curso Rentable', value: '100,00' },
    { product: 'Plan anual · pago único', value: '94,80' },
    { product: 'Comunidad Mechas Rápidas', value: '7,90' },
    { product: 'Workshops de Lujo · pack', value: '194,00' },
    { product: 'Workshop presencial con Alicia', value: '297,00' }
  ];
  const cardTitles = ['Nueva venta con tarjeta','Nueva miembra en la Comunidad','Venta aprobada'];
  const transferTitles = ['¡Nueva venta confirmada!','Pago aprobado','Nueva suscripción activa'];
  const headerSales = Array.from({ length: 50 }, (_, index) => {
    const isCard = index % 7 < 5;
    const item = saleProducts[(index * 3 + 1) % saleProducts.length];
    return {
      platform: item.product,
      type: isCard ? 'hotmart' : 'hubla',
      title: isCard ? cardTitles[index % cardTitles.length] : transferTitles[index % transferTitles.length],
      value: item.value
    };
  });
  let headerSaleIndex = 0;
  const showHeaderSale = (index) => {
    if (!saleNotification) return;
    headerSaleIndex = (index + headerSales.length) % headerSales.length;
    const sale = headerSales[headerSaleIndex];
    saleNotification.classList.remove('is-active');
    setTimeout(() => {
      if (saleTitle) saleTitle.textContent = sale.title;
      if (saleValue) saleValue.textContent = `Valor: ${sale.value} €`;
      if (salePlatform) salePlatform.textContent = sale.platform;
      if (saleIcon) {
        saleIcon.className = `hero-sale__icon hero-sale__icon--${sale.type}`;
        const saleImage = saleIcon.querySelector('img');
        if (saleImage) saleImage.src = sale.type === 'hotmart' ? 'assets/notifications/hotmart-97-78.jpg' : 'assets/notifications/hubla-478-80.jpg';
      }
      saleNotification.classList.add('is-active');
    }, reduceMotion ? 0 : 220);
  };
  if (saleNotification && headerSales.length > 1 && !reduceMotion) {
    setInterval(() => showHeaderSale(headerSaleIndex + 1), 2800);
  }

  const heroBenefits = document.querySelector('[data-hero-benefits]');
  const benefitItems = [...document.querySelectorAll('[data-hero-benefit]')];
  const benefitRunner = heroBenefits?.querySelector('.hero__benefit-runner');
  let benefitIndex = 0;
  const showBenefit = (index) => {
    if (!benefitItems.length) return;
    benefitIndex = (index + benefitItems.length) % benefitItems.length;
    benefitItems.forEach((item, itemIndex) => item.classList.toggle('is-active', itemIndex === benefitIndex));
    const activeItem = benefitItems[benefitIndex];
    if (benefitRunner && activeItem) {
      const y = activeItem.offsetTop + (activeItem.offsetHeight - benefitRunner.offsetHeight) / 2;
      const maxY = Math.max(0, heroBenefits.clientHeight - benefitRunner.offsetHeight);
      benefitRunner.style.transform = `translateY(${Math.min(maxY, Math.max(0, y))}px)`;
    }
  };
  benefitItems.forEach((item, index) => item.addEventListener('click', () => showBenefit(index)));
  addEventListener('resize', () => showBenefit(benefitIndex));
  showBenefit(0);
  document.fonts?.ready.then(() => showBenefit(benefitIndex));
  if (benefitItems.length > 1 && !reduceMotion) {
    setInterval(() => showBenefit(benefitIndex + 1), 1650);
  }

  document.querySelectorAll('[data-slider]').forEach((slider) => {
    const viewport = slider.querySelector('[data-slider-viewport]');
    const cards = [...slider.querySelectorAll('.slider__track > *')];
    const dots = slider.querySelector('[data-slider-dots]');
    const prev = slider.querySelector('[data-slider-prev]');
    const next = slider.querySelector('[data-slider-next]');
    if (!viewport || !cards.length) return;
    let active = 0;
    let timer;

    cards.forEach((_, index) => {
      const dot = document.createElement('i');
      if (index === 0) dot.classList.add('is-active');
      dots?.append(dot);
    });

    const stepSize = () => {
      const track = slider.querySelector('.slider__track');
      const gap = track ? Number.parseFloat(getComputedStyle(track).columnGap) || 0 : 0;
      return (cards[0]?.getBoundingClientRect().width || viewport.clientWidth) + gap;
    };
    const goTo = (index, behavior = 'smooth') => {
      active = (index + cards.length) % cards.length;
      viewport.scrollTo({ left: active * stepSize(), behavior });
      [...(dots?.children || [])].forEach((dot, dotIndex) => dot.classList.toggle('is-active', dotIndex === active));
    };
    const restart = () => {
      clearInterval(timer);
      const delay = Number(slider.dataset.autoplay || 0);
      if (delay && !reduceMotion) {
        timer = setInterval(() => {
          if (slider.matches(':hover')) return;
          goTo(active + 1);
        }, delay);
      }
    };

    prev?.addEventListener('click', () => { goTo(active - 1); restart(); });
    next?.addEventListener('click', () => { goTo(active + 1); restart(); });
    viewport.addEventListener('scroll', () => {
      window.clearTimeout(viewport.scrollTimer);
      viewport.scrollTimer = window.setTimeout(() => {
        const index = Math.round(viewport.scrollLeft / stepSize());
        if (index !== active && index >= 0 && index < cards.length) {
          active = index;
          [...(dots?.children || [])].forEach((dot, dotIndex) => dot.classList.toggle('is-active', dotIndex === active));
        }
      }, 90);
    }, { passive: true });
    slider.addEventListener('mouseenter', () => clearInterval(timer));
    slider.addEventListener('mouseleave', restart);
    slider.addEventListener('touchstart', () => clearInterval(timer), { passive: true });
    slider.addEventListener('touchend', restart, { passive: true });
    restart();
  });

  if (reduceMotion) document.querySelectorAll('.module-marquee__row').forEach((row) => { row.style.animation = 'none'; });

  const offerItems = [...document.querySelectorAll('[data-offer-item]')];
  const offerList = document.querySelector('[data-offer-list]');
  if (offerItems.length && offerList && !reduceMotion) {
    let offerHot = 0;
    let offerTimer = null;
    const offerCycle = () => {
      offerItems.forEach((item, i) => item.classList.toggle('is-hot', i === offerHot));
      offerHot = (offerHot + 1) % offerItems.length;
    };
    const offerObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !offerTimer) { offerCycle(); offerTimer = setInterval(offerCycle, 1500); }
      else if (!entry.isIntersecting && offerTimer) { clearInterval(offerTimer); offerTimer = null; }
    }, { threshold: 0.3 });
    offerObserver.observe(offerList);
  }

  const startRotator = (selector, interval) => {
    document.querySelectorAll(selector).forEach((box) => {
      const words = [...box.querySelectorAll('span')];
      if (words.length < 2 || reduceMotion) return;
      let index = 0;
      setInterval(() => {
        const prev = index;
        index = (index + 1) % words.length;
        words[prev].classList.remove('is-active');
        words[prev].classList.add('is-leaving');
        words[index].classList.remove('is-leaving');
        words[index].classList.add('is-active');
        setTimeout(() => words[prev].classList.remove('is-leaving'), 500);
      }, interval);
    });
  };
  startRotator('[data-cta-rotator]', 2000);
  startRotator('[data-price-rotator]', 2000);

  document.querySelectorAll('[data-drag-scroll]').forEach((track) => {
    let down = false;
    let startX = 0;
    let scrollStart = 0;
    track.addEventListener('pointerdown', (event) => {
      down = true;
      startX = event.clientX;
      scrollStart = track.scrollLeft;
      track.setPointerCapture(event.pointerId);
    });
    track.addEventListener('pointermove', (event) => {
      if (down) track.scrollLeft = scrollStart - (event.clientX - startX);
    });
    ['pointerup', 'pointercancel'].forEach((name) => track.addEventListener(name, () => { down = false; }));
  });

  const viralTrack = document.querySelector('.viral-track');
  if (viralTrack && !viralTrack.dataset.cloned) {
    [...viralTrack.children].forEach((card) => viralTrack.append(card.cloneNode(true)));
    viralTrack.dataset.cloned = 'true';
  }
})();
