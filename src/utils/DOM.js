// DOM utilities

import { isFunction, isNumber, isObject, isString } from "./typeChecks.js";

export const htmlAttr = ["id", "class", "style", "alt", "width", "height", "title"];
export const inputAttr = [...htmlAttr, "name", "type", "value", "default", "placeholder", "max", "min", "maxlength", "src", "checked", "disabled", "pattern", "readonly", "required", "size", "step", "multiple", "autofocus", "list", "autocomplete"];
export const inputTypes = ["button", "color", "date", "datetime-local", "email", "file", "hidden", "image", "month", "number", "password", "radio", "range", "reset", "search", "submit", "tel", "text", "time", "url", "week"];

export function findByID(id, base = document) {
  return base.getElementById(id);
}

export function findByClass(cl, base = document) {
  return base.getElementsByClassName(cl);
}

export function findByName(name, base = document) {
  return base.getElementsByName(name);
}

export function findByTag(tag, base = document) {
  return base.getElementsByTagName(tag);
}

export function findBySelector(sel, base = document) {
  return base.querySelector(sel);
}

export function findBySelectorAll(sel, base = document) {
  return base.querySelectorAll(sel);
}

// returns true if it is a DOM node
export function isNode(o) {
  return typeof Node === "object"
    ? o instanceof Node
    : o &&
        typeof o === "object" &&
        typeof o.nodeType === "number" &&
        typeof o.nodeName === "string";
}

// returns true if it is a DOM element
export function isHTMLElement(o) {
  return typeof HTMLElement === "object"
    ? o instanceof HTMLElement //DOM2
    : o &&
        typeof o === "object" &&
        o !== null &&
        o.nodeType === 1 &&
        typeof o.nodeName === "string";
}

// returns true if DOM element is visible
export function isVisible(o) {
  if (!isHTMLElement(o)) return false;

  return (
    !!o && !!(o.offsetWidth || o.offsetHeight || o.getClientRects().length)
  );
}

// https://www.javascripttutorial.net/dom/css/check-if-an-element-is-visible-in-the-viewport/
export function isInViewport(el) {
  if (!isHTMLElement(el)) return false;

  const rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// Convert HTML string to DOM element
export function htmlToElement(html) {
  const template = document.createElement('template');
  html = html.trim(); // Never return a text node of whitespace as the result
  template.innerHTML = html;
  return template.content.firstChild;
}

// Convert HTML string to DOM elements
export function htmlToElements(html) {
  const template = document.createElement('template');
  template.innerHTML = html;
  return template.content.childNodes;
}

// Test if input is a valid SVG string
export function isSVG(html) {
  if (!isString(html)) return false;
  const svg = /<\s*svg[^>]*>(.*?)<\s*\/\s*svg>/;
  return svg.test(html);
}

// Wait for element to appear in DOM
export function waitForElm(selector) {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver((mutations) => {
      if (document.querySelector(selector)) {
        observer.disconnect();
        resolve(document.querySelector(selector));
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}

// Get element dimensions and position
export function elementDimPos(el) {
  if (!isHTMLElement(el)) return false;

  let _x = 0;
  let _y = 0;
  let El = el;
  
  while (El && !isNaN(El.offsetLeft) && !isNaN(El.offsetTop)) {
    _x += El.offsetLeft - El.scrollLeft;
    _y += El.offsetTop - El.scrollTop;
    El = El.offsetParent;
  }
  
  return { 
    top: _y, 
    left: _x, 
    width: el.offsetWidth, 
    height: el.offsetHeight 
  };
}

// Add event listener with cleanup tracking
export function addEventListenerWithCleanup(element, event, handler, options = {}) {
  if (!isHTMLElement(element) || !isString(event) || !isFunction(handler)) {
    return null;
  }
  
  element.addEventListener(event, handler, options);
  
  // Return cleanup function
  return () => {
    element.removeEventListener(event, handler, options);
  };
}

// Create element with attributes
export function createElement(tagName, attributes = {}, children = []) {
  const element = document.createElement(tagName);
  
  // Set attributes
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === 'className') {
      element.className = value;
    } else if (key === 'innerHTML') {
      element.innerHTML = value;
    } else if (key === 'textContent') {
      element.textContent = value;
    } else {
      element.setAttribute(key, value);
    }
  });
  
  // Add children
  children.forEach(child => {
    if (isString(child)) {
      element.appendChild(document.createTextNode(child));
    } else if (isHTMLElement(child)) {
      element.appendChild(child);
    }
  });
  
  return element;
}

// Throttle function for scroll events
export function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
}

// Debounce function for input events
export function debounce(func, wait, immediate) {
  let timeout;
  return function() {
    const context = this, args = arguments;
    const later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

// Get scroll position
export function getScrollPosition(element = window) {
  if (element === window) {
    return {
      x: window.pageXOffset || document.documentElement.scrollLeft,
      y: window.pageYOffset || document.documentElement.scrollTop
    };
  } else if (isHTMLElement(element)) {
    return {
      x: element.scrollLeft,
      y: element.scrollTop
    };
  }
  return { x: 0, y: 0 };
}

// Set scroll position
export function setScrollPosition(element, x, y, behavior = 'auto') {
  if (element === window) {
    window.scrollTo({ left: x, top: y, behavior });
  } else if (isHTMLElement(element)) {
    element.scrollTo({ left: x, top: y, behavior });
  }
}
