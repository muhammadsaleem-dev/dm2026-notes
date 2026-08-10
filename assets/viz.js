(function () {
  "use strict";

  function reducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  // ---------- K-Means convergence (Module 4) ----------
  function initKMeansViz() {
    var block = document.querySelector('[data-viz="kmeans"]');
    if (!block) return;

    var scale = 16, originX = 30, originY = 180;
    function toX(x) { return originX + x * scale; }
    function toY(y) { return originY - y * scale; }

    var initC = [{ x: 1, y: 1 }, { x: 8, y: 8 }];
    var finalC = [{ x: 1.33, y: 1.67 }, { x: 8.33, y: 8.33 }];
    var assign = [0, 0, 0, 1, 1, 1]; // P1,P2,P3 -> cluster a; P4,P5,P6 -> cluster b

    var pointEls = block.querySelectorAll("[data-point]");
    var centroidEls = block.querySelectorAll("[data-centroid]");
    var statusEl = block.querySelector("[data-viz-status]");
    var playBtn = block.querySelector('[data-viz-action="play"]');
    var resetBtn = block.querySelector('[data-viz-action="reset"]');
    if (!playBtn || !resetBtn || !statusEl) return;

    var timers = [];
    function clearTimers() {
      timers.forEach(function (t) { clearTimeout(t); });
      timers = [];
    }

    function setCentroid(i, pos) {
      centroidEls[i].style.transform = "translate(" + toX(pos.x) + "px, " + toY(pos.y) + "px)";
    }

    function resetState() {
      clearTimers();
      pointEls.forEach(function (el) { el.classList.remove("cluster-a", "cluster-b"); });
      setCentroid(0, initC[0]);
      setCentroid(1, initC[1]);
      statusEl.innerHTML = 'Initial centroids: <strong>C1=(1,1)</strong>, <strong>C2=(8,8)</strong> — the same starting point as the worked example above. Press Play.';
      playBtn.disabled = false;
    }

    function play() {
      playBtn.disabled = true;
      var d1 = reducedMotion() ? 0 : 650;
      var d2 = reducedMotion() ? 0 : 1100;

      statusEl.textContent = "Assign — each point joins its nearest centroid.";
      timers.push(setTimeout(function () {
        pointEls.forEach(function (el, i) {
          el.classList.add(assign[i] === 0 ? "cluster-a" : "cluster-b");
        });
      }, 150));

      timers.push(setTimeout(function () {
        statusEl.textContent = "Recompute — each centroid moves to the mean of its assigned points.";
        setCentroid(0, finalC[0]);
        setCentroid(1, finalC[1]);
      }, d1));

      timers.push(setTimeout(function () {
        statusEl.innerHTML = 'Converged after 1 iteration — nothing gets reassigned. Total WCSS = 8/3 ≈ <strong>2.67</strong>, matching the worked example above.';
        playBtn.disabled = false;
      }, d1 + d2));
    }

    playBtn.addEventListener("click", play);
    resetBtn.addEventListener("click", resetState);
    resetState();
  }

  // ---------- Softmax temperature (Module 6) ----------
  function initSoftmaxViz() {
    var block = document.querySelector('[data-viz="softmax"]');
    if (!block) return;

    var logits = [2.0, 1.0, 0.5, 0.01, 3, 2, 1.5];
    var highlightIndex = 4; // token E, the highest logit

    var slider = block.querySelector("#vizTempSlider");
    var tempValueEl = block.querySelector("[data-viz-temp-value]");
    var statusEl = block.querySelector("[data-viz-status]");
    var bars = block.querySelectorAll("[data-bar]");
    var valueLabels = block.querySelectorAll("[data-bar-value]");
    if (!slider || !statusEl || !bars.length) return;

    var baseline = 120, maxBarHeight = 108, minTop = 10;

    function render(T) {
      var scaled = logits.map(function (z) { return z / T; });
      var exps = scaled.map(Math.exp);
      var sum = exps.reduce(function (a, b) { return a + b; }, 0);
      var probs = exps.map(function (e) { return e / sum; });

      bars.forEach(function (bar, i) {
        var h = Math.max(1, probs[i] * maxBarHeight);
        bar.setAttribute("height", h.toFixed(2));
        bar.setAttribute("y", (baseline - h).toFixed(2));
        bar.classList.toggle("viz-bar-highlight", i === highlightIndex);
      });
      valueLabels.forEach(function (label, i) {
        var h = Math.max(1, probs[i] * maxBarHeight);
        var y = Math.max(minTop, baseline - h - 4);
        label.setAttribute("y", y.toFixed(2));
        label.textContent = (probs[i] * 100).toFixed(1) + "%";
      });

      if (tempValueEl) tempValueEl.textContent = T.toFixed(2);
      var pct = (probs[highlightIndex] * 100).toFixed(1);
      var mood = T < 0.9
        ? "sharpening the distribution toward the front-runner"
        : T > 1.1
        ? "flattening the distribution — every token becomes more competitive"
        : "the raw, untouched distribution";
      statusEl.innerHTML = "At T=" + T.toFixed(2) + ", token <strong>E</strong> holds <strong>" + pct + "%</strong> of the probability mass — " + mood + ".";
    }

    slider.addEventListener("input", function () {
      render(parseFloat(slider.value));
    });

    render(parseFloat(slider.value) || 1);
  }

  document.addEventListener("DOMContentLoaded", function () {
    initKMeansViz();
    initSoftmaxViz();
  });
})();
