(function(c,p){typeof exports=="object"&&typeof module<"u"?module.exports=p():typeof define=="function"&&define.amd?define(p):(c=typeof globalThis<"u"?globalThis:c||self,c["Custom Number Input"]=p())})(this,function(){"use strict";function c(s,t){return!l(s)||!l(t)?t:(Object.keys(t).forEach(e=>{const n=s[e],i=t[e];d(n)&&d(i)?s[e]=c(n.concat([]),i):l(n)&&l(i)?s[e]=c(Object.assign({},n),i):s[e]=i}),s)}function p(s){if(s===null||typeof s!="object")return s;let t;s instanceof Date?t=new s.constructor:t=d(s)?[]:{};for(let e in s)Object.prototype.hasOwnProperty.call(s,e)&&(typeof s[e]!="object"||s[e]===s?t[e]=s[e]:t[e]=p(s[e]));return t}function x(s){try{return structuredClone(s)}catch{return p(s)}}function w(s,t,e){[s[t],s[e]]=[s[e],s[t]]}const v=s=>s.entries().next().value,C=s=>s.entries().next().value[0],L=s=>s.entries().next().value[1],E=s=>[...s].pop(),k=s=>[...s.keys()].pop(),V=s=>[...s.values()].pop();class g extends Map{constructor(t){super(t)}indexOfKey(t){return[...this.keys()].indexOf(t)}indexOfValue(t){return[...this.values()].indexOf(t)}entryAtIndex(t){return[...this.entries()][t]}keyAtIndex(t){return[...this.keys()][t]}valueAtIndex(t){return[...this.values()][t]}insert(t,e,n){return this.insertIndex(n,t,e)}remove(t){return this.removeIndex(t)}firstEntry(){return v(this)}firstKey(){return C(this)}firstValue(){return L(this)}lastEntry(){return E(this)}lastKey(){return k(this)}lastValue(){return V(this)}prevCurrNext(t){let e=curr=next=null;for(let n of this)if(e=curr,curr=n,n.key==t)break;return{prev:e,curr,next}}union(...t){if(typeof super.prototype.union=="function")super.union(...t);else for(const e of t)for(const n of e)this.set(...n)}setMultiple(t){return d(t)?(t.forEach(([e,n])=>this.set(e,n)),!0):!1}populate(t){return d(t)?(this.clear(),t.forEach(([e,n])=>this.set(e,n)),!0):!1}insertIndex(t,e,n){if(!h(t))return!1;const i=[...this];return i.splice(t,0,[e,n]),this.populate(i),!0}removeIndex(t){if(!h(t))return!1;const e=[...this];return e.splice(t,1),this.populate(e),!0}swapIndices(t,e){if(!h(t)||!h(e))return!1;const n=[...this];return w(n,t,e),this.populate(n),!0}swapKeys(t,e){const n=[...this],i=n.findIndex(([a])=>a===t),r=n.findIndex(([a])=>a===e);return[n[i],n[r]]=[n[r],n[i]],this.clear(),n.forEach(([a,b])=>this.set(a,b)),!0}}class u{static#e=new g;static get entries(){return u.#e}static isValid(t,e,n,i){return!l(t)||!f(e)||!y(n)||!M(i)}static add(t,e,n,i){if(!this.isValid(t,e,n,i))return!1;e.addEventListener(n,i),u.#e.has(t)||u.#e.set(t,new g);const r=u.#e.get(t);r.has(e)||r.set(e,{});const a=r.get(e);return d(a[n])||(a[n]=[]),a[n].push(i),!0}static remove(t,e,n,i){if(!u.isValid(t,e,n,i)||!u.#e.has(t))return!1;const r=u.#e.get(t);if(!r.has(e))return!1;const a=r.get(e);if(!(n in a))return!1;const b=a[n].indexOf(i);return b<0?!1:(a[n].splice(b,1),a[n].length==0&&delete a[n],Object.keys(a).length==0&&r.delete(e),r.size==0&&u.#e.delete(t),!0)}static expungeEvent(t,e,n){if(!l(t)||!f(e)||!y(n))return!1;const i=u.#e.get(t);if(!i.has(e))return!1;const r=i.get(e);if(n in r){for(let a of r[n])e.removeEventListener(n,a);delete r[n]}return!0}static expungeElement(t,e){if(!l(t)||!f(e))return!1;const n=u.#e.get(t);if(n.has(e)){let i=n.get(e);for(let r in i)u.expungeEvent(t,e,r);n.delete(e)}return!0}static expungeContext(t){if(!l(t))return!1;if(u.#e.has(t)){const e=u.#e.get(t);for(let n of e)u.expungeElement(t,n);u.#e.delete(t)}return!0}static expungeAll(){}static destroy(){for(let t of u.#e)u.expungeContext(t);return u.#e=void 0,!0}}function d(s){return Array.isArray(s)}function M(s){return s&&typeof s=="function"}function l(s){return typeof s=="object"&&!Array.isArray(s)&&s!==null}function h(s){return typeof s=="number"&&!isNaN(s)}function y(s){return typeof s=="string"}function f(s){return typeof HTMLElement=="object"?s instanceof HTMLElement:s&&typeof s=="object"&&s!==null&&s.nodeType===1&&typeof s.nodeName=="string"}const I=`
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

`,O=["default","left-right","left-right-round","right","right-round","plus-minus","vertical"],m={layout:"default",showOnHover:!0,showOnFocus:!0,continuousDelay:500,continuousInterval:100,cssClasses:{container:"custom-number-input-container",spinner:"spinner-controls",incButton:"spinner-btn spinner-up",decButton:"spinner-btn spinner-down"}};class o{static#e=!1;static#u=new Map;static get elements(){return o.#u}static build(t,e=m){if(e=l(e)?o.#m(e):m,y(t)){const n=document.querySelectorAll(t);return n.length||o.#d(`No elements found for selector: ${t}`),[...n].map(r=>o.#h(r,e))}else return o.#h(t,e)}static#p(t,e){if(o.#u.has(t))return console.warn("NumberInput already exists for this element"),o.#u.get(t);const n=new o(t,e);return o.#u.set(t,n),n}static#d(t='a valid HTMLElement input type="number is expected"'){throw new Error(`NumberInput Error: ${t}`)}static isNumberInput(t){return t instanceof HTMLInputElement&&t.type==="number"}static#h(t,e){if(f(t)){if(o.isNumberInput(t))return o.#p(t,e);{const n=document.createElement("input");n.setAttribute("type","number");const i=o.#p(n,e);return t.appendChild(i),i}}else return o.#d(),null}static injectStyles(){if(!o.#e){const t=document.createElement("style");t.type="text/css",t.id="custom-number-input-styles",t.appendChild(document.createTextNode(I)),document.head.appendChild(t),o.#e=!0}}static#m(t){x(m);const e=c(m,t);return O.includes(e.layout)||(e.layout="default"),e.showOnHover,e.showOnFocus,e}#t;#r;#i;#n;#s;#l=null;#c=null;constructor(t,e={}){this.#t=t,this.#r=e,this.#b(),this.#y(),this.#g()}destroy(){this.#a(),o.#u.delete(this.#t),this.#i.remove()}get input(){return this.#t}get container(){return this.#i}get incButton(){return this.#n}get decButton(){return this.#s}get config(){return{...this.#r}}#b(){this.#t.classList.add("custom-number-input");const t=this.#r.cssClasses.container.split(" ");this.#i=document.createElement("div"),this.#i.classList.add(...t,`number-input-layout-${this.#r.layout}`),this.#t.parentNode?.insertBefore(this.#i,this.#t),this.#i.appendChild(this.#t)}#y(){const t=this.#r.cssClasses.spinner.split(" "),e=document.createElement("div");e.classList.add(...t);const n=this.#r.cssClasses.incButton.split(" ");this.#n=document.createElement("button"),this.#n.type="button",this.#n.classList.add(...n),this.#n.innerHTML="&#9650;",this.#n.tabIndex=-1,this.#n.setAttribute("aria-label","Increment"),this.#n.setAttribute("aria-controls",this.#t.id||"number-input");const i=this.#r.cssClasses.decButton.split(" ");this.#s=document.createElement("button"),this.#s.type="button",this.#s.classList.add(...i),this.#s.innerHTML="&#9660;",this.#s.tabIndex=-1,this.#s.setAttribute("aria-label","Decrement"),this.#s.setAttribute("aria-controls",this.#t.id||"number-input"),e.appendChild(this.#n),e.appendChild(this.#s),this.#i.appendChild(e)}#g(){o.injectStyles(),this.#n.addEventListener("click",t=>this.increment.call(this,t)),this.#s.addEventListener("click",t=>this.decrement.call(this,t)),this.#n.addEventListener("mousedown",t=>this.#f.call(this,t,"up")),this.#s.addEventListener("mousedown",t=>this.#f.call(this,t,"down")),document.addEventListener("mouseup",()=>this.#a.call(this)),this.#n.addEventListener("mouseleave",()=>this.#a.call(this)),this.#s.addEventListener("mouseleave",()=>this.#a.call(this)),this.#t.addEventListener("input",()=>this.#o.call(this)),this.#t.addEventListener("change",()=>this.#o.call(this)),this.#n.addEventListener("mousedown",t=>t.preventDefault()),this.#s.addEventListener("mousedown",t=>t.preventDefault()),this.#o()}getValue(){const t=this.#t.value.trim();if(t==="")return 0;const e=parseFloat(t);return isNaN(e)?0:e}getStep(){const t=parseFloat(this.#t.step);return isNaN(t)?1:t}getMin(){const t=parseFloat(this.#t.min);return isNaN(t)?null:t}getMax(){const t=parseFloat(this.#t.max);return isNaN(t)?null:t}setValue(t){if(typeof t!="number"||isNaN(t)){console.warn("setValue expects a valid number");return}const e=this.getStep(),n=this.#x(e),i=parseFloat(t.toFixed(n));this.#t.value=i,this.#t.dispatchEvent(new Event("input",{bubbles:!0})),this.#t.dispatchEvent(new Event("change",{bubbles:!0}))}#x(t){const e=t.toString();if(e.indexOf(".")!==-1&&e.indexOf("e-")===-1)return e.split(".")[1].length;if(e.indexOf("e-")!==-1){const n=e.split("e-");return parseInt(n[1],10)}return 0}increment(t){t.preventDefault();const e=this.getValue(),n=this.getStep(),i=this.getMax(),r=e+n;(i===null||r<=i)&&this.setValue(r),this.#o()}decrement(t){t.preventDefault();const e=this.getValue(),n=this.getStep(),i=this.getMin(),r=e-n;(i===null||r>=i)&&this.setValue(r),this.#o()}#o(){const t=this.getValue(),e=this.getMin(),n=this.getMax(),i=this.getStep();this.#i.classList.remove("at-min","at-max"),e!==null&&t<=e&&this.#i.classList.add("at-min"),n!==null&&t>=n&&this.#i.classList.add("at-max"),this.#n.disabled=n!==null&&t+i>n,this.#s.disabled=e!==null&&t-i<e}#f(t,e){t.preventDefault(),this.#a(),this.#l=setTimeout(()=>{this.#c=setInterval(()=>{e==="up"?this.increment():this.decrement()},this.#r.continuousInterval)},this.#r.continuousDelay)}#a(){this.#l&&(clearTimeout(this.#l),this.#l=null),this.#c&&(clearInterval(this.#c),this.#c=null)}}return o});
