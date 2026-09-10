(function () {
  let allPieces = window.WORKS || [];
  let works = allPieces.filter(function (w) { return !w.archived; });
  let archiveMode = false;
  let index = 0;
  const basket = {};
  const hero = document.getElementById("hero");
  const title = document.getElementById("title");
  const note = document.getElementById("note");
  const priceEl = document.getElementById("price");
  const counter = document.getElementById("counter");
  const addBtn = document.getElementById("add-current");
  const tiles = document.getElementById("tiles");
  const viewer = document.getElementById("viewer");
  const grid = document.getElementById("grid");
  const about = document.getElementById("about");
  const enquire = document.getElementById("enquire");
  const courses = document.getElementById("courses");
  const pages = { viewer, grid, about, courses, enquire };

  function hideAll() {
    Object.values(pages).forEach(function (el) {
      if (!el) return;
      el.classList.remove("open");
      el.style.display = "none";
    });
    viewer.style.display = "none";
  }
  function showViewer() {
    hideAll();
    viewer.style.display = "block";
    setActive(archiveMode ? "archive" : "work");
  }
  function showGrid() {
    hideAll();
    grid.style.display = "block";
    grid.classList.add("open");
    setActive(archiveMode ? "archive" : "grid");
  }
  function showAbout() {
    hideAll();
    about.style.display = "block";
    about.classList.add("open");
    setActive("about");
  }
  function showCourses() {
    hideAll();
    if (courses) {
      courses.style.display = "block";
      courses.classList.add("open");
    }
    setActive("courses");
  }
  function setIndexOpen(open) {
    var wrap = document.getElementById("index");
    var btn = document.getElementById("index-toggle");
    if (!wrap || !btn) return;
    wrap.hidden = !open;
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    btn.classList.toggle("open", !!open);
  }
  function showEnquire() {
    hideAll();
    enquire.style.display = "block";
    enquire.classList.add("open");
    setActive("enquire");
    drawTable();
    var hasPicks = Object.keys(basket).some(function (id) { return (basket[id] || 0) > 0; });
    setIndexOpen(hasPicks);
  }
  function setActive(name) {
    document.querySelectorAll("[data-nav]").forEach(function (el) {
      el.classList.toggle("on", el.getAttribute("data-nav") === name);
    });
    setIntro();
  }
  function setIntro() {
    var onHome = viewer.style.display === "block" && works[index] && works[index].id === "00";
    document.body.classList.toggle("intro", !!onHome);
  }
  function current() { return works[index]; }
  function render(i) {
    if (!works.length) return;
    index = (i + works.length) % works.length;
    const w = works[index];
    hero.src = w.src;
    hero.alt = w.title;
    title.textContent = w.title;
    note.textContent = w.note;
    var home = w.id === "00";
    if (priceEl) priceEl.textContent = home ? "" : (w.price || "On request");
    if (priceEl) priceEl.style.display = home ? "none" : "";
    if (addBtn) addBtn.style.display = home ? "none" : "";
    counter.textContent = home ? "" : (String(index + 1).padStart(2, "0") + " / " + String(works.length).padStart(2, "0"));
    if (addBtn) addBtn.classList.toggle("on", (basket[w.id] || 0) > 0);
    setIntro();
  }
  function addCurrent() {
    const w = current();
    if (!w) return;
    basket[w.id] = (basket[w.id] || 0) + 1;
    if (addBtn) addBtn.classList.add("on");
    addBtn.textContent = "Added — view enquiry";
    setTimeout(function () { addBtn.textContent = "Enquire about this piece"; }, 1400);
  }
  function drawTable() {
    const tb = document.querySelector("#enquire-table tbody");
    if (!tb) return;
    tb.innerHTML = "";
    works.forEach(function (w) {
      if (w.id === "00") return;
      const qty = basket[w.id] || 0;
      const tr = document.createElement("tr");
      if (qty) tr.className = "picked";
      tr.innerHTML =
        "<td><img class=\"thumb\" src=\"" + w.src + "\" alt=\"\"></td>" +
        "<td>" + w.title + "</td>" +
        "<td class=\"tag\">" + (w.price || "On request") + "</td>" +
        "<td><input type=\"number\" min=\"0\" step=\"1\" value=\"" + qty + "\" data-id=\"" + w.id + "\"></td>";
      tb.appendChild(tr);
    });
    tb.querySelectorAll("input[data-id]").forEach(function (inp) {
      inp.addEventListener("change", function () {
        const n = parseInt(inp.value, 10) || 0;
        if (n > 0) basket[inp.getAttribute("data-id")] = n;
        else delete basket[inp.getAttribute("data-id")];
        inp.closest("tr").classList.toggle("picked", n > 0);
      });
    });
  }
  function selectedLines() {
    return works.filter(function (w) { return w.id !== "00" && (basket[w.id] || 0) > 0; })
      .map(function (w) { return (basket[w.id] || 0) + " × " + w.title + " (" + w.price + ")"; });
  }
  function buildGrid() {
    tiles.innerHTML = "";
    works.forEach(function (w, i) {
      const b = document.createElement("button");
      b.className = "tile";
      b.type = "button";
      b.innerHTML = "<img src=\"" + w.src + "\" alt=\"" + w.title + "\"><span>" + w.title + "</span>";
      b.addEventListener("click", function () { render(i); showViewer(); });
      tiles.appendChild(b);
    });
  }
  document.getElementById("prev").addEventListener("click", function () { render(index - 1); });
  document.getElementById("next").addEventListener("click", function () { render(index + 1); });
  if (addBtn) {
    addBtn.addEventListener("click", function () { addCurrent(); showEnquire(); });
  }
  document.querySelectorAll("[data-nav='grid']").forEach(function (el) {
    el.addEventListener("click", function (e) {
      e.preventDefault();
      if (archiveMode) setMode(false);
      showGrid();
    });
  });
  document.querySelectorAll("[data-nav='about']").forEach(function (el) {
    el.addEventListener("click", function (e) { e.preventDefault(); showAbout(); });
  });
  document.querySelectorAll("[data-nav='courses']").forEach(function (el) {
    el.addEventListener("click", function (e) { e.preventDefault(); showCourses(); });
  });
  document.querySelectorAll("[data-nav='enquire']").forEach(function (el) {
    el.addEventListener("click", function (e) { e.preventDefault(); showEnquire(); });
  });
  document.querySelectorAll("[data-nav='work']").forEach(function (el) {
    el.addEventListener("click", function (e) { e.preventDefault(); setMode(false); showViewer(); });
  });
  document.querySelectorAll("[data-nav='archive']").forEach(function (el) {
    el.addEventListener("click", function (e) { e.preventDefault(); setMode(true); showGrid(); });
  });
  var indexToggle = document.getElementById("index-toggle");
  if (indexToggle) {
    indexToggle.addEventListener("click", function () {
      var wrap = document.getElementById("index");
      setIndexOpen(wrap && wrap.hidden);
    });
  }
  document.addEventListener("keydown", function (e) {
    const tag = (e.target && e.target.tagName) || "";
    if (tag === "INPUT" || tag === "TEXTAREA") return;
    if (e.key === "ArrowRight") { render(index + 1); showViewer(); }
    if (e.key === "ArrowLeft") { render(index - 1); showViewer(); }
    if (e.key === "g" || e.key === "G") showGrid();
    if (e.key === "Escape") showGrid();
  });
  const form = document.getElementById("enquire-form");
  const status = document.getElementById("form-status");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const lines = selectedLines();
      const payload = {
        name: form.name.value,
        email: form.email.value,
        message: form.message.value || "",
        pieces: lines.length ? lines.join("; ") : "No pieces selected — general enquiry",
        _subject: "John Mackenzie Ceramics — enquiry"
      };
      status.textContent = "Sending…";
      status.classList.add("show");
      fetch("https://formsubmit.co/ajax/moriphoto@gmail.com", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload)
      }).then(function (r) { return r.json(); })
        .then(function () { status.innerHTML = "Sent to moriphoto@gmail.com."; form.reset(); })
        .catch(function () { status.innerHTML = "Could not send from this page. Write to moriphoto@gmail.com."; });
    });
  }
  var enter = document.getElementById("enter");
  if (enter) {
    enter.addEventListener("click", function () {
      document.body.classList.add("entered");
      showViewer();
    });
  }
  function setMode(archive) {
    archiveMode = !!archive;
    document.body.classList.toggle("archive-mode", archiveMode);
    works = allPieces.filter(function (w) {
      if (w.id === "00") return !archiveMode;
      return archiveMode ? !!w.archived : !w.archived;
    });
    index = 0;
    buildGrid();
    drawTable();
    if (works.length) render(0);
  }
  function applyPages(p) {
    if (!p) return;
    document.querySelectorAll("[data-copy]").forEach(function (el) {
      var key = el.getAttribute("data-copy");
      if (p[key]) el.textContent = p[key];
    });
    var dates = document.getElementById("courses-dates");
    if (dates && p.courses_dates) {
      dates.innerHTML = p.courses_dates.split("\n").filter(Boolean).map(function (line) {
        return "<li>" + line.replace(/</g, "") + "</li>";
      }).join("");
    }
  }
  function start() {
    fetch("data/pages.json").then(function (r) { return r.json(); }).then(applyPages).catch(function () {});
    buildGrid();
    drawTable();
    render(0);
    showViewer();
  }
  fetch("data/works.json")
    .then(function (r) { return r.json(); })
    .then(function (data) {
      allPieces = (data && data.pieces) ? data.pieces : allPieces;
      window.WORKS = allPieces;
      works = allPieces.filter(function (w) { return !w.archived; });
      start();
    })
    .catch(function () {
      allPieces = window.WORKS || [];
      works = allPieces.filter(function (w) { return !w.archived; });
      start();
    });
})();
