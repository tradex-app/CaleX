function m(n, t) {
  return !l(n) || !l(t) ? t : (Object.keys(t).forEach((e) => {
    const s = n[e], i = t[e];
    h(s) && h(i) ? n[e] = m(s.concat([]), i) : l(s) && l(i) ? n[e] = m(Object.assign({}, s), i) : n[e] = i;
  }), n);
}
function b(n) {
  if (n === null || typeof n != "object")
    return n;
  let t;
  n instanceof Date ? t = new n.constructor() : t = h(n) ? [] : {};
  for (let e in n)
    Object.prototype.hasOwnProperty.call(n, e) && (typeof n[e] != "object" || n[e] === n ? t[e] = n[e] : t[e] = b(n[e]));
  return t;
}
function w(n) {
  try {
    return structuredClone(n);
  } catch {
    return b(n);
  }
}
function x(n, t, e) {
  [n[t], n[e]] = [n[e], n[t]];
}
const I = (n) => n.entries().next().value, M = (n) => n.entries().next().value[0], E = (n) => n.entries().next().value[1], C = (n) => [...n].pop(), v = (n) => [...n.keys()].pop(), L = (n) => [...n.values()].pop();
class g extends Map {
  constructor(t) {
    super(t);
  }
  indexOfKey(t) {
    return [...this.keys()].indexOf(t);
  }
  indexOfValue(t) {
    return [...this.values()].indexOf(t);
  }
  entryAtIndex(t) {
    return [...this.entries()][t];
  }
  keyAtIndex(t) {
    return [...this.keys()][t];
  }
  valueAtIndex(t) {
    return [...this.values()][t];
  }
  insert(t, e, s) {
    return this.insertIndex(s, t, e);
  }
  remove(t) {
    return this.removeIndex(t);
  }
  firstEntry() {
    return I(this);
  }
  firstKey() {
    return M(this);
  }
  firstValue() {
    return E(this);
  }
  lastEntry() {
    return C(this);
  }
  lastKey() {
    return v(this);
  }
  lastValue() {
    return L(this);
  }
  prevCurrNext(t) {
    let e = curr = next = null;
    for (let s of this)
      if (e = curr, curr = s, s.key == t) break;
    return { prev: e, curr, next };
  }
  union(...t) {
    if (typeof super.prototype.union == "function")
      super.union(...t);
    else
      for (const e of t)
        for (const s of e)
          this.set(...s);
  }
  setMultiple(t) {
    return h(t) ? (t.forEach(([e, s]) => this.set(e, s)), !0) : !1;
  }
  populate(t) {
    return h(t) ? (this.clear(), t.forEach(([e, s]) => this.set(e, s)), !0) : !1;
  }
  insertIndex(t, e, s) {
    if (!p(t)) return !1;
    const i = [...this];
    return i.splice(t, 0, [e, s]), this.populate(i), !0;
  }
  removeIndex(t) {
    if (!p(t)) return !1;
    const e = [...this];
    return e.splice(t, 1), this.populate(e), !0;
  }
  swapIndices(t, e) {
    if (!p(t) || !p(e)) return !1;
    const s = [...this];
    return x(s, t, e), this.populate(s), !0;
  }
  swapKeys(t, e) {
    const s = [...this], i = s.findIndex(([o]) => o === t), u = s.findIndex(([o]) => o === e);
    return [s[i], s[u]] = [s[u], s[i]], this.clear(), s.forEach(([o, c]) => this.set(o, c)), !0;
  }
}
class a {
  static #s = new g();
  static get entries() {
    return a.#s;
  }
  static isValid(t, e, s, i) {
    return !l(t) || !d(e) || !y(s) || !V(i);
  }
  static add(t, e, s, i) {
    if (!this.isValid(t, e, s, i)) return !1;
    e.addEventListener(s, i), a.#s.has(t) || a.#s.set(t, new g());
    const u = a.#s.get(t);
    u.has(e) || u.set(e, {});
    const o = u.get(e);
    return h(o[s]) || (o[s] = []), o[s].push(i), !0;
  }
  static remove(t, e, s, i) {
    if (!a.isValid(t, e, s, i) || !a.#s.has(t)) return !1;
    const u = a.#s.get(t);
    if (!u.has(e)) return !1;
    const o = u.get(e);
    if (!(s in o)) return !1;
    const c = o[s].indexOf(i);
    return c < 0 ? !1 : (o[s].splice(c, 1), o[s].length == 0 && delete o[s], Object.keys(o).length == 0 && u.delete(e), u.size == 0 && a.#s.delete(t), !0);
  }
  static expungeEvent(t, e, s) {
    if (!l(t) || !d(e) || !y(s))
      return !1;
    const i = a.#s.get(t);
    if (!i.has(e)) return !1;
    const u = i.get(e);
    if (s in u) {
      for (let o of u[s])
        e.removeEventListener(s, o);
      delete u[s];
    }
    return !0;
  }
  static expungeElement(t, e) {
    if (!l(t) || !d(e))
      return !1;
    const s = a.#s.get(t);
    if (s.has(e)) {
      let i = s.get(e);
      for (let u in i)
        a.expungeEvent(t, e, u);
      s.delete(e);
    }
    return !0;
  }
  static expungeContext(t) {
    if (!l(t))
      return !1;
    if (a.#s.has(t)) {
      const e = a.#s.get(t);
      for (let s of e)
        a.expungeElement(t, s);
      a.#s.delete(t);
    }
    return !0;
  }
  static expungeAll() {
  }
  static destroy() {
    for (let t of a.#s)
      a.expungeContext(t);
    return a.#s = void 0, !0;
  }
}
function h(n) {
  return Array.isArray(n);
}
function V(n) {
  return n && typeof n == "function";
}
function l(n) {
  return typeof n == "object" && !Array.isArray(n) && n !== null;
}
function p(n) {
  return typeof n == "number" && !isNaN(n);
}
function y(n) {
  return typeof n == "string";
}
function d(n) {
  return typeof HTMLElement == "object" ? n instanceof HTMLElement : n && typeof n == "object" && n !== null && n.nodeType === 1 && typeof n.nodeName == "string";
}
const N = `
.custom-time-input-container {
  display: inline-block;
  position: relative;
}

.time-inputs-wrapper {
  display: flex;
  align-items: center;
  gap: 4px;
  border: 1px solid #ccc;
  padding: 0;
  background: white;
  font-family: inherit;
}

.time-inputs-wrapper:focus-within {
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.hour-input,
.minute-input {
  color: #000;
  border: none;
  outline: none;
  width: 1.5em;
  text-align: center;
  font-size: inherit;
  font-family: inherit;
  background: transparent;
}

.hour-input::-webkit-outer-spin-button,
.hour-input::-webkit-inner-spin-button,
.minute-input::-webkit-outer-spin-button,
.minute-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.hour-input[type=number],
.minute-input[type=number] {
  -moz-appearance: textfield;
}

.time-separator {
  font-weight: bold;
  color: #666;
  user-select: none;
}

.custom-time-input-container input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
`, f = {
  cssClasses: {
    container: "custom-time-input-container",
    wrapper: "time-inputs-wrapper",
    hourInput: "hour-input",
    minuteInput: "minute-input",
    separator: "time-separator"
  }
};
class r {
  static #s = !1;
  static #o = /* @__PURE__ */ new Map();
  static get elements() {
    return r.#o;
  }
  static build(t, e = f) {
    if (e = l(e) ? r.#b(e) : f, y(t)) {
      const s = document.querySelectorAll(t);
      return s.length || r.#l(`No elements found for selector: ${t}`), [...s].map((u) => r.#m(u, e));
    } else
      return r.#m(t, e);
  }
  static #g(t, e) {
    if (r.#o.has(t))
      return console.warn("TimeInput already exists for this element"), r.#o.get(t);
    const s = new r(t, e);
    return r.#o.set(t, s), s;
  }
  static #l(t = 'a valid HTMLElement input type="time" is expected') {
    throw new Error(`TimeInput Error: ${t}`);
  }
  static isTimeInput(t) {
    return t instanceof HTMLInputElement && t.type === "time";
  }
  static #m(t, e) {
    return d(t) ? r.isTimeInput(t) ? r.#g(t, e) : (r.#l(), null) : (r.#l(), null);
  }
  static injectStyles() {
    if (!r.#s) {
      const t = document.createElement("style");
      t.type = "text/css", t.id = "custom-time-input-styles", t.appendChild(document.createTextNode(N)), document.head.appendChild(t), r.#s = !0;
    }
  }
  static #b(t) {
    return w(f), m(f, t);
  }
  #n;
  #r;
  #u;
  #t;
  #e;
  #h;
  #a;
  #c = !1;
  constructor(t, e = {}) {
    r.isTimeInput(t) || r.#l(), this.#n = t, this.#r = e, this.#w(), this.#x(), this.#I();
  }
  destroy() {
    r.#o.delete(this.#n), this.#n.style.display = "", this.#u.remove();
  }
  get input() {
    return this.#n;
  }
  get container() {
    return this.#u;
  }
  get hourInput() {
    return this.#t;
  }
  get minuteInput() {
    return this.#e;
  }
  get config() {
    return { ...this.#r };
  }
  #w() {
    this.#n.style.display = "none", this.#u = document.createElement("div"), this.#u.classList.add(this.#r.cssClasses.container), this.#n.parentNode?.insertBefore(this.#u, this.#n.nextSibling);
  }
  #x() {
    this.#a = document.createElement("div"), this.#a.classList.add(this.#r.cssClasses.wrapper), this.#t = document.createElement("input"), this.#t.type = "number", this.#t.min = "0", this.#t.max = "23", this.#t.step = "1", this.#t.classList.add(this.#r.cssClasses.hourInput), this.#t.setAttribute("aria-label", "Hours"), this.#t.placeholder = "00", this.#h = document.createElement("span"), this.#h.classList.add(this.#r.cssClasses.separator), this.#h.textContent = ":", this.#e = document.createElement("input"), this.#e.type = "number", this.#e.min = "0", this.#e.max = "59", this.#e.step = "1", this.#e.classList.add(this.#r.cssClasses.minuteInput), this.#e.setAttribute("aria-label", "Minutes"), this.#e.placeholder = "00", this.#a.appendChild(this.#t), this.#a.appendChild(this.#h), this.#a.appendChild(this.#e), this.#u.appendChild(this.#a);
  }
  #I() {
    r.injectStyles(), this.#p(), this.#t.addEventListener("input", () => this.#i()), this.#t.addEventListener("change", () => this.#i()), this.#e.addEventListener("input", () => this.#i()), this.#e.addEventListener("change", () => this.#i()), this.#n.addEventListener("input", () => this.#y()), this.#n.addEventListener("change", () => this.#y()), this.#t.addEventListener("blur", () => this.#M()), this.#e.addEventListener("blur", () => this.#E());
  }
  #y() {
    this.#c || this.#p();
  }
  #p() {
    const t = this.#n.value;
    if (t) {
      const [e, s] = t.split(":");
      this.#t.value = parseInt(e, 10) || 0, this.#e.value = parseInt(s, 10) || 0;
    } else
      this.#t.value = "", this.#e.value = "";
  }
  #i() {
    this.#c = !0;
    const t = this.#f(), e = this.#d(), s = `${t.toString().padStart(2, "0")}:${e.toString().padStart(2, "0")}`;
    this.#n.value = s, this.#n.dispatchEvent(new Event("input", { bubbles: !0 })), this.#n.dispatchEvent(new Event("change", { bubbles: !0 })), this.#c = !1;
  }
  #f() {
    const t = parseInt(this.#t.value, 10);
    return isNaN(t) ? 0 : Math.max(0, Math.min(23, t));
  }
  #d() {
    const t = parseInt(this.#e.value, 10);
    return isNaN(t) ? 0 : Math.max(0, Math.min(59, t));
  }
  #M() {
    const t = this.#f();
    this.#t.value = t, this.#i();
  }
  #E() {
    const t = this.#d();
    this.#e.value = t, this.#i();
  }
  getValue() {
    return this.#n.value;
  }
  setValue(t) {
    if (typeof t != "string") {
      console.warn("setValue expects a valid time string (HH:MM)");
      return;
    }
    this.#n.value = t, this.#p();
  }
  getHours() {
    return this.#f();
  }
  getMinutes() {
    return this.#d();
  }
  setHours(t) {
    if (typeof t != "number" || t < 0 || t > 23) {
      console.warn("setHours expects a number between 0 and 23");
      return;
    }
    this.#t.value = t, this.#i();
  }
  setMinutes(t) {
    if (typeof t != "number" || t < 0 || t > 59) {
      console.warn("setMinutes expects a number between 0 and 59");
      return;
    }
    this.#e.value = t, this.#i();
  }
}
export {
  r as default
};
