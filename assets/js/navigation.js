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

    if (!toggle || !drawer || !backdrop || !closeButton) return;

    const setOpen = (open) => {
      body.classList.toggle("menu-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      drawer.setAttribute("aria-hidden", String(!open));
      if (open) closeButton.focus();
      else toggle.focus();
    };

    toggle.addEventListener("click", () => {
      setOpen(!body.classList.contains("menu-open"));
    });

    closeButton.addEventListener("click", () => setOpen(false));
    backdrop.addEventListener("click", () => setOpen(false));

    drawer.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        body.classList.remove("menu-open");
        toggle.setAttribute("aria-expanded", "false");
        drawer.setAttribute("aria-hidden", "true");
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && body.classList.contains("menu-open")) {
        setOpen(false);
      }
    });
  };

  const setupSearch = () => {
    const root = document.querySelector("[data-site-search]");
    if (!root) return;

    const input = root.querySelector("[data-search-input]");
    const results = root.querySelector("[data-search-results]");
    const empty = root.querySelector("[data-search-empty]");
    const items = Array.from(root.querySelectorAll("[data-search-item]"));

    if (!input || !results || !empty) return;

    const reset = () => {
      items.forEach((item) => {
        item.hidden = true;
      });
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
        item.hidden = !match;
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
