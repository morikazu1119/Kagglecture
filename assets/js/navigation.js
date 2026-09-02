(() => {
  const normalize = (value) =>
    (value || "")
      .normalize("NFKC")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();

  const setupDrawer = () => {
    const body = document.body;
    const toggle = document.querySelector("[data-menu-toggle]");
    const drawer = document.querySelector("[data-site-drawer]");
    const backdrop = document.querySelector("[data-drawer-backdrop]");
    const closeButton = document.querySelector("[data-drawer-close]");
    const mobileQuery = window.matchMedia("(max-width: 768px)");

    if (!toggle || !drawer || !backdrop || !closeButton) return;

    const applyViewportMode = () => {
      body.classList.remove("menu-open");

      if (mobileQuery.matches) {
        toggle.setAttribute("aria-expanded", "false");
        drawer.setAttribute("aria-hidden", "true");
        drawer.inert = true;
      } else {
        toggle.setAttribute("aria-expanded", "true");
        drawer.setAttribute("aria-hidden", "false");
        drawer.inert = false;
      }
    };

    const setMobileOpen = (open, focus = true) => {
      if (!mobileQuery.matches) return;

      body.classList.toggle("menu-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      drawer.setAttribute("aria-hidden", String(!open));
      drawer.inert = !open;

      if (!focus) return;
      if (open) closeButton.focus();
      else toggle.focus();
    };

    toggle.addEventListener("click", () => {
      setMobileOpen(!body.classList.contains("menu-open"));
    });

    closeButton.addEventListener("click", () => setMobileOpen(false));
    backdrop.addEventListener("click", () => setMobileOpen(false));

    drawer.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        if (mobileQuery.matches) setMobileOpen(false, false);
      });
    });

    document.addEventListener("keydown", (event) => {
      if (
        event.key === "Escape" &&
        mobileQuery.matches &&
        body.classList.contains("menu-open")
      ) {
        setMobileOpen(false);
      }
    });

    if (typeof mobileQuery.addEventListener === "function") {
      mobileQuery.addEventListener("change", applyViewportMode);
    } else {
      mobileQuery.addListener(applyViewportMode);
    }

    applyViewportMode();
  };

  const setupSearch = () => {
    const root = document.querySelector("[data-site-search]");
    if (!root) return;

    const input = root.querySelector("[data-search-input]");
    const results = root.querySelector("[data-search-results]");
    const empty = root.querySelector("[data-search-empty]");
    const items = Array.from(root.querySelectorAll("[data-search-item]"));

    if (!input || !results || !empty) return;

    const setItemVisible = (item, visible) => {
      item.hidden = !visible;
      item.style.display = visible ? "block" : "none";
    };

    const reset = () => {
      items.forEach((item) => setItemVisible(item, false));
      results.classList.remove("is-visible");
      empty.classList.remove("is-visible");
    };

    const update = () => {
      const query = normalize(input.value);
      if (!query) {
        reset();
        return;
      }

      const terms = query.split(" ").filter(Boolean);
      let visibleCount = 0;

      items.forEach((item) => {
        const haystack = normalize(item.dataset.searchText);
        const match = terms.every((term) => haystack.includes(term));
        setItemVisible(item, match);
        if (match) visibleCount += 1;
      });

      results.classList.add("is-visible");
      empty.classList.toggle("is-visible", visibleCount === 0);
    };

    reset();
    input.addEventListener("input", update);
    input.addEventListener("search", update);
  };

  document.addEventListener("DOMContentLoaded", () => {
    setupDrawer();
    setupSearch();
  });
})();
