/* Compact catalogue preview: medium thumbs, copy, archive tray. */
(function () {
  if (!window.CMS) return;
  var h = window.h;
  var createClass = window.createClass;
  if (!h || !createClass) return;

  function imgUrl(src, getAsset) {
    if (!src) return "";
    try {
      var a = getAsset ? getAsset(src) : null;
      if (typeof a === "string" && a) return a;
      if (a && typeof a.toString === "function") {
        var s = a.toString();
        if (s && s.indexOf("[object") === -1) return s;
      }
      if (a && a.url) return a.url;
    } catch (e) {}
    var u = String(src).replace(/^\//, "");
    return u.indexOf("http") === 0 ? u : "../" + u;
  }

  function toList(pieces) {
    if (!pieces) return [];
    if (typeof pieces.toJS === "function") return pieces.toJS();
    if (Array.isArray(pieces)) return pieces;
    var out = [];
    if (pieces.forEach) pieces.forEach(function (p) { out.push(typeof p.toJS === "function" ? p.toJS() : p); });
    return out;
  }

  function fileKey(src) {
    return String(src || "").split("/").pop().split("?")[0];
  }

  var WorksPreview = createClass({
    getInitialState: function () {
      return { focus: localStorage.getItem("cmsFocusSrc") || "" };
    },
    componentDidMount: function () {
      var self = this;
      this._onStore = function (e) {
        if (e.key === "cmsFocusSrc") self.setState({ focus: e.newValue || "" });
      };
      window.addEventListener("storage", this._onStore);
      this._tick = setInterval(function () {
        var now = localStorage.getItem("cmsFocusSrc") || "";
        if (now !== self.state.focus) self.setState({ focus: now });
      }, 400);
    },
    componentWillUnmount: function () {
      window.removeEventListener("storage", this._onStore);
      clearInterval(this._tick);
    },
    pick: function (src) {
      try { localStorage.setItem("cmsFocusSrc", src || ""); } catch (e) {}
      this.setState({ focus: src || "" });
    },
    render: function () {
      var entry = this.props.entry;
      var getAsset = this.props.getAsset;
      var data = entry && entry.get ? entry.get("data") : null;
      var name = data ? data.get("collection_name") : "";
      var list = toList(data ? data.get("pieces") : []);
      var focusKey = fileKey(this.state.focus);
      var live = [];
      var archived = [];
      list.forEach(function (p) {
        if (p && p.archived) archived.push(p);
        else live.push(p);
      });
      var focused = null;
      list.forEach(function (p) {
        if (fileKey(p.src) && fileKey(p.src) === focusKey) focused = p;
      });

      var rows = live.map(function (p, i) {
        var on = fileKey(p.src) === focusKey;
        return h("div", {
          className: "row" + (on ? " on" : ""),
          key: "l" + i,
          onClick: this.pick.bind(this, p.src)
        },
          h("img", { src: imgUrl(p.src, getAsset), alt: p.title || "" }),
          h("div", { className: "meta" },
            h("div", { className: "id" }, p.id || ""),
            h("div", { className: "t" }, p.title || ""),
            h("div", { className: "n" }, p.note || ""),
            h("div", { className: "p" }, p.price || "")
          )
        );
      }, this);

      var arch = archived.map(function (p, i) {
        return h("figure", { key: "a" + i },
          h("img", { src: imgUrl(p.src, getAsset), alt: p.title || "", onClick: this.pick.bind(this, p.src) }),
          h("figcaption", {}, (p.id || "") + "  " + (p.title || "")),
          h("button", { type: "button", onClick: this.pick.bind(this, p.src) }, "Bring back — uncheck Archive on the left")
        );
      }, this);

      var pop = focused ? h("div", { className: "pop" },
        h("img", { src: imgUrl(focused.src, getAsset), alt: focused.title || "" }),
        h("div", { className: "meta" },
          h("div", { className: "id" }, focused.id || ""),
          h("div", { className: "t" }, focused.title || ""),
          h("div", { className: "n" }, focused.note || ""),
          h("div", { className: "p" }, focused.price || "")
        )
      ) : null;

      return h("div", { className: "wp" },
        h("h1", {}, name || "Collection"),
        h("p", { className: "hint" }, "Medium thumbs. Click a piece on the left or here."),
        pop,
        rows,
        archived.length ? h("h2", {}, "Archive") : null,
        archived.length ? h("div", { className: "arch" }, arch) : null
      );
    }
  });

  CMS.registerPreviewStyle("preview-works.css");
  CMS.registerPreviewTemplate("works", WorksPreview);
})();
