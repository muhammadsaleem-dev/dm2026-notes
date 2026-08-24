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


// Toast notification
  function showToast(message) {
    var toast = document.getElementById("toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "toast";
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.className = "toast show";
    setTimeout(function(){ toast.className = "toast"; }, 2500);
  }

  // Mode toggle
  var modeBtn = document.getElementById("modeToggle");
  if (modeBtn) {
    // Initialize button icon based on current state
    var currentMode = document.documentElement.getAttribute("data-mode") || "kid";
    modeBtn.textContent = currentMode === "tech" ? "📖" : "🎓";
    
    modeBtn.addEventListener("click", function () {
      var root = document.documentElement;
      var current = root.getAttribute("data-mode") === "tech" ? "tech" : "kid";
      var next = current === "tech" ? "kid" : "tech";
      root.setAttribute("data-mode", next);
      try { localStorage.setItem("dm2026-mode", next); } catch (e) {}
      
      if (next === "tech") {
        modeBtn.textContent = "📖";
        showToast("Technical Notes Enabled");
      } else {
        modeBtn.textContent = "🎓";
        showToast("Intuitive Analogies Enabled");
      }
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

  // Simple syntax highlighting for python comments
  var codeBlocks = document.querySelectorAll('.python-note pre code');
  codeBlocks.forEach(function(block) {
    var html = block.innerHTML;
    var highlighted = html.replace(/^( *)(#.*)$/gm, '$1<span class="py-comment">$2</span>');
    block.innerHTML = highlighted;
  });
