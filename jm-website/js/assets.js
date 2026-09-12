(function () {
  function rel(u) {
    return String(u || "").replace(/^\//, "");
  }
  function apply(a) {
    if (!a) return;
    var video = document.querySelector("#splash video");
    if (video) {
      if (a.splash_poster) video.setAttribute("poster", rel(a.splash_poster));
      var source = video.querySelector("source");
      if (a.splash_video && source) {
        source.src = rel(a.splash_video);
        video.load();
      }
    }
    var aboutMap = {
      about_john: "john-stoking",
      about_ports: "anagama-ports",
      about_firebox: "firebox.jpg",
      about_shed: "shed-firing"
    };
    document.querySelectorAll("#about img").forEach(function (img) {
      var src = img.getAttribute("src") || "";
      Object.keys(aboutMap).forEach(function (key) {
        if (src.indexOf(aboutMap[key]) !== -1 && a[key]) img.src = rel(a[key]);
      });
    });
    if (a.collection && window.WORKS) {
      window.WORKS.forEach(function (w) {
        if (w.id === "00") w.src = rel(a.collection);
      });
    }
    var grid = document.getElementById("courses-grid");
    if (grid) {
      [1, 2, 3, 4].forEach(function (n) {
        var fig = document.getElementById("course-fig-" + n);
        var img = fig && fig.querySelector("img");
        var cap = fig && fig.querySelector("figcaption");
        var url = a["course_" + n];
        if (!fig || !img) return;
        if (url) {
          img.src = rel(url);
          if (cap) cap.textContent = a["course_" + n + "_caption"] || "";
          fig.hidden = false;
        } else {
          fig.hidden = true;
        }
      });
    }
  }
  fetch("data/assets.json")
    .then(function (r) { return r.json(); })
    .then(apply)
    .catch(function () {});
})();
