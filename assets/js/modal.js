(function () {
  const modal = document.getElementById("formModal");
  if (!modal) return;

  const closeEls = modal.querySelectorAll("[data-close-modal]");
  const focusableSelector =
    'button, [href], input, select, textarea, iframe, [tabindex]:not([tabindex="-1"])';

  let lastFocus = null;

  function getFirstFocusable() {
    // prioriza o botão "Fechar" visível
    const preferred = modal.querySelector(".link-close");
    if (preferred) return preferred;

    const list = modal.querySelectorAll(focusableSelector);
    return list.length ? list[0] : null;
  }

  function openModal(source) {
    if (modal.classList.contains("is-open")) return;

    lastFocus = document.activeElement;

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");

    document.body.classList.add("modal-open");

    // Foco inicial
    const first = getFirstFocusable();
    if (first) setTimeout(() => first.focus(), 0);

    window.dlPush?.("modal_open", {
      modal: "google_form",
      source: source || "unknown",
      page: location.pathname,
    });
  }

  function closeModal() {
    if (!modal.classList.contains("is-open")) return;

    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");

    document.body.classList.remove("modal-open");

    // volta o foco para o elemento que abriu
    if (lastFocus && typeof lastFocus.focus === "function") {
      setTimeout(() => lastFocus.focus(), 0);
    }
    lastFocus = null;

    window.dlPush?.("modal_close", {
      modal: "google_form",
      page: location.pathname,
    });
  }

  // Abrir (qualquer CTA com data-open-form)
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-open-form]");
    if (!t) return;

    e.preventDefault();
    openModal(t.id || t.getAttribute("data-open-form") || "cta");
  });

  // Fechar (botões com data-close-modal)
  closeEls.forEach((el) => el.addEventListener("click", closeModal));

  // Fecha clicando fora (backdrop)
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  // Fecha no ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("is-open")) {
      closeModal();
    }
  });

  // (opcional, mas recomendado) impede click “vazar” pro fundo no iOS
  modal.addEventListener(
    "touchmove",
    (e) => {
      if (!modal.classList.contains("is-open")) return;
      // deixa o iframe rolar; bloqueia o resto
      if (!e.target.closest("iframe")) e.preventDefault();
    },
    { passive: false }
  );
})();
