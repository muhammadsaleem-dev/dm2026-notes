(function () {
  "use strict";

  // Theme toggle
  var themeBtn = document.getElementById("themeToggle");
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var root = document.documentElement;
      var current = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
      var next = current === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("dm2026-theme", next); } catch (e) {}
    });
  }

  // Mobile menu (chapters + on-page contents)
  var navToggle = document.getElementById("navToggle");
  var navPanel = document.getElementById("navPanel");
  if (navToggle && navPanel) {
    navToggle.addEventListener("click", function () {
      var isOpen = navPanel.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
    navPanel.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        navPanel.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }
})();
