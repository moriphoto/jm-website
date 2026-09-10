(function () {
  function setSrc(el, url) {
    if (!el || !url) return;
    el.src = url;
  }
  function apply(a) {
    if (!a) return;
    var video = document.querySelector("#splash video");
    if (video) {
      if (a.splash_poster) video.setAttribute("poster", a.splash_poster);
      var source = video.querySelector("source");
      if (a.splash_video && source) {
        source.src = a.splash_video;
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
        if (src.indexOf(aboutMap[key]) !== -1 && a[key]) img.src = a[key];
      });
    });
    if (a.collection && window.WORKS) {
      window.WORKS.forEach(function (w) {
        if (w.id === "00") w.src = a.collection.replace(/^\//, "");
      });
    }
  }
  fetch("data/assets.json")
    .then(function (r) { return r.json(); })
    .then(apply)
    .catch(function () {});
})();
