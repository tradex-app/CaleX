(function(h,c){typeof exports=="object"&&typeof module<"u"?module.exports=c():typeof define=="function"&&define.amd?define(c):(h=typeof globalThis<"u"?globalThis:h||self,h["Custom Time Input"]=c())})(this,function(){"use strict";function h(n,t){return!l(n)||!l(t)?t:(Object.keys(t).forEach(e=>{const s=n[e],i=t[e];p(s)&&p(i)?n[e]=h(s.concat([]),i):l(s)&&l(i)?n[e]=h(Object.assign({},s),i):n[e]=i}),n)}function c(n){if(n===null||typeof n!="object")return n;let t;n instanceof Date?t=new n.constructor:t=p(n)?[]:{};for(let e in n)Object.prototype.hasOwnProperty.call(n,e)&&(typeof n[e]!="object"||n[e]===n?t[e]=n[e]:t[e]=c(n[e]));return t}function x(n){try{return structuredClone(n)}catch{return c(n)}}function w(n,t,e){[n[t],n[e]]=[n[e],n[t]]}const I=n=>n.entries().next().value,M=n=>n.entries().next().value[0],C=n=>n.entries().next().value[1],E=n=>[...n].pop(),v=n=>[...n.keys()].pop(),L=n=>[...n.values()].pop();class b extends Map{constructor(t){super(t)}indexOfKey(t){return[...this.keys()].indexOf(t)}indexOfValue(t){return[...this.values()].indexOf(t)}entryAtIndex(t){return[...this.entries()][t]}keyAtIndex(t){return[...this.keys()][t]}valueAtIndex(t){return[...this.values()][t]}insert(t,e,s){return this.insertIndex(s,t,e)}remove(t){return this.removeIndex(t)}firstEntry(){return I(this)}firstKey(){return M(this)}firstValue(){return C(this)}lastEntry(){return E(this)}lastKey(){return v(this)}lastValue(){return L(this)}prevCurrNext(t){let e=curr=next=null;for(let s of this)if(e=curr,curr=s,s.key==t)break;return{prev:e,curr,next}}union(...t){if(typeof super.prototype.union=="function")super.union(...t);else for(const e of t)for(const s of e)this.set(...s)}setMultiple(t){return p(t)?(t.forEach(([e,s])=>this.set(e,s)),!0):!1}populate(t){return p(t)?(this.clear(),t.forEach(([e,s])=>this.set(e,s)),!0):!1}insertIndex(t,e,s){if(!f(t))return!1;const i=[...this];return i.splice(t,0,[e,s]),this.populate(i),!0}removeIndex(t){if(!f(t))return!1;const e=[...this];return e.splice(t,1),this.populate(e),!0}swapIndices(t,e){if(!f(t)||!f(e))return!1;const s=[...this];return w(s,t,e),this.populate(s),!0}swapKeys(t,e){const s=[...this],i=s.findIndex(([o])=>o===t),a=s.findIndex(([o])=>o===e);return[s[i],s[a]]=[s[a],s[i]],this.clear(),s.forEach(([o,y])=>this.set(o,y)),!0}}class u{static#s=new b;static get entries(){return u.#s}static isValid(t,e,s,i){return!l(t)||!d(e)||!g(s)||!V(i)}static add(t,e,s,i){if(!this.isValid(t,e,s,i))return!1;e.addEventListener(s,i),u.#s.has(t)||u.#s.set(t,new b);const a=u.#s.get(t);a.has(e)||a.set(e,{});const o=a.get(e);return p(o[s])||(o[s]=[]),o[s].push(i),!0}static remove(t,e,s,i){if(!u.isValid(t,e,s,i)||!u.#s.has(t))return!1;const a=u.#s.get(t);if(!a.has(e))return!1;const o=a.get(e);if(!(s in o))return!1;const y=o[s].indexOf(i);return y<0?!1:(o[s].splice(y,1),o[s].length==0&&delete o[s],Object.keys(o).length==0&&a.delete(e),a.size==0&&u.#s.delete(t),!0)}static expungeEvent(t,e,s){if(!l(t)||!d(e)||!g(s))return!1;const i=u.#s.get(t);if(!i.has(e))return!1;const a=i.get(e);if(s in a){for(let o of a[s])e.removeEventListener(s,o);delete a[s]}return!0}static expungeElement(t,e){if(!l(t)||!d(e))return!1;const s=u.#s.get(t);if(s.has(e)){let i=s.get(e);for(let a in i)u.expungeEvent(t,e,a);s.delete(e)}return!0}static expungeContext(t){if(!l(t))return!1;if(u.#s.has(t)){const e=u.#s.get(t);for(let s of e)u.expungeElement(t,s);u.#s.delete(t)}return!0}static expungeAll(){}static destroy(){for(let t of u.#s)u.expungeContext(t);return u.#s=void 0,!0}}function p(n){return Array.isArray(n)}function V(n){return n&&typeof n=="function"}function l(n){return typeof n=="object"&&!Array.isArray(n)&&n!==null}function f(n){return typeof n=="number"&&!isNaN(n)}function g(n){return typeof n=="string"}function d(n){return typeof HTMLElement=="object"?n instanceof HTMLElement:n&&typeof n=="object"&&n!==null&&n.nodeType===1&&typeof n.nodeName=="string"}const N=`
.custom-time-input-container {
  display: inline-flex;
  position: relative;
  align-items: center;
  gap: 4px;
  border: 1px solid;
  padding: 0;
  background: inherit;
  font-family: inherit;
}

.custom-time-input-container:focus-within {
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.hour-input,
.minute-input {
  color: inherit;
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
  color: inherit;
  user-select: none;
}

.custom-time-input-container input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

`,m={cssClasses:{container:"custom-time-input-container",wrapper:"time-inputs-wrapper",hourInput:"hour-input",minuteInput:"minute-input",separator:"time-separator"}};class r{static#s=!1;static#a=new Map;static get elements(){return r.#a}static build(t,e=m){if(e=l(e)?r.#g(e):m,g(t)){const s=document.querySelectorAll(t);return s.length||r.#o(`No elements found for selector: ${t}`),[...s].map(a=>r.#d(a,e))}else return r.#d(t,e)}static#y(t,e){if(r.#a.has(t))return console.warn("TimeInput already exists for this element"),r.#a.get(t);const s=new r(t,e);return r.#a.set(t,s),s}static#o(t='a valid HTMLElement input type="time" is expected'){throw new Error(`TimeInput Error: ${t}`)}static isTimeInput(t){return t instanceof HTMLInputElement&&t.type==="time"}static#d(t,e){return d(t)?r.isTimeInput(t)?r.#y(t,e):(r.#o(),null):(r.#o(),null)}static injectStyles(){if(!r.#s){const t=document.createElement("style");t.type="text/css",t.id="custom-time-input-styles",t.appendChild(document.createTextNode(N)),document.head.appendChild(t),r.#s=!0}}static#g(t){return x(m),h(m,t)}#n;#u;#i;#t;#e;#l;#C;#h=!1;constructor(t,e={}){r.isTimeInput(t)||r.#o(),this.#n=t,this.#u=e,this.#b(),this.#x(),this.#w()}destroy(){r.#a.delete(this.#n),this.#n.style.display="",this.#i.remove()}get input(){return this.#n}get container(){return this.#i}get hourInput(){return this.#t}get minuteInput(){return this.#e}get config(){return{...this.#u}}#b(){this.#n.style.display="none";const t=this.#u.cssClasses.container.split(" ");this.#i=document.createElement("div"),this.#i.classList.add(...t),this.#n.parentNode?.insertBefore(this.#i,this.#n.nextSibling)}#x(){const t=this.#u.cssClasses.hourInput.split(" ");this.#t=document.createElement("input"),this.#t.type="number",this.#t.min="0",this.#t.max="23",this.#t.step="1",this.#t.classList.add(...t),this.#t.setAttribute("aria-label","Hours"),this.#t.placeholder="00";const e=this.#u.cssClasses.separator.split(" ");this.#l=document.createElement("span"),this.#l.classList.add(...e),this.#l.textContent=":";const s=this.#u.cssClasses.minuteInput.split(" ");this.#e=document.createElement("input"),this.#e.type="number",this.#e.min="0",this.#e.max="59",this.#e.step="1",this.#e.classList.add(...s),this.#e.setAttribute("aria-label","Minutes"),this.#e.placeholder="00",this.#i.appendChild(this.#t),this.#i.appendChild(this.#l),this.#i.appendChild(this.#e)}#w(){r.injectStyles(),this.#c(),this.#t.addEventListener("input",()=>this.#r()),this.#t.addEventListener("change",()=>this.#r()),this.#e.addEventListener("input",()=>this.#r()),this.#e.addEventListener("change",()=>this.#r()),this.#n.addEventListener("input",()=>this.#m()),this.#n.addEventListener("change",()=>this.#m()),this.#t.addEventListener("blur",()=>this.#I()),this.#e.addEventListener("blur",()=>this.#M())}#m(){this.#h||this.#c()}#c(){const t=this.#n.value;if(t){const[e,s]=t.split(":");this.#t.value=parseInt(e,10)||0,this.#e.value=parseInt(s,10)||0}else this.#t.value="",this.#e.value=""}#r(){this.#h=!0;const t=this.#p(),e=this.#f(),s=`${t.toString().padStart(2,"0")}:${e.toString().padStart(2,"0")}`;this.#n.value=s,this.#n.dispatchEvent(new Event("input",{bubbles:!0})),this.#n.dispatchEvent(new Event("change",{bubbles:!0})),this.#h=!1}#p(){const t=parseInt(this.#t.value,10);return isNaN(t)?0:Math.max(0,Math.min(23,t))}#f(){const t=parseInt(this.#e.value,10);return isNaN(t)?0:Math.max(0,Math.min(59,t))}#I(){const t=this.#p();this.#t.value=t,this.#r()}#M(){const t=this.#f();this.#e.value=t,this.#r()}getValue(){return this.#n.value}setValue(t){if(typeof t!="string"){console.warn("setValue expects a valid time string (HH:MM)");return}this.#n.value=t,this.#c()}getHours(){return this.#p()}getMinutes(){return this.#f()}setHours(t){if(typeof t!="number"||t<0||t>23){console.warn("setHours expects a number between 0 and 23");return}this.#t.value=t,this.#r()}setMinutes(t){if(typeof t!="number"||t<0||t>59){console.warn("setMinutes expects a number between 0 and 59");return}this.#e.value=t,this.#r()}}return r});
