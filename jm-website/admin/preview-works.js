/* Catalogue preview: small thumbs, click opens the piece on the left. */
(function () {
  function boot() {
    if (!window.CMS || !window.h || !window.createClass) {
      setTimeout(boot, 40);
      return;
    }
    var h = window.h;
    var createClass = window.createClass;
    var ROOT = "https://moriphoto.github.io/jm-website/";

    function imgUrl(src) {
      if (!src) return "";
      var u = String(src);
      if (/^https?:\/\//i.test(u)) {
        var cut = u.indexOf("/images/");
        if (cut !== -1) return ROOT + u.slice(cut + 1);
        return u;
      }
      return ROOT + u.replace(/^\//, "");
    }

    function toList(pieces) {
      if (!pieces) return [];
      if (typeof pieces.toJS === "function") return pieces.toJS();
      if (Array.isArray(pieces)) return pieces;
      var out = [];
      if (pieces.forEach) {
        pieces.forEach(function (p) {
          out.push(typeof p.toJS === "function" ? p.toJS() : p);
        });
      }
      return out;
    }

    function tellLeft(p) {
      try {
        window.parent.postMessage({
          type: "cms-open-piece",
          id: p && p.id,
          title: p && p.title,
          src: p && p.src
        }, "*");
      } catch (e) {}
    }

    var thumb = { width: 120, height: 68, objectFit: "contain", background: "#000", display: "block" };
    var big = { width: "100%", maxWidth: 360, height: 200, objectFit: "contain", background: "#000", display: "block" };

    var WorksPreview = createClass({
      render: function () {
        var entry = this.props.entry;
        var data = entry && entry.get ? entry.get("data") : null;
        var name = data ? data.get("collection_name") : "";
        var list = toList(data ? data.get("pieces") : []);
        var live = [];
        var archived = [];
        list.forEach(function (p) {
          if (p && p.archived) archived.push(p);
          else live.push(p);
        });

        var rows = live.map(function (p, i) {
          return h("div", {
            key: "l" + i,
            onClick: function () { tellLeft(p); },
            style: {
              display: "grid",
              gridTemplateColumns: "120px 1fr",
              gap: 12,
              padding: "8px 0",
              borderBottom: "1px solid rgba(255,255,255,.08)",
              cursor: "pointer"
            }
          },
            h("img", { src: imgUrl(p.src), alt: p.title || "", style: thumb }),
            h("div", { style: { fontSize: 12, lineHeight: 1.4 } },
              h("div", { style: { color: "#8a8a8a", fontSize: 10, letterSpacing: ".14em" } }, p.id || ""),
              h("div", { style: { fontWeight: 600, marginTop: 2 } }, p.title || ""),
              h("div", { style: { color: "#b0b0b0", marginTop: 4 } }, p.note || ""),
              h("div", { style: { color: "#c4a35a", marginTop: 4, fontSize: 11 } }, p.price || "")
            )
          );
        });

        var arch = archived.map(function (p, i) {
          return h("figure", {
            key: "a" + i,
            onClick: function () { tellLeft(p); },
            style: { margin: 0, width: 120, cursor: "pointer" }
          },
            h("img", { src: imgUrl(p.src), alt: p.title || "", style: thumb }),
            h("figcaption", { style: { fontSize: 10, color: "#b0b0b0", marginTop: 4 } }, (p.id || "") + "  " + (p.title || "")),
            h("div", { style: { color: "#c4a35a", fontSize: 9, letterSpacing: ".12em", textTransform: "uppercase", marginTop: 4 } }, "Bring back — uncheck Archive")
          );
        });

        return h("div", { style: { padding: 16, background: "#0a0a0a", color: "#f3f3f3", fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif", minHeight: "100vh" } },
          h("h1", { style: { fontSize: 13, letterSpacing: ".18em", textTransform: "uppercase", color: "#c4a35a", margin: "0 0 8px" } }, name || "Collection"),
          h("p", { style: { color: "#8a8a8a", fontSize: 11, margin: "0 0 14px" } }, "Click a picture to open that piece on the left."),
          rows,
          archived.length ? h("h2", { style: { fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", color: "#8a4a22", margin: "24px 0 10px", borderTop: "1px solid rgba(255,255,255,.12)", paddingTop: 16 } }, "Archive") : null,
          archived.length ? h("div", { style: { display: "flex", flexWrap: "wrap", gap: 10 } }, arch) : null
        );
      }
    });

    CMS.registerPreviewTemplate("works", WorksPreview);
    CMS.registerPreviewTemplate("catalogue", WorksPreview);
  }
  boot();
})();
