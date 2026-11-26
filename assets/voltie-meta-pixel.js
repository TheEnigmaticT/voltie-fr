/* Voltie Meta Pixel: PageView only after an explicit marketing-consent choice. */
(() => {
  'use strict';
  if (window.__voltieMetaConsent) return;
  const PIXEL_ID = '302761102408523';
  const STORAGE_KEY = 'voltie-marketing-consent-v1';
  const copy = {
    en: { title: 'Your privacy choices', body: 'With your permission, we use Meta Pixel to measure visits and advertising performance. Meta may receive your IP address, device and browser information, and the page visited. You can change your choice at any time.', accept: 'Accept marketing', reject: 'Reject marketing', settings: 'Privacy choices', unavailable: 'Marketing tracking is unavailable in this browser.' },
    de: { title: 'Ihre Datenschutzeinstellungen', body: 'Mit Ihrer Zustimmung verwenden wir Meta Pixel, um Besuche und die Leistung unserer Werbung zu messen. Meta kann dabei Ihre IP-Adresse, Geräte- und Browserinformationen sowie die besuchte Seite erhalten. Sie können Ihre Auswahl jederzeit ändern.', accept: 'Marketing akzeptieren', reject: 'Marketing ablehnen', settings: 'Datenschutzeinstellungen', unavailable: 'Marketing-Tracking ist in diesem Browser nicht verfügbar.' },
    es: { title: 'Tus opciones de privacidad', body: 'Con tu permiso, utilizamos Meta Pixel para medir las visitas y el rendimiento de la publicidad. Meta puede recibir tu dirección IP, información sobre tu dispositivo y navegador y la página visitada. Puedes cambiar tu elección en cualquier momento.', accept: 'Aceptar marketing', reject: 'Rechazar marketing', settings: 'Opciones de privacidad', unavailable: 'El seguimiento de marketing no está disponible en este navegador.' },
    fr: { title: 'Vos choix de confidentialité', body: 'Avec votre accord, nous utilisons le pixel Meta pour mesurer les visites et les performances publicitaires. Meta peut recevoir votre adresse IP, des informations sur votre appareil et votre navigateur, ainsi que la page consultée. Vous pouvez modifier votre choix à tout moment.', accept: 'Accepter le marketing', reject: 'Refuser le marketing', settings: 'Choix de confidentialité', unavailable: 'Le suivi publicitaire est indisponible dans ce navigateur.' },
  };
  const language = document.documentElement.lang.split('-')[0];
  const text = copy[language] || copy.en;
  let preference = null;
  try { preference = localStorage.getItem(STORAGE_KEY); } catch (_) { /* Default to no consent. */ }
  let started = false;
  let pageViewSent = false;
  let settings;
  const panel = document.createElement('section');
  panel.className = 'vmp-consent';
  panel.setAttribute('role', 'region');
  panel.setAttribute('aria-labelledby', 'vmp-title');
  const heading = document.createElement('h2');
  heading.id = 'vmp-title';
  heading.textContent = text.title;
  const paragraph = document.createElement('p');
  paragraph.textContent = text.body;
  const actions = document.createElement('div');
  actions.className = 'vmp-actions';
  const reject = document.createElement('button');
  reject.type = 'button';
  reject.dataset.metaConsent = 'reject';
  reject.textContent = text.reject;
  const accept = document.createElement('button');
  accept.type = 'button';
  accept.dataset.metaConsent = 'accept';
  accept.textContent = text.accept;
  actions.append(reject, accept);
  panel.append(heading, paragraph, actions);
  document.body.append(panel);
  settings = document.createElement('button');
  settings.type = 'button';
  settings.className = 'vmp-settings';
  settings.textContent = text.settings;
  settings.setAttribute('aria-controls', 'vmp-title');
  document.body.append(settings);

  function remember(value) {
    preference = value;
    try { localStorage.setItem(STORAGE_KEY, value); } catch (_) { /* Consent remains memory-only. */ }
  }
  function startPixel() {
    if (preference !== 'granted') return;
    if (!started) {
      started = true;
      // Standard Meta loader. No Meta script, image or preconnect exists before consent.
      if (!window.fbq) {
        const n = window.fbq = function () {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!window._fbq) window._fbq = n;
        n.push = n;
        n.loaded = true;
        n.version = '2.0';
        n.queue = [];
        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://connect.facebook.net/en_US/fbevents.js';
        script.onerror = () => { window.__voltieMetaConsent.loadError = true; };
        document.head.append(script);
      }
      window.fbq('consent', 'grant');
      window.fbq('set', 'autoConfig', false, PIXEL_ID);
      window.fbq('init', PIXEL_ID);
    } else {
      window.fbq('consent', 'grant');
    }
    if (!pageViewSent) {
      pageViewSent = true;
      window.fbq('trackSingle', PIXEL_ID, 'PageView');
    }
  }
  function clearMetaCookies() {
    for (const key of ['_fbp', '_fbc']) {
      document.cookie = `${key}=; Max-Age=0; path=/; SameSite=Lax; Secure`;
      const parts = location.hostname.split('.');
      for (let i = 0; i < parts.length - 1; i++) {
        document.cookie = `${key}=; Max-Age=0; path=/; domain=.${parts.slice(i).join('.')}; SameSite=Lax; Secure`;
      }
    }
  }
  function closePanel() {
    panel.hidden = true;
    settings.hidden = false;
    settings.focus({ preventScroll: true });
  }
  accept.addEventListener('click', () => {
    remember('granted');
    startPixel();
    closePanel();
  });
  reject.addEventListener('click', () => {
    remember('denied');
    if (window.fbq && started) window.fbq('consent', 'revoke');
    clearMetaCookies();
    closePanel();
  });
  settings.addEventListener('click', () => {
    panel.hidden = false;
    settings.hidden = true;
    reject.focus({ preventScroll: true });
  });
  window.__voltieMetaConsent = {
    pixelId: PIXEL_ID,
    get preference() { return preference; },
    get pageViewQueued() { return pageViewSent; },
    loadError: false,
  };
  if (preference === 'granted' || preference === 'denied') {
    panel.hidden = true;
    settings.hidden = false;
    if (preference === 'granted') startPixel();
  } else {
    settings.hidden = true;
  }
})();
