(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const progressBar = document.querySelector('.page-progress span');
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    progressBar.style.width = `${max > 0 ? (scrollY / max) * 100 : 0}%`;
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
    element.textContent = `${prefix}${Math.round(value).toLocaleString('pt-BR')}${suffix}`;
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
  if (countElements.length) {
    countElements.forEach((element) => renderCount(element, 0));
    const countObserver = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      countElements.forEach((element, index) => animateCount(element, index * 110));
      countObserver.disconnect();
    }, { threshold: 0.45 });
    countObserver.observe(document.querySelector('.stats'));
  }

  const saleNotification = document.querySelector('[data-sale-notification]');
  const saleTitle = saleNotification?.querySelector('[data-sale-title]');
  const saleValue = saleNotification?.querySelector('[data-sale-value]');
  const salePlatform = saleNotification?.querySelector('[data-sale-platform]');
  const saleIcon = saleNotification?.querySelector('[data-sale-icon]');
  const saleValues = ['29,90','37,00','39,90','47,00','49,90','57,00','59,80','67,00','69,90','77,00','79,90','87,00','89,70','97,00','99,90','117,00','127,00','137,00','147,00','157,00','167,00','177,00','197,00','217,00','247,00','297,00','347,00','397,00','497,00','597,00','697,00','997,00'];
  const hotmartTitles = ['Venda realizada no cartão','Venda realizada no Pix','Venda aprovada'];
  const hublaTitles = ['Venda realizada!','Pagamento aprovado no Pix','Nova venda confirmada'];
  const headerSales = Array.from({ length: 50 }, (_, index) => {
    const isHotmart = index % 7 < 5;
    return {
      platform: isHotmart ? 'Hotmart' : 'Hubla',
      type: isHotmart ? 'hotmart' : 'hubla',
      title: isHotmart ? hotmartTitles[index % hotmartTitles.length] : hublaTitles[index % hublaTitles.length],
      value: saleValues[(index * 7 + 3) % saleValues.length]
    };
  });
  let headerSaleIndex = 0;
  const showHeaderSale = (index) => {
    headerSaleIndex = (index + headerSales.length) % headerSales.length;
    const sale = headerSales[headerSaleIndex];
    saleNotification?.classList.remove('is-active');
    setTimeout(() => {
      if (!saleNotification) return;
      saleTitle.textContent = sale.title;
      saleValue.textContent = `Valor: R$ ${sale.value}`;
      salePlatform.textContent = sale.platform;
      saleIcon.className = `hero-sale__icon hero-sale__icon--${sale.type}`;
      saleIcon.querySelector('img').src = sale.type === 'hotmart' ? 'assets/notifications/hotmart-97-78.jpg' : 'assets/notifications/hubla-478-80.jpg';
      saleNotification.classList.add('is-active');
    }, reduceMotion ? 0 : 220);
  };
  if (headerSales.length > 1 && !reduceMotion) {
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
    let active = 0;
    let timer;

    cards.forEach((_, index) => {
      const dot = document.createElement('i');
      if (index === 0) dot.classList.add('is-active');
      dots?.append(dot);
    });

    const stepSize = () => {
      const track = slider.querySelector('.slider__track');
      const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;
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

  const memberMarquee = document.querySelector('[data-member-marquee]');
  if (memberMarquee && !reduceMotion) {
    const memberTracks = [...memberMarquee.querySelectorAll('[data-member-track]')];
    let memberMarqueePaused = false;

    const pauseMemberMarquee = () => { memberMarqueePaused = true; };
    const resumeMemberMarquee = () => { memberMarqueePaused = false; };
    memberMarquee.addEventListener('mouseenter', pauseMemberMarquee);
    memberMarquee.addEventListener('mouseleave', resumeMemberMarquee);
    memberMarquee.addEventListener('touchstart', pauseMemberMarquee, { passive: true });
    memberMarquee.addEventListener('touchend', resumeMemberMarquee, { passive: true });

    memberTracks.forEach((track) => {
      const speed = Number(track.dataset.speed || 70);
      let offset = 0;
      let previousFrame = performance.now();

      const moveTrack = (now) => {
        const elapsed = Math.min((now - previousFrame) / 1000, .05);
        previousFrame = now;
        if (!memberMarqueePaused) offset += speed * elapsed;

        let firstCard = track.firstElementChild;
        const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;
        while (firstCard && offset >= firstCard.getBoundingClientRect().width + gap) {
          offset -= firstCard.getBoundingClientRect().width + gap;
          track.append(firstCard);
          firstCard = track.firstElementChild;
        }
        track.style.transform = `translate3d(${-offset}px, 0, 0)`;
        requestAnimationFrame(moveTrack);
      };
      requestAnimationFrame(moveTrack);
    });
  }

  const appScreens = {
    home: {
      image: 'assets/app-mobile/home.png',
      title: 'Sua jornada começa organizada',
      copy: 'Cursos, módulos e materiais em uma tela simples. Você entra e já sabe o próximo passo.',
      alt: 'Tela inicial do aplicativo'
    },
    agentes: {
      image: 'assets/app-mobile/agentes.png',
      title: 'Onze especialistas de IA trabalhando com você',
      copy: 'Pesquisa, nome, arquitetura, roteiros, promessa, materiais, anúncios e viralização.',
      alt: 'Estúdio de Criação com agentes de inteligência artificial'
    },
    'ao-vivo': {
      image: 'assets/app-mobile/ao-vivo.png',
      title: 'Toda semana, direção em tempo real',
      copy: 'Aulas ao vivo, próximos encontros e replays organizados dentro do próprio aplicativo.',
      alt: 'Área de aulas ao vivo do aplicativo'
    },
    comunidade: {
      image: 'assets/app-mobile/comunidade.png',
      title: 'Resultados compartilhados viram combustível',
      copy: 'Publique conquistas, acompanhe outras profissionais e cresça cercada de quem está fazendo.',
      alt: 'Comunidade interna do aplicativo'
    }
  };
  const appImage = document.querySelector('#app-screen');
  const appTitle = document.querySelector('#app-demo-title');
  const appCopy = document.querySelector('#app-demo-copy');
  const appButtons = [...document.querySelectorAll('[data-app-screen]')];
  let currentAppScreen = 'home';
  let appTimer;

  const setAppScreen = (key) => {
    const screen = appScreens[key];
    if (!screen || key === currentAppScreen) return;
    currentAppScreen = key;
    appImage.classList.add('is-changing');
    setTimeout(() => {
      appImage.src = screen.image;
      appImage.alt = screen.alt;
      appTitle.textContent = screen.title;
      appCopy.textContent = screen.copy;
      appImage.classList.remove('is-changing');
    }, reduceMotion ? 0 : 180);
    appButtons.forEach((button) => button.classList.toggle('is-active', button.dataset.appScreen === key));
  };
  const resetAppTimer = () => {
    clearInterval(appTimer);
    if (reduceMotion) return;
    const keys = Object.keys(appScreens);
    appTimer = setInterval(() => setAppScreen(keys[(keys.indexOf(currentAppScreen) + 1) % keys.length]), 4800);
  };
  appButtons.forEach((button) => button.addEventListener('click', () => {
    setAppScreen(button.dataset.appScreen);
    resetAppTimer();
  }));
  resetAppTimer();

  const factory = document.querySelector('[data-factory]');
  const factorySlides = [...document.querySelectorAll('[data-factory-slide]')];
  const factoryDots = [...document.querySelectorAll('[data-factory-dot]')];
  const factoryProgress = document.querySelector('.factory__progress i');
  const factoryPercent = document.querySelector('#factory-percent');
  const factoryStatus = document.querySelector('#factory-status');
  const factoryStatuses = [
    'Analisando o seu mercado...',
    'Criando um nome potente...',
    'Organizando módulos e aulas...',
    'Escrevendo os roteiros...',
    'Lapidando a promessa...',
    'Produzindo o material técnico...',
    'Curso pronto para vender!'
  ];
  let factoryIndex = 0;
  let factoryTimer = null;
  const FACTORY_STEP_MS = 2600;
  const FACTORY_FINAL_MS = 4200;
  const renderFactory = (index) => {
    const previous = factoryIndex;
    factoryIndex = index % factorySlides.length;
    const percent = Math.round(((factoryIndex + 1) / factorySlides.length) * 100);
    factorySlides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-leaving', slideIndex === previous && previous !== factoryIndex);
      slide.classList.toggle('is-active', slideIndex === factoryIndex);
      if (slideIndex !== previous) slide.classList.remove('is-leaving');
    });
    factoryDots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === factoryIndex);
      dot.classList.toggle('is-done', dotIndex < factoryIndex);
    });
    if (factoryProgress) factoryProgress.style.width = `${percent}%`;
    if (factoryPercent) factoryPercent.textContent = percent;
    if (factoryStatus) factoryStatus.textContent = factoryStatuses[factoryIndex];
  };
  const scheduleFactory = () => {
    const wait = factoryIndex === factorySlides.length - 1 ? FACTORY_FINAL_MS : FACTORY_STEP_MS;
    factoryTimer = setTimeout(() => { renderFactory(factoryIndex + 1); scheduleFactory(); }, wait);
  };
  factoryDots.forEach((dot, index) => dot.addEventListener('click', () => {
    clearTimeout(factoryTimer);
    renderFactory(index);
    if (!reduceMotion) scheduleFactory();
  }));
  if (factory && factorySlides.length && !reduceMotion) {
    const factoryObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !factoryTimer) scheduleFactory();
      else if (!entry.isIntersecting) { clearTimeout(factoryTimer); factoryTimer = null; }
    }, { threshold: 0.3 });
    factoryObserver.observe(factory);
  }

  if (reduceMotion) document.querySelectorAll('.module-marquee__row').forEach((row) => { row.style.animation = 'none'; });

  const offerItems = [...document.querySelectorAll('[data-offer-item]')];
  if (offerItems.length && !reduceMotion) {
    let offerHot = 0;
    let offerTimer = null;
    const offerCycle = () => {
      offerItems.forEach((item, i) => item.classList.toggle('is-hot', i === offerHot));
      offerHot = (offerHot + 1) % offerItems.length;
    };
    const offerList = document.querySelector('[data-offer-list]');
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
  startRotator('[data-vsl-ticker] .vsl__ticker-track', 3200);

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
