(() => {
  "use strict";

  const config = window.CALL_BLUFF_SITE_CONFIG || {};
  const supportedLanguages = new Set(["en", "he"]);
  const defaultLanguage = "en";
  const supportEmail = String(config.supportEmail || "").trim();

  function readSavedLanguage() {
    try {
      return window.localStorage.getItem("call-bluff-site-language");
    } catch {
      return null;
    }
  }

  function saveLanguage(language) {
    try {
      window.localStorage.setItem("call-bluff-site-language", language);
    } catch {
      // The site remains fully usable when storage is unavailable.
    }
  }

  function requestedLanguage() {
    const queryLanguage = new URL(window.location.href).searchParams.get("lang");
    if (supportedLanguages.has(queryLanguage)) return queryLanguage;

    const savedLanguage = readSavedLanguage();
    if (supportedLanguages.has(savedLanguage)) return savedLanguage;

    return navigator.language.toLowerCase().startsWith("he") ? "he" : defaultLanguage;
  }

  function updateLanguageAwareLinks(language) {
    document.querySelectorAll("[data-language-aware]").forEach((link) => {
      const url = new URL(link.getAttribute("href"), window.location.href);
      url.searchParams.set("lang", language);
      link.setAttribute("href", `${url.pathname}${url.search}${url.hash}`);
    });
  }

  function setLanguage(language, updateAddress = true) {
    const nextLanguage = supportedLanguages.has(language) ? language : defaultLanguage;
    const isHebrew = nextLanguage === "he";

    document.documentElement.lang = nextLanguage;
    document.documentElement.dir = isHebrew ? "rtl" : "ltr";
    document.body.dataset.language = nextLanguage;

    document.querySelectorAll("[data-lang-panel]").forEach((panel) => {
      panel.hidden = panel.dataset.langPanel !== nextLanguage;
    });

    document.querySelectorAll("[data-set-lang]").forEach((button) => {
      const active = button.dataset.setLang === nextLanguage;
      button.setAttribute("aria-pressed", String(active));
      button.classList.toggle("is-active", active);
    });

    updateLanguageAwareLinks(nextLanguage);
    saveLanguage(nextLanguage);

    if (updateAddress) {
      const url = new URL(window.location.href);
      url.searchParams.set("lang", nextLanguage);
      window.history.replaceState({}, "", url);
    }
  }

  function configureContactLinks() {
    const placeholder = !supportEmail || supportEmail.endsWith("@example.com");
    document.querySelectorAll("[data-support-email]").forEach((element) => {
      if (supportEmail) element.textContent = supportEmail;
      element.classList.toggle("configuration-placeholder", placeholder);
    });

    document.querySelectorAll("[data-support-link]").forEach((link) => {
      const subject = link.dataset.subject || "Call Bluff! Support";
      if (supportEmail) {
        link.setAttribute("href", `mailto:${supportEmail}?subject=${encodeURIComponent(subject)}`);
      } else {
        link.removeAttribute("href");
        link.setAttribute("aria-disabled", "true");
      }
      link.classList.toggle("configuration-placeholder", placeholder);
    });
  }

  document.querySelectorAll("[data-set-lang]").forEach((button) => {
    button.addEventListener("click", () => setLanguage(button.dataset.setLang));
  });

  document.querySelectorAll("[data-current-year]").forEach((element) => {
    element.textContent = String(new Date().getFullYear());
  });

  configureContactLinks();
  setLanguage(requestedLanguage(), false);
})();
