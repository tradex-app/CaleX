(function(p,d){typeof exports=="object"&&typeof module<"u"?module.exports=d():typeof define=="function"&&define.amd?define(d):(p=typeof globalThis<"u"?globalThis:p||self,p["Custom Number Input"]=d())})(this,function(){"use strict";function p(i,t){return!l(i)||!l(t)?t:(Object.keys(t).forEach(e=>{const n=i[e],s=t[e];f(n)&&f(s)?i[e]=p(n.concat([]),s):l(n)&&l(s)?i[e]=p(Object.assign({},n),s):i[e]=s}),i)}function d(i){if(i===null||typeof i!="object")return i;let t;i instanceof Date?t=new i.constructor:t=f(i)?[]:{};for(let e in i)Object.prototype.hasOwnProperty.call(i,e)&&(typeof i[e]!="object"||i[e]===i?t[e]=i[e]:t[e]=d(i[e]));return t}function y(i){try{return structuredClone(i)}catch{return d(i)}}function w(i,t,e){[i[t],i[e]]=[i[e],i[t]]}const L=i=>i.entries().next().value,v=i=>i.entries().next().value[0],E=i=>i.entries().next().value[1],k=i=>[...i].pop(),I=i=>[...i.keys()].pop(),M=i=>[...i.values()].pop();class x extends Map{constructor(t){super(t)}indexOfKey(t){return[...this.keys()].indexOf(t)}indexOfValue(t){return[...this.values()].indexOf(t)}entryAtIndex(t){return[...this.entries()][t]}keyAtIndex(t){return[...this.keys()][t]}valueAtIndex(t){return[...this.values()][t]}insert(t,e,n){return this.insertIndex(n,t,e)}remove(t){return this.removeIndex(t)}firstEntry(){return L(this)}firstKey(){return v(this)}firstValue(){return E(this)}lastEntry(){return k(this)}lastKey(){return I(this)}lastValue(){return M(this)}prevCurrNext(t){let e=curr=next=null;for(let n of this)if(e=curr,curr=n,n.key==t)break;return{prev:e,curr,next}}union(...t){if(typeof super.prototype.union=="function")super.union(...t);else for(const e of t)for(const n of e)this.set(...n)}setMultiple(t){return f(t)?(t.forEach(([e,n])=>this.set(e,n)),!0):!1}populate(t){return f(t)?(this.clear(),t.forEach(([e,n])=>this.set(e,n)),!0):!1}insertIndex(t,e,n){if(!h(t))return!1;const s=[...this];return s.splice(t,0,[e,n]),this.populate(s),!0}removeIndex(t){if(!h(t))return!1;const e=[...this];return e.splice(t,1),this.populate(e),!0}swapIndices(t,e){if(!h(t)||!h(e))return!1;const n=[...this];return w(n,t,e),this.populate(n),!0}swapKeys(t,e){const n=[...this],s=n.findIndex(([r])=>r===t),o=n.findIndex(([r])=>r===e);return[n[s],n[o]]=[n[o],n[s]],this.clear(),n.forEach(([r,c])=>this.set(r,c)),!0}}class a{static#e=new x;static get entries(){return a.#e}static isValid(t,e,n,s){return!l(t)||!m(e)||!b(n)||!A(s)}static add(t,e,n,s){if(!this.isValid(t,e,n,s))return!1;e.addEventListener(n,s),a.#e.has(t)||a.#e.set(t,new x);const o=a.#e.get(t);o.has(e)||o.set(e,{});const r=o.get(e);return f(r[n])||(r[n]=[]),r[n].push(s),!0}static remove(t,e,n,s){if(!a.isValid(t,e,n,s)||!a.#e.has(t))return!1;const o=a.#e.get(t);if(!o.has(e))return!1;const r=o.get(e);if(!(n in r))return!1;const c=r[n].indexOf(s);return c<0?!1:(r[n].splice(c,1),r[n].length==0&&delete r[n],Object.keys(r).length==0&&o.delete(e),o.size==0&&a.#e.delete(t),!0)}static expungeEvent(t,e,n){if(!l(t)||!m(e)||!b(n))return!1;const s=a.#e.get(t);if(!s.has(e))return!1;const o=s.get(e);if(n in o){for(let r of o[n])e.removeEventListener(n,r);delete o[n]}return!0}static expungeElement(t,e){if(!l(t)||!m(e))return!1;const n=a.#e.get(t);if(n.has(e)){let s=n.get(e);for(let o in s)a.expungeEvent(t,e,o);n.delete(e)}return!0}static expungeContext(t){if(!l(t))return!1;if(a.#e.has(t)){const e=a.#e.get(t);for(let n of e)a.expungeElement(t,n);a.#e.delete(t)}return!0}static expungeAll(){}static destroy(){for(let t of a.#e)a.expungeContext(t);return a.#e=void 0,!0}}function f(i){return Array.isArray(i)}function A(i){return i&&typeof i=="function"}function l(i){return typeof i=="object"&&!Array.isArray(i)&&i!==null}function h(i){return typeof i=="number"&&!isNaN(i)}function b(i){return typeof i=="string"}function m(i){return typeof HTMLElement=="object"?i instanceof HTMLElement:i&&typeof i=="object"&&i!==null&&i.nodeType===1&&typeof i.nodeName=="string"}const V=`
input[type="number"].custom-number-input {
  -webkit-appearance: textfield;
     -moz-appearance: textfield;
          appearance: textfield;
}

input[type=number].custom-number-input::-webkit-inner-spin-button, 
input[type=number].custom-number-input::-webkit-outer-spin-button { 
  -webkit-appearance: none;
}

/* Input focus state */
input[type="number"].custom-number-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.custom-number-input-container,
.number-input-layout-default {
  box-sizing: border-box;
  transition: all 0.2s ease;
  display: grid;
  grid-template-columns: 1fr 1em;
  grid-template-rows: 1fr;
  grid-column-gap: 0px;
  grid-row-gap: 0px;
}

.custom-number-input-container input,
.number-input-layout-default input {
  grid-area: 1 / 1 / 2 / 2;
}

.custom-number-input-container .spinner-controls,
.number-input-layout-default .spinner-controls {
  grid-area: 1 / 2 / 2 / 3;
}

.number-input-layout-left-right {
  grid-template-columns: 1em 1fr 1em;
}

.number-input-layout-right {
  grid-template-columns: 1fr 1em;
}

.number-input-layout-plus-minus {
  grid-template-columns: 1fr 1em;
}

.number-input-layout-vertical {
  grid-template-rows: 1em 1fr 1em;
}


/* Spinner Controls Container */
.spinner-controls {
  display: flex;
  flex-direction: column;
  height: calc(100%);
  transition: all 0.2s ease;
}

/* Show spinners on input focus or hover */
.custom-number-input:hover .spinner-controls,
.custom-number-input input:focus + .spinner-controls,
.custom-number-input .spinner-controls:hover {
  opacity: 1;
  visibility: visible;
}

/* Individual Spinner Buttons */
.spinner-btn {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  width: 32px;
  height: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #495057;
  user-select: none;
  transition: all 0.15s ease;
  padding: 0;
  margin: 0;
}

.spinner-btn:hover {
  background: #e9ecef;
  color: #212529;
}

.spinner-btn:active {
  background: #dee2e6;
  transform: scale(0.95);
}

.spinner-btn:disabled {
  background: #f8f9fa;
  color: #adb5bd;
  cursor: not-allowed;
  opacity: 0.6;
}

.spinner-up {
  border-bottom: none;
  border-radius: 0 4px 0 0;
}

.spinner-down {
  border-radius: 0 0 4px 0;
}

/* Input states when at limits */
.custom-number-input.at-max .spinner-up,
.custom-number-input.at-min .spinner-down {
  background: #f8f9fa;
  color: #adb5bd;
  cursor: not-allowed;
  opacity: 0.6;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .custom-number-input input[type="number"] {
      font-size: 16px; /* Prevents zoom on iOS */
      padding: 14px 45px 14px 14px;
  }
  
  .spinner-controls {
      width: 38px;
  }
  
  .spinner-btn {
      width: 38px;
      font-size: 14px;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  body {
      background-color: #1a1a1a;
      color: #fff;
  }
  
  .container {
      background: #2d2d2d;
  }
  
  label {
      color: #fff;
  }
  
  .custom-number-input input[type="number"] {
      background-color: #404040;
      border-color: #555;
      color: #fff;
  }
  
  .custom-number-input input[type="number"]:focus {
      border-color: #4a9eff;
  }
  
  .spinner-btn {
      background: #505050;
      border-color: #666;
      color: #fff;
  }
  
  .spinner-btn:hover {
      background: #606060;
  }
  
  .spinner-btn:active {
      background: #454545;
  }
}

`,C=["default","left-right","left-right-round","right","right-round","plus-minus","vertical"],g={layout:"default",showOnHover:!0,showOnFocus:!0,continuousDelay:500,continuousInterval:100,cssClasses:{container:"custom-number-input-container",spinner:"spinner-controls",incButton:"spinner-btn spinner-up",decButton:"spinner-btn spinner-down"},i18n:{incrementLabel:"Increment",decrementLabel:"Decrement",ariaControlsIdPrefix:"number-input"},onChange:null};class u{static#e=!1;static#u=new Map;static get instances(){return u.#u}static build(t,e=g){const n=l(e)?e:y(g);if(b(t)){const s=document.querySelectorAll(t);return s.length?[...s].map(o=>u.#p(o,n)):(u.#f(`No elements found for selector: ${t}`),null)}else return u.#p(t,n)}static#p(t,e){if(!m(t))return u.#f();if(u.isNumberInput(t))return u.#d(t,e);const n=document.createElement("input");return n.type="number",u.#m(t,n),t.appendChild(n),u.#d(n,e)}static#m(t,e){["min","max","step","value","placeholder","disabled","required"].forEach(s=>{t.hasAttribute(s)&&e.setAttribute(s,t.getAttribute(s))})}static#d(t,e){if(u.#u.has(t))return console.warn("CustomNumberInput: Already instantiated for this element."),u.#u.get(t);const n=new u(t,e);return u.#u.set(t,n),n}static#b(t){const e=p(y(g),t);return C.includes(e.layout)||(e.layout="default"),e}static#f(t='A valid input[type="number"] HTMLElement is required.'){throw new Error(`[CustomNumberInput] ${t}`)}static isNumberInput(t){return t instanceof HTMLInputElement&&t.type==="number"}static injectStyles(){if(u.#e)return;const t=document.createElement("style");t.id="custom-number-input-styles",t.textContent=V,document.head.appendChild(t),u.#e=!0}#t;#n;#i;#s;#r;#c=null;#l=null;constructor(t,e={}){this.#t=t,this.#n=u.#b(e),this.#y(),this.#x(),this.#w(),this.#o()}destroy(){this.#a(),u.#u.delete(this.#t);const t=this.#i?.parentNode;t&&this.#i&&this.#t&&t.replaceChild(this.#t,this.#i)}get input(){return this.#t}get container(){return this.#i}get incButton(){return this.#s}get decButton(){return this.#r}get config(){return{...this.#n}}getValue(){const t=this.#t.value.trim();if(t==="")return 0;const e=parseFloat(t);return isNaN(e)?0:e}setValue(t){if(typeof t!="number"||isNaN(t)){console.warn("[CustomNumberInput] setValue expects a number");return}const e=this.getStep(),n=this.#g(e),s=parseFloat(t.toFixed(n));this.#t.value=s,this.#t.dispatchEvent(new Event("input",{bubbles:!0})),this.#t.dispatchEvent(new Event("change",{bubbles:!0})),typeof this.#n.onChange=="function"&&this.#n.onChange(s),this.#o()}getStep(){const t=parseFloat(this.#t.step);return isNaN(t)?1:t}getMin(){const t=parseFloat(this.#t.min);return isNaN(t)?null:t}getMax(){const t=parseFloat(this.#t.max);return isNaN(t)?null:t}#g(t){if(!Number.isFinite(t))return 0;const e=t.toString();return e.includes("e-")?parseInt(e.split("e-")[1],10):e.includes(".")?e.split(".")[1].length:0}increment(t){t?.preventDefault();const e=this.getValue()+this.getStep(),n=this.getMax();(n===null||e<=n)&&this.setValue(e),this.#o()}decrement(t){t?.preventDefault();const e=this.getValue()-this.getStep(),n=this.getMin();(n===null||e>=n)&&this.setValue(e),this.#o()}#o(){const t=this.getValue(),e=this.getMin(),n=this.getMax(),s=this.getStep();this.#i.classList.remove("at-min","at-max"),e!==null&&t<=e&&this.#i.classList.add("at-min"),n!==null&&t>=n&&this.#i.classList.add("at-max"),this.#s.disabled=n!==null&&t+s>n,this.#r.disabled=e!==null&&t-s<e}#y(){this.#t.classList.add("custom-number-input");const t=this.#n.cssClasses.container.split(" ");this.#i=document.createElement("div"),this.#i.classList.add(...t,`number-input-layout-${this.#n.layout}`),this.#t.parentNode?.insertBefore(this.#i,this.#t),this.#i.appendChild(this.#t)}#x(){const{incrementLabel:t,decrementLabel:e,ariaControlsIdPrefix:n}=this.#n.i18n,s=document.createElement("div");s.classList.add(...this.#n.cssClasses.spinner.split(" "));const o=this.#t.id||`${n}-${Math.random().toString(36).slice(2)}`;this.#t.id||(this.#t.id=o);const r=document.createElement("button");r.type="button",r.classList.add(...this.#n.cssClasses.incButton.split(" ")),r.innerHTML="&#9650;",r.tabIndex=-1,r.setAttribute("aria-label",t),r.setAttribute("aria-controls",o),this.#s=r;const c=document.createElement("button");c.type="button",c.classList.add(...this.#n.cssClasses.decButton.split(" ")),c.innerHTML="&#9660;",c.tabIndex=-1,c.setAttribute("aria-label",e),c.setAttribute("aria-controls",o),this.#r=c,s.appendChild(r),s.appendChild(c),this.#i.appendChild(s)}#w(){u.injectStyles(),this.#s.addEventListener("click",this.increment.bind(this)),this.#r.addEventListener("click",this.decrement.bind(this)),["mousedown","touchstart"].forEach(t=>this.#s.addEventListener(t,e=>this.#h(e,"up"))),["mousedown","touchstart"].forEach(t=>this.#r.addEventListener(t,e=>this.#h(e,"down"))),["mouseup","touchend","mouseleave"].forEach(t=>{this.#s.addEventListener(t,this.#a.bind(this)),this.#r.addEventListener(t,this.#a.bind(this)),document.addEventListener(t,this.#a.bind(this))}),this.#t.addEventListener("input",this.#o.bind(this)),this.#t.addEventListener("change",this.#o.bind(this)),this.#t.addEventListener("keydown",t=>this.#L(t)),this.#o()}#L(t){t.key==="ArrowUp"?(t.preventDefault(),this.#s.disabled||this.increment(t)):t.key==="ArrowDown"&&(t.preventDefault(),this.#r.disabled||this.decrement(t))}#h(t,e){t.preventDefault(),this.#a(),this.#c=setTimeout(()=>{this.#l=setInterval(()=>{e==="up"?this.increment(new Event("auto")):this.decrement(new Event("auto"))},this.#n.continuousInterval)},this.#n.continuousDelay)}#a(){this.#c&&(clearTimeout(this.#c),this.#c=null),this.#l&&(clearInterval(this.#l),this.#l=null)}}return u});
