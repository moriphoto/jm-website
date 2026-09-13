/* Catalogue preview: working stills, open piece on the right, live copy. */
(function () {
  function boot() {
    if (!window.CMS || !window.h || !window.createClass) {
      setTimeout(boot, 40);
      return;
    }
    var h = window.h;
    var createClass = window.createClass;
    var ROOT = "https://moriphoto.github.io/jm-website/";
    var RAW = "https://raw.githubusercontent.com/moriphoto/jm-website/main/jm-website/";

    function asString(v) {
      if (!v) return "";
      if (typeof v === "string") return v;
      if (typeof v.url === "string") return v.url;
      if (typeof v.path === "string") return v.path;
      if (typeof v.src === "string") return v.src;
      try { return String(v); } catch (e) { return ""; }
    }

    function fileName(src) {
      var u = asString(src).split("?")[0];
      var parts = u.split("/");
      return parts[parts.length - 1] || "";
    }

    function imgUrl(src) {
      var u = asString(src);
      if (!u || u.indexOf("[object") !== -1) return "";
      var i = u.indexOf("images/");
      if (i !== -1) return ROOT + u.slice(i);
      i = u.indexOf("studio/");
      if (i !== -1) return ROOT + "images/" + u.slice(i);
      var f = fileName(u);
      if (f && /\.(jpe?g|png|webp|gif)$/i.test(f)) return ROOT + "images/studio/" + f;
      if (/^https?:/i.test(u)) return u;
      return ROOT + u.replace(/^\//, "");
    }

    function fallback(ev, src) {
      var el = ev.target;
      var n = parseInt(el.getAttribute("data-try") || "0", 10);
      var f = fileName(src);
      var list = [
        imgUrl(src),
        ROOT + "images/studio/" + f,
        ROOT + "images/" + f,
        RAW + "images/studio/" + f,
        RAW + "images/" + f,
        "https://jmceramics.netlify.app/images/studio/" + f,
        "https://jmceramics.netlify.app/images/" + f
      ];
      n += 1;
      while (n < list.length && (!list[n] || list[n] === el.getAttribute("src"))) n += 1;
      if (n < list.length && list[n]) {
        el.setAttribute("data-try", String(n));
        el.src = list[n];
      }
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
          src: p && asString(p.src)
        }, "*");
      } catch (e) {}
    }

    var WorksPreview = createClass({
      getInitialState: function () {
        return { focusId: localStorage.getItem("cmsFocusId") || "" };
      },
      componentDidMount: function () {
        var self = this;
        this._onMsg = function (e) {
          var d = e.data || {};
          if (d.type === "cms-open-piece") {
            try { localStorage.setItem("cmsFocusId", d.id || ""); } catch (err) {}
            self.setState({ focusId: d.id || "" });
          }
        };
        window.addEventListener("message", this._onMsg);
        this._tick = setInterval(function () {
          var now = "";
          try { now = localStorage.getItem("cmsFocusId") || ""; } catch (e) {}
          if (now !== self.state.focusId) self.setState({ focusId: now });
        }, 300);
      },
      componentWillUnmount: function () {
        window.removeEventListener("message", this._onMsg);
        clearInterval(this._tick);
      },
      render: function () {
        var self = this;
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
        var focusId = this.state.focusId;
        var focused = null;
        list.forEach(function (p) {
          if (String(p.id) === String(focusId)) focused = p;
        });
        if (!focused && live[0]) focused = live[0];

        function thumb(p, wide) {
          var src = asString(p.src);
          return h("img", {
            src: imgUrl(src),
            alt: p.title || "",
            onError: function (e) { fallback(e, src); },
            style: {
              width: wide ? "100%" : 200,
              height: wide ? 280 : 112,
              objectFit: "contain",
              background: "#111",
              display: "block"
            }
          });
        }

        function open(p) {
          try { localStorage.setItem("cmsFocusId", p.id || ""); } catch (e) {}
          self.setState({ focusId: p.id || "" });
          tellLeft(p);
        }

        var hero = focused ? h("div", {
          style: { marginBottom: 22, paddingBottom: 18, borderBottom: "1px solid rgba(255,255,255,.12)" }
        },
          thumb(focused, true),
          h("div", { style: { marginTop: 10, fontSize: 13, lineHeight: 1.45 } },
            h("div", { style: { color: "#8a8a8a", fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase" } }, focused.id || ""),
            h("div", { style: { fontWeight: 700, fontSize: 18, marginTop: 4 } }, focused.title || ""),
            h("div", { style: { color: "#c8c8c8", marginTop: 8 } }, focused.note || ""),
            h("div", { style: { color: "#c4a35a", marginTop: 8 } }, focused.price || "")
          )
        ) : null;

        var rows = live.map(function (p, i) {
          var on = focused && String(p.id) === String(focused.id);
          return h("div", {
            key: "l" + i,
            onClick: function () { open(p); },
            style: {
              display: "grid",
              gridTemplateColumns: "200px 1fr",
              gap: 14,
              padding: "10px 8px",
              borderBottom: "1px solid rgba(255,255,255,.08)",
              cursor: "pointer",
              outline: on ? "1px solid #c4a35a" : "none",
              background: on ? "#141414" : "transparent"
            }
          },
            thumb(p, false),
            h("div", { style: { fontSize: 13, lineHeight: 1.45 } },
              h("div", { style: { color: "#8a8a8a", fontSize: 10, letterSpacing: ".14em" } }, p.id || ""),
              h("div", { style: { fontWeight: 600, marginTop: 2 } }, p.title || ""),
              h("div", { style: { color: "#b0b0b0", marginTop: 6 } }, p.note || ""),
              h("div", { style: { color: "#c4a35a", marginTop: 6, fontSize: 12 } }, p.price || "")
            )
          );
        });

        var arch = archived.map(function (p, i) {
          return h("figure", {
            key: "a" + i,
            onClick: function () { open(p); },
            style: { margin: 0, width: 160, cursor: "pointer" }
          },
            thumb(p, false),
            h("figcaption", { style: { fontSize: 11, color: "#b0b0b0", marginTop: 6 } }, (p.id || "") + "  " + (p.title || "")),
            h("button", {
              type: "button",
              onClick: function (e) {
                e.stopPropagation();
                try {
                  window.parent.postMessage({ type: "cms-bring-back", id: p.id, title: p.title }, "*");
                } catch (err) {}
              },
              style: {
                marginTop: 8,
                width: "100%",
                background: "transparent",
                color: "#c4a35a",
                border: "1px solid #c4a35a",
                font: "700 9px/1 Helvetica Neue, Helvetica, Arial, sans-serif",
                letterSpacing: ".14em",
                textTransform: "uppercase",
                padding: "8px 6px",
                cursor: "pointer"
              }
            }, "Bring back")
          );
        });

        return h("div", {
          style: {
            padding: 18,
            background: "#0a0a0a",
            color: "#f3f3f3",
            fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
            minHeight: "100vh"
          }
        },
          h("h1", { style: { fontSize: 12, letterSpacing: ".2em", textTransform: "uppercase", color: "#c4a35a", margin: "0 0 6px" } }, name || "Collection"),
          h("p", { style: { color: "#8a8a8a", fontSize: 11, margin: "0 0 16px" } }, "Open a piece on the left — it shows here. Edit the words; they update live."),
          hero,
          rows,
          archived.length ? h("h2", { style: { fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", color: "#8a4a22", margin: "28px 0 12px", borderTop: "1px solid rgba(255,255,255,.12)", paddingTop: 16 } }, "Archive") : null,
          archived.length ? h("div", { style: { display: "flex", flexWrap: "wrap", gap: 12 } }, arch) : null
        );
      }
    });

    CMS.registerPreviewTemplate("works", WorksPreview);
    CMS.registerPreviewTemplate("catalogue", WorksPreview);
  }
  boot();
})();
