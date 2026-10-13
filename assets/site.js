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
      
      var hljsTheme = document.getElementById('hljs-theme');
      if (hljsTheme) {
        hljsTheme.href = next === "dark" 
          ? 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/vs2015.min.css' 
          : 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-light.min.css';
      }
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
  window.showToast = showToast;

  // Mode toggle
  var modeBtn = document.getElementById("modeToggle");
  if (modeBtn) {
    // Initialize button icon based on current state
    var currentMode = document.documentElement.getAttribute("data-mode") || "concept";
    modeBtn.textContent = currentMode === "tech" ? "📖" : "🎓";
    
    modeBtn.addEventListener("click", function () {
      var root = document.documentElement;
      var current = root.getAttribute("data-mode") === "tech" ? "tech" : "concept";
      var next = current === "tech" ? "concept" : "tech";
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


  // Highlight.js initialization
  var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  var hljsStyle = document.createElement('link');
  hljsStyle.rel = 'stylesheet';
  hljsStyle.id = 'hljs-theme';
  hljsStyle.href = isDark 
    ? 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/vs2015.min.css' 
    : 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-light.min.css';
  document.head.appendChild(hljsStyle);

  var hljsScript = document.createElement('script');
  hljsScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js';
  hljsScript.onload = function() {
    // Also load python language explicitly if needed, but core includes it.
    hljs.highlightAll();
  };
  document.head.appendChild(hljsScript);

  // Universal Modal Logic
  var openModalBtns = document.querySelectorAll('.open-modal');
  var closeBtns = document.querySelectorAll('.close-modal');

  openModalBtns.forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      var targetId = btn.getAttribute('data-target');
      if (targetId) {
        var modal = document.getElementById(targetId);
        if (modal) modal.style.display = 'block';
      }
    });
  });

  closeBtns.forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      var modal = e.target.closest('.modal');
      if (modal) modal.style.display = 'none';
    });
  });

  window.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
      e.target.style.display = 'none';
    }
  });

  // Universal Expand/Collapse All Toolbar for .quiz-list and .drill-list
  document.querySelectorAll('.quiz-list, .drill-list').forEach(function(container) {
    var items = container.querySelectorAll('details');
    if (items.length < 2) return;
    
    var toolbar = document.createElement('div');
    toolbar.className = 'list-toggle-toolbar';
    toolbar.innerHTML = 
      '<button type="button" class="list-toggle-btn expand-btn" title="Expand all questions in this section">' +
        '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="7 13 12 18 17 13"></polyline><polyline points="7 6 12 11 17 6"></polyline></svg>' +
        '<span>Expand All</span>' +
      '</button>' +
      '<button type="button" class="list-toggle-btn collapse-btn" title="Collapse all questions in this section">' +
        '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 11 12 6 7 11"></polyline><polyline points="17 18 12 13 7 18"></polyline></svg>' +
        '<span>Collapse All</span>' +
      '</button>';
      
    container.parentNode.insertBefore(toolbar, container);
    
    toolbar.querySelector('.expand-btn').addEventListener('click', function() {
      container.querySelectorAll('details').forEach(function(d) {
        d.open = true;
        d.setAttribute('open', '');
      });
      showToast('All items expanded');
    });
    
    toolbar.querySelector('.collapse-btn').addEventListener('click', function() {
      container.querySelectorAll('details').forEach(function(d) {
        d.open = false;
        d.removeAttribute('open');
      });
      showToast('All items collapsed');
    });
  });
})();
