/* ==================================================================
   سكربت موقع «مع عبدالعزيز — نتعلم معاً»
   يعمل مباشرة عند فتح index.html — بدون أي اعتماد على مكتبات خارجية.
   ================================================================== */
(function () {
  'use strict';

  // تفعيل صنف JavaScript حتى لا تظهر تأثيرات الظهور إذا تعطّل السكربت.
  document.documentElement.classList.add('js');

  /* ----------------------------------------------------------------
     1) القوائم: القائمة العلوية + الشريط الجانبي + الطبقة الخلفية
     ---------------------------------------------------------------- */
  const topNav       = document.getElementById('topNav');
  const menuToggle   = document.getElementById('menuToggle');
  const menuIcon     = document.getElementById('menuIcon');
  const sidebar      = document.getElementById('lessonsSidebar');
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebarClose = document.getElementById('sidebarClose');
  const backdrop     = document.getElementById('backdrop');

  function showBackdrop(show) {
    backdrop.hidden = !show;
  }

  function closePanels() {
    topNav.classList.remove('is-open');
    sidebar.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    sidebarToggle.setAttribute('aria-expanded', 'false');
    menuIcon.firstElementChild.setAttribute('href', '#i-menu');
    showBackdrop(false);
  }

  menuToggle.addEventListener('click', function () {
    const willOpen = !topNav.classList.contains('is-open');
    closePanels();
    if (willOpen) {
      topNav.classList.add('is-open');
      menuToggle.setAttribute('aria-expanded', 'true');
      menuIcon.firstElementChild.setAttribute('href', '#i-close');
      showBackdrop(true);
    }
  });

  sidebarToggle.addEventListener('click', function () {
    const willOpen = !sidebar.classList.contains('is-open');
    closePanels();
    if (willOpen) {
      sidebar.classList.add('is-open');
      sidebarToggle.setAttribute('aria-expanded', 'true');
      showBackdrop(true);
    }
  });

  sidebarClose.addEventListener('click', closePanels);
  backdrop.addEventListener('click', closePanels);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closePanels();
  });

  // إغلاق القائمة تلقائياً بعد اختيار رابط.
  topNav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closePanels);
  });
  sidebar.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closePanels);
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth >= 1080) closePanels();
  });

  /* ----------------------------------------------------------------
     2) شريط التقدم + زر العودة للأعلى
     ---------------------------------------------------------------- */
  const progressBar = document.getElementById('progressBar');
  const toTop = document.getElementById('toTop');
  let scrollQueued = false;

  function updateScrollUI() {
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    const percent = max > 0 ? (window.scrollY / max) * 100 : 0;
    progressBar.style.width = percent + '%';
    toTop.classList.toggle('is-visible', window.scrollY > 420);
  }

  window.addEventListener('scroll', function () {
    if (scrollQueued) return;
    scrollQueued = true;
    window.requestAnimationFrame(function () {
      updateScrollUI();
      scrollQueued = false;
    });
  }, { passive: true });
  updateScrollUI();

  toTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ----------------------------------------------------------------
     3) ظهور العناصر بلطف عند التمرير
     ---------------------------------------------------------------- */
  const revealItems = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.06, rootMargin: '0px 0px -30px 0px' });
    revealItems.forEach(function (item) { revealObserver.observe(item); });
  } else {
    revealItems.forEach(function (item) { item.classList.add('is-visible'); });
  }

  /* ----------------------------------------------------------------
     4) إبراز الرابط النشط أثناء التصفح
     ---------------------------------------------------------------- */
  const navLinks = Array.prototype.slice.call(document.querySelectorAll('.top-nav .nav-link'));
  const sidebarLinks = Array.prototype.slice.call(document.querySelectorAll('.sidebar-nav a'));
  const watchedSections = Array.prototype.slice.call(document.querySelectorAll('main section[id], main article[id]'));

  if ('IntersectionObserver' in window) {
    const activeObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        const hash = '#' + entry.target.id;
        navLinks.forEach(function (link) { link.classList.toggle('active', link.getAttribute('href') === hash); });
        sidebarLinks.forEach(function (link) { link.classList.toggle('is-active', link.getAttribute('href') === hash); });
      });
    }, { rootMargin: '-28% 0px -62% 0px', threshold: 0 });
    watchedSections.forEach(function (section) { activeObserver.observe(section); });
  }

  /* ----------------------------------------------------------------
     5) البحث والتصفية داخل مكتبة الدروس
     ---------------------------------------------------------------- */
  const searchInput = document.getElementById('librarySearch');
  const filterChips = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
  const courseCards = Array.prototype.slice.call(document.querySelectorAll('.course-card'));
  const emptyState = document.getElementById('emptyState');
  let activeFilter = 'all';

  function applyCourseFilters() {
    const term = searchInput.value.trim().toLowerCase();
    let visible = 0;
    courseCards.forEach(function (card) {
      const matchesCategory = activeFilter === 'all' || card.dataset.category === activeFilter;
      const matchesText = !term || card.textContent.toLowerCase().includes(term);
      const show = matchesCategory && matchesText;
      card.style.display = show ? '' : 'none';
      if (show) visible += 1;
    });
    emptyState.hidden = visible !== 0;
  }

  searchInput.addEventListener('input', applyCourseFilters);
  filterChips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      filterChips.forEach(function (c) { c.classList.remove('is-active'); });
      chip.classList.add('is-active');
      activeFilter = chip.dataset.filter;
      applyCourseFilters();
    });
  });

  /* ----------------------------------------------------------------
     6) تصفية فيديوهات معرض الوسائط
     ---------------------------------------------------------------- */
  const mediaChips = Array.prototype.slice.call(document.querySelectorAll('[data-media-filter]'));
  const mediaCards = Array.prototype.slice.call(document.querySelectorAll('.media-card'));

  mediaChips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      mediaChips.forEach(function (c) { c.classList.remove('is-active'); });
      chip.classList.add('is-active');
      const filter = chip.dataset.mediaFilter;
      mediaCards.forEach(function (card) {
        card.style.display = (filter === 'all' || card.dataset.media === filter) ? '' : 'none';
      });
    });
  });

  /* ----------------------------------------------------------------
     7) إشعار صغير (Toast) + نسخ النص
     ---------------------------------------------------------------- */
  const toast = document.getElementById('toast');
  let toastTimer;

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () { toast.classList.remove('is-visible'); }, 2800);
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    // بديل للعمل عند فتح الملف من جهازك (بروتوكول file:).
    return new Promise(function (resolve, reject) {
      const area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      try {
        const done = document.execCommand('copy');
        document.body.removeChild(area);
        done ? resolve() : reject();
      } catch (err) {
        document.body.removeChild(area);
        reject(err);
      }
    });
  }

  /* ----------------------------------------------------------------
     8) أزرار مشاركة الدروس والفيديوهات
     ---------------------------------------------------------------- */
  function targetUrl(id) {
    return window.location.href.split('#')[0] + '#' + id;
  }

  document.querySelectorAll('[data-share]').forEach(function (button) {
    button.addEventListener('click', function () {
      const type = button.dataset.share;
      const title = button.dataset.title;
      const url = targetUrl(button.dataset.target);

      if (type === 'copy') {
        copyText(url).then(
          function () { showToast('تم نسخ رابط الدرس ✓'); },
          function () { showToast('تعذّر النسخ، انسخ الرابط من شريط العنوان'); }
        );
        return;
      }

      const shareUrls = {
        facebook: 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url),
        x: 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(title) + '&url=' + encodeURIComponent(url),
        whatsapp: 'https://wa.me/?text=' + encodeURIComponent(title + ' — ' + url)
      };

      if (shareUrls[type]) {
        window.open(shareUrls[type], '_blank', 'noopener,noreferrer,width=640,height=560');
      }
    });
  });

  /* ----------------------------------------------------------------
     9) نموذج التواصل (تحقق + تجهيز رسالة بريد جاهزة)
     ملاحظة: غيّر قيمة CONTACT_EMAIL إلى بريدك الخاص عند النشر.
     ---------------------------------------------------------------- */
  const CONTACT_EMAIL = 'abdulaziz@example.com';
  const form = document.getElementById('contactForm');

  const rules = {
    name: function (v) { return v.trim().length >= 2 ? '' : 'اكتب اسمك (حرفان على الأقل).'; },
    email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'أدخل بريداً إلكترونياً صحيحاً.'; },
    subject: function (v) { return v.trim().length >= 3 ? '' : 'اكتب موضوعاً واضحاً.'; },
    message: function (v) { return v.trim().length >= 10 ? '' : 'الرسالة قصيرة جداً (10 أحرف على الأقل).'; }
  };

  function validateField(input) {
    const message = rules[input.id](input.value);
    document.getElementById(input.id + 'Error').textContent = message;
    input.classList.toggle('is-invalid', Boolean(message));
    return !message;
  }

  Object.keys(rules).forEach(function (id) {
    const input = document.getElementById(id);
    input.addEventListener('input', function () { validateField(input); });
    input.addEventListener('blur', function () { validateField(input); });
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    let valid = true;
    Object.keys(rules).forEach(function (id) {
      if (!validateField(document.getElementById(id))) valid = false;
    });

    if (!valid) {
      showToast('يرجى تصحيح الحقول المشار إليها');
      return;
    }

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const subject = document.getElementById('subject').value.trim();
    const message = document.getElementById('message').value.trim();
    const body = 'الاسم: ' + name + '\nالبريد: ' + email + '\n\n' + message;

    showToast('تم تجهيز رسالتك — أكملها من برنامج البريد');
    window.location.href = 'mailto:' + CONTACT_EMAIL +
      '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(body);
  });

})();
