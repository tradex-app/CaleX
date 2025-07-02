import { htmlToElement, htmlToElements, isHTMLElement } from "./utils/DOM";
import i18n from "./i18n";
import { isArrayOfType, isFunction, isNumber, isString } from "./utils/typeChecks";
import css from "./style";
import languages from "./i18n/languages";
import numberInput from "../local_modules/custom-number-input/custom-number-input.es"

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const english = {
  id: {code: "en", name: "English"},
  translations: {
    ...Object.fromEntries(monthNames.map(prop => [prop, prop])),
    ...Object.fromEntries(dayNames.map(prop => [prop, prop]))
  }
}

export default class CaleX {

  static #styleInjected = false


  #container
  #currentDate = new Date()
  #selectedDate = null
  #eventListeners = new Map();
  #eventDates = new Map()
  #priorityEventDates = new Set()
  #options = {}
  #language = "en"
  #lang
  #monthNames = {}
  #dayNames = {}
  
  // DOM element references for selective updates
  #grid
  #timeInput
  #monthInput
  #yearInput
  #calendarContainer
  #header
  #footer
  #timeContainer

  constructor(container, options = {}) {
    if (!isHTMLElement(container))
      throw new Error("Calendar expects a valid HTML container element")

    this.#container = container;
    this.#options = {
      ...options,
      onDateSelect: (isFunction(options?.onDateSelect)) ? options.onDateSelect : null,
      onMonthChange: (isFunction(options?.onMonthChange)) ? options.onMonthChange : null,
      showControls: options?.showControls === true,
      showTime: options?.showTime !== false,
      showWeekNumbers: options?.showWeekNumbers !== false,
      showOtherMonthEvents: options?.showOtherMonthEvents !== false,
      showEventCount: options?.showEventCount !== false,
      weekStartsSunday: options?.weekStartsSunday !== false,
      allowPastDates: options?.allowPastDates !== true,
      language: options?.language || "en",
      languages: options?.languages || languages,
      priorityEvents: options?.priorityEvents !== false,
      weekendStyling: options?.weekendStyling !== false,
      theme: options?.theme || 'auto' // 'light', 'dark', 'auto'
    };

    this.setLanguage(this.#options.language, this.#options.languages)
    this.init();
  }

  /**
   * Destroy the calendar and clean up
   */
  destroy() {
    this.#container.innerHTML = '';
    this.#eventDates.clear();
    this.#priorityEventDates.clear();
    this.#selectedDate = null;
    this.#currentDate = null;
  }

  get container() { return this.#container }
  get currentDate() { return this.#currentDate }
  get selectedDate() { return this.#selectedDate }
  get eventDates() { return this.#eventDates }
  get language() { return this.#language }
  get monthNames() { return this.#monthNames }
  get dayNames() { return this.#dayNames }

  init() {
    this.setTheme(this.#options.theme);
    this.renderInitial(); // Changed from render() to renderInitial()
    
    if (!CaleX.#styleInjected) {
      const style = document.createElement('style');
      style.type = 'text/css';
      style.id = 'plain-calendar-styles';
      style.appendChild(document.createTextNode(css));
      document.head.appendChild(style);
      CaleX.#styleInjected = true;
    }
  }

  setTheme(theme) {
    this.#options.theme = theme;
    this.#container.className = `calendar-container theme-${theme}`;
    this.updateCalendar({ footer: true });
  }

  getTheme() {
    return this.#options.theme;
  }

  toggleTheme() {
    const currentTheme = this.#options.theme;
    let newTheme;
    switch (currentTheme) {
      case 'light':
        newTheme = 'dark';
        break;
      case 'dark':
        newTheme = 'auto';
        break;
      default:
        newTheme = 'light';
    }
    this.setTheme(newTheme);
  }

  setLanguage(lang="en", translations) {
    if (!(this.#lang instanceof i18n)) {
      const trans = (isArrayOfType(translations, "object")) ? translations : languages
      const merge = new Set([...languages, ...trans])
      const calLanguages = Array.from(merge)
      this.#lang = new i18n(calLanguages)
    }

    if (this.#lang.has(lang)) {
      this.#language = lang
      this.#monthNames = monthNames.map((month) => {
        return this.#lang.translate(this.#language, month)
      })

      const days = (this.#options.weekStartsSunday) ? dayNames : [...dayNames.slice(1), dayNames[0]];
      this.#dayNames = days.map((name) => {
        return this.#lang.translate(this.#language, name)
      })
    }
  }

 /**
   * Parse various date formats into a Date object
   * @param {Date|string|number} input - Date input in various formats
   * @returns {Date|null} Parsed Date object or null if invalid
   */
  parseDate(input) {
    if (!input && input !== 0) return null;

    try {
      // If already a Date object
      if (input instanceof Date) {
        return isNaN(input.getTime()) ? null : new Date(input);
      }

      // If it's a number (timestamp)
      if (isNumber(input)) {
        // Handle both seconds and milliseconds timestamps
        const timestamp = input < 10000000000 ? input * 1000 : input;
        const date = new Date(timestamp);
        return isNaN(date.getTime()) ? null : date;
      }

      // If it's a string
      if (isString(input)) {
        // Try parsing as timestamp first
        const numericValue = parseFloat(input);
        if (!isNaN(numericValue) && input.trim() === numericValue.toString()) {
          const timestamp = numericValue < 10000000000 ? numericValue * 1000 : numericValue;
          const date = new Date(timestamp);
          if (!isNaN(date.getTime())) return date;
        }

        // Try parsing as date string
        const date = new Date(input);
        return isNaN(date.getTime()) ? null : date;
      }

      return null;
    } catch (error) {
      console.error('Error parsing date:', error);
      return null;
    }
  }

  // Modified setDate to use selective updates
  setDate(date) {
    const parsedDate = this.parseDate(date);
    if (!parsedDate) {
      console.error('Invalid date format:', date);
      return false;
    }

    const previousMonth = this.#currentDate.getMonth();
    const previousYear = this.#currentDate.getFullYear();
    
    this.#selectedDate = parsedDate;
    this.#currentDate = new Date(parsedDate.getFullYear(), parsedDate.getMonth(), 1);

    // Determine what needs to be updated
    const monthChanged = parsedDate.getMonth() !== previousMonth;
    const yearChanged = parsedDate.getFullYear() !== previousYear;
    
    if (monthChanged || yearChanged) {
      this.updateCalendar({ 
        month: monthChanged, 
        year: yearChanged, 
        grid: true 
      });
    } else {
      // Just update the grid to show new selection
      this.updateBodyGrid();
    }

    if (this.#options.onDateSelect) {
      this.#options.onDateSelect(parsedDate);
    }

    return true;
  }

  // Modified addEventDates to use selective updates
  addEventDates(dates, options = {}) {
    const dateArray = Array.isArray(dates) ? dates : [dates];
    const { priority = false, count = 1, metadata = {} } = options;
    
    dateArray.forEach(date => {
      const parsedDate = this.parseDate(date);
      if (parsedDate) {
        // Store as timestamp for easy comparison
        const timestamp = new Date(
          parsedDate.getFullYear(),
          parsedDate.getMonth(),
          parsedDate.getDate()
        ).getTime();

        // Store event metadata
        const existingEvent = this.#eventDates.get(timestamp) || { count: 0, priority: false, metadata: {} };
        this.#eventDates.set(timestamp, {
          count: Math.max(existingEvent.count, count),
          priority: existingEvent.priority || priority,
          metadata: { ...existingEvent.metadata, ...metadata }
        });

        // Track priority events separately
        if (priority) {
          this.#priorityEventDates.add(timestamp);
        }
      }
    });

    // Only update the grid since events don't affect header inputs
    this.updateBodyGrid();
  }

  clearEventDates() {
    this.#eventDates.clear();
    this.#priorityEventDates.clear();
    // Only update the grid
    this.updateBodyGrid();
  }

  // Modified navigation methods to use selective updates
  previousMonth() {
    this.#currentDate.setMonth(this.#currentDate.getMonth() - 1);
    this.updateCalendar({ month: true, year: true, grid: true });
    
    if (this.#options.onMonthChange) {
      this.#options.onMonthChange(new Date(this.#currentDate));
    }
  }

  nextMonth() {
    this.#currentDate.setMonth(this.#currentDate.getMonth() + 1);
    this.updateCalendar({ month: true, year: true, grid: true });
    
    if (this.#options.onMonthChange) {
      this.#options.onMonthChange(new Date(this.#currentDate));
    }
  }

  goToToday() {
    this.#currentDate = new Date();
    this.updateCalendar({ month: true, year: true, time: true, grid: true });
  }

  // Modified input handlers to use selective updates
  setDateFromTimeInput(event) {
    const time = event.currentTarget.value;
    const [hours, minutes] = time.split(":");
    this.#currentDate.setHours(hours, minutes);
    // Only update grid if time affects display, otherwise just update time input
    this.updateCalendar({ time: false, grid: false }); // Time input is already updated by user
    this.#timeInput.focus();
  }

  setDateFromMonthInput(event) {
    const month = event.currentTarget.value;
    this.#currentDate.setMonth(month);
    this.updateCalendar({ month: false, year: false, grid: true }); // Month input already updated by user
    this.#monthInput.focus();
  }

  setDateFromYearInput(event) {
    const year = event.currentTarget.value;
    this.#currentDate.setFullYear(year);
    this.updateCalendar({ month: false, year: false, grid: true }); // Year input already updated by user
    this.#yearInput.focus();
  }

  // Keep the original render method for backward compatibility and full re-renders when needed
  render() {
    this.renderInitial();
  }

  // ... (keep all other existing methods unchanged - renderHeader, renderFooter, renderTime, renderBodyGrid, etc.)

  renderHeader(month, year) {
    const navPrev = this.renderNavPrevNext("prev")
    const monthSelect = this.renderMonth(month)
    const yearSelect = this.renderYear(year)
    const navNext = this.renderNavPrevNext("next")

    const header = document.createElement("div")
    header.classList.add("calendar-header")
    header.append(navPrev)
    header.append(monthSelect)
    header.append(yearSelect)
    header.append(navNext)

    return header
  }

  renderFooter(month, year) {
    const eventCount = this.#eventDates.size;
    const priorityCount = this.#priorityEventDates.size;
    const html = `
    <div class="calendar-controls">
    <button class="calendar-button" onclick="this.parentNode.parentNode.parentNode.querySelector('.calendar-grid [data-ts]').click()">Today</button>
    <button class="calendar-button" onclick="this.dispatchEvent(new CustomEvent('clear-events', {bubbles: true}))">Clear Events</button>
    </div>
    <div class="calendar-info">
    <strong>Selected:</strong> ${this.#selectedDate ? this.formatDate(this.#selectedDate) : 'None'}<br>
    <strong>Events:</strong> ${eventCount} dates${priorityCount > 0 ? ` (${priorityCount} priority)` : ''}<br>
    <strong>Theme:</strong> ${this.#options.theme}
    </div>
    `
    const footer = htmlToElement(`<div class="calendar-footer">${html}</div>`)
    
    footer.addEventListener('clear-events', () => {
      this.clearEventDates();
    });
    
    const todayButton = footer.querySelector('.calendar-button');
    todayButton.onclick = () => {
      this.goToToday();
      const today = new Date();
      const todayElement = this.#grid.querySelector(`[data-ts="${today.setHours(0,0,0,0)}"]`);
      if (todayElement) {
        todayElement.focus();
      }
    };
    
    return footer
  }

  renderNavPrevNext(step) {
    const nav = document.createElement("button")
    nav.classList.add("calendar-nav")
    nav.setAttribute('aria-label', step === 'prev' ? 'Previous month' : 'Next month');

    if (step === "prev") {
      nav.onclick = this.previousMonth.bind(this)
      nav.innerHTML = "&#9664;"
    }
    else if (step === "next") {
      nav.onclick = this.nextMonth.bind(this)
      nav.innerHTML = "&#9654;"
    }

    return nav
  }

  renderYear(year) {
    const html = `<input type="number" class="calendar-year calendar-input" placeholder="YYYY" min="0" max="3000" value="${year}" aria-label="Year">`
    const input = htmlToElement(html)
    input.onchange = this.setDateFromYearInput.bind(this)
    this.#yearInput = numberInput.build(input).container
    return this.#yearInput
  }

  renderMonth(month) {
    const input = this.renderSelect("month", this.#monthNames, month)
    input.onchange = this.setDateFromMonthInput.bind(this)
    input.classList.add("calendar-input")
    input.setAttribute('aria-label', 'Month');
    this.#monthInput = input
    return input
  }

  renderTime() {
    if (!this.#options.showTime) return document.createElement('div');
    
    const hours = this.#currentDate.getHours().toString().padStart(2, '0');
    const minutes = this.#currentDate.getMinutes().toString().padStart(2, '0');
    const html = `
    <div class="calendar-time">
    <input type="time" class="calendar-input calendar-timeinput" value="${hours}:${minutes}" aria-label="Time">
    </div>
    `
    const time = htmlToElement(html)
    const input = time.querySelector(`.calendar-timeinput`)
    input.onchange = this.setDateFromTimeInput.bind(this)
    this.#timeInput = input

    return time
  }

  renderSelect(type, options, selected) {
    const select = document.createElement('select')
    select.classList.add(`calendar-${type}`)

    for (let name of options) {
      let text = name.charAt(0).toUpperCase() + name.slice(1);
      let value = options.indexOf(name)
      let option = new Option(text, value)
      if (value === selected) option.selected = true
      select.appendChild(option);
    }

    return select
  }

  renderDayHeader() {
    let dayNames = ``
    if (this.#options.showWeekNumbers)
      dayNames += `<div class="calendar-day-header">Wk</div>`;
    this.dayNames.forEach(day => {
      dayNames += `<div class="calendar-day-header">${day}</div>`;
    });
    return dayNames
  }

  /**
   * Dates grid rendering with new styling classes
   */
  renderBodyGrid(month, year) {
    let html = `<div class="calendar-grid${this.#options.showWeekNumbers ? ' with-week-numbers' : ''}">`
    html += this.renderDayHeader()
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Adjust starting day based on week start preference
    let startingDayOfWeek = firstDay.getDay();
    if (!this.#options.weekStartsSunday) {
      // Convert Sunday (0) to 7, then subtract 1 to make Monday = 0
      startingDayOfWeek = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;
    }
    
    // Get previous month info for padding
    const prevMonth = new Date(year, month, 0);
    const daysInPrevMonth = prevMonth.getDate();
    
    // Track current position for week number insertion
    let cellCount = 0;
    
    // Previous month's trailing days
    for (let i = startingDayOfWeek; i > 0; i--) {
      const day = daysInPrevMonth - i + 1;
      const date = new Date(year, month - 1, day);
      
      // Insert week number at the beginning of each week
      if (this.#options.showWeekNumbers && cellCount % 7 === 0) {
        const weekNumber = this.getWeekNumber(date);
        html += `<div class="calendar-week">${weekNumber}</div>`;
      }
      
      const classes = this.getDayClasses(date, true);
      const attributes = this.getDayAttributes(date);
      
      html += `<div class="${classes.join(' ')}" ${attributes} data-date="${day}" data-ts="${date.getTime()}">${day}</div>`;
      cellCount++;
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      
      // Insert week number at the beginning of each week
      if (this.#options.showWeekNumbers && cellCount % 7 === 0) {
        const weekNumber = this.getWeekNumber(date);
        html += `<div class="calendar-week">${weekNumber}</div>`;
      }
      
      const classes = this.getDayClasses(date, false);
      const attributes = this.getDayAttributes(date);
      
      html += `<div class="${classes.join(' ')}" ${attributes} data-date="${day}" data-ts="${date.getTime()}">${day}</div>`;
      cellCount++;
    }
    
    // Next month's leading days
    const remainingCells = 42 - (startingDayOfWeek + daysInMonth);
    
    for (let day = 1; day <= remainingCells; day++) {
      const date = new Date(year, month + 1, day);
      
      // Insert week number at the beginning of each week
      if (this.#options.showWeekNumbers && cellCount % 7 === 0) {
        const weekNumber = this.getWeekNumber(date);
        html += `<div class="calendar-week">${weekNumber}</div>`;
      }
      
      const classes = this.getDayClasses(date, true);
      const attributes = this.getDayAttributes(date);
      
      html += `<div class="${classes.join(' ')}" ${attributes} data-date="${day}" data-ts="${date.getTime()}">${day}</div>`;
      cellCount++;
    }
    
    html += `</div>`
    const grid = htmlToElement(html)
    const days = grid.querySelectorAll(`.calendar-day`)
    
    days.forEach((day) => {
      day.onclick = this.onDayClick.bind(this)
      day.onkeydown = this.onKeyDown.bind(this)
      day.setAttribute('tabindex', '0');
      day.setAttribute('role', 'gridcell');
    })
    
    grid.setAttribute('role', 'grid');
    grid.setAttribute('aria-label', `Calendar for ${this.#monthNames[month]} ${year}`);
    
    return grid
  }

 /**
 * Initial render - creates the complete calendar structure
 */
  renderInitial() {
    const year = this.#currentDate.getFullYear();
    const month = this.#currentDate.getMonth();
    
    // Create main calendar container
    this.#calendarContainer = document.createElement("div");
    this.#calendarContainer.classList.add("calendar-container");
    if (this.#options.showWeekNumbers)
      this.#calendarContainer.classList.add("show-week-numbers");

    // Create and append all sections
    this.#header = this.renderHeader(month, year);
    this.#grid = this.renderBodyGrid(month, year);
    this.#footer = this.#options.showControls ? this.renderFooter(month, year) : null;
    this.#timeContainer = this.renderTime();

    this.#calendarContainer.appendChild(this.#header);
    this.#calendarContainer.appendChild(this.#grid);
    if (this.#footer) this.#calendarContainer.appendChild(this.#footer);
    this.#calendarContainer.appendChild(this.#timeContainer);

    this.#container.innerHTML = "";
    this.#container.appendChild(this.#calendarContainer);
  }

  /**
   * Update only the month input value
   */
  updateMonthInput() {
    if (this.#monthInput) {
      this.#monthInput.value = this.#currentDate.getMonth();
    }
  }

  /**
   * Update only the year input value
   */
  updateYearInput() {
    if (this.#yearInput) {
      const input = this.#yearInput.querySelector('input') || this.#yearInput;
      input.value = this.#currentDate.getFullYear();
    }
  }

  /**
   * Update only the time input value
   */
  updateTimeInput() {
    if (this.#timeInput) {
      const hours = this.#currentDate.getHours().toString().padStart(2, '0');
      const minutes = this.#currentDate.getMinutes().toString().padStart(2, '0');
      this.#timeInput.value = `${hours}:${minutes}`;
    }
  }

  /**
   * Update only the calendar grid (body)
   */
  updateBodyGrid() {
    const month = this.#currentDate.getMonth();
    const year = this.#currentDate.getFullYear();
    
    const newGrid = this.renderBodyGrid(month, year);
    this.#grid.replaceWith(newGrid);
    this.#grid = newGrid;
  }

  /**
   * Selective update method - only updates what's necessary
   */
  updateCalendar(changes = { month: false, year: false, time: false, grid: true }) {
    if (changes.month) {
      this.updateMonthInput();
    }
    
    if (changes.year) {
      this.updateYearInput();
    }
    
    if (changes.time) {
      this.updateTimeInput();
    }
    
    if (changes.grid) {
      this.updateBodyGrid();
    }
  }

  // Keep all utility methods unchanged
  getWeekNumber(day) {
    const date = new Date(day.getTime());
    const first = (this.#options.weekStartsSunday) ? "Sunday" : "Monday"
    if (first === 'Monday') {
      const thursday = new Date(date.getTime());
      thursday.setDate(date.getDate() - ((date.getDay() + 6) % 7) + 3);
      const yearStart = new Date(thursday.getFullYear(), 0, 1);
      const weekNumber = Math.ceil((((thursday - yearStart) / 86400000) + 1) / 7);
      return weekNumber;
    } else {
      const yearStart = new Date(date.getFullYear(), 0, 1);
      const firstSunday = new Date(yearStart.getTime());
      const daysToFirstSunday = (7 - yearStart.getDay()) % 7;
      firstSunday.setDate(yearStart.getDate() + daysToFirstSunday);
      if (date < firstSunday) {
        return 1;
      }
      const daysSinceFirstSunday = Math.floor((date - firstSunday) / (24 * 60 * 60 * 1000));
      const weekNumber = Math.floor(daysSinceFirstSunday / 7) + 2;
      return weekNumber;
    }
  }

  hasEvents(date) {
    const timestamp = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    ).getTime();
    return this.#eventDates.has(timestamp);
  }

  getEventMetadata(date) {
    const timestamp = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    ).getTime();
    return this.#eventDates.get(timestamp) || null;
  }

  hasPriorityEvents(date) {
    const timestamp = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    ).getTime();
    return this.#priorityEventDates.has(timestamp);
  }

  isWeekend(date) {
    const day = date.getDay();
    return day === 0 || day === 6;
  }

  isToday(date) {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }

  isSelected(date) {
    if (!this.#selectedDate) return false;
    return date.getDate() === this.#selectedDate.getDate() &&
    date.getMonth() === this.#selectedDate.getMonth() &&
    date.getFullYear() === this.#selectedDate.getFullYear();
  }

  onDayClick(event) {
    const date = event.currentTarget.dataset.ts * 1
    if (!this.#options.allowPastDates && date < new Date().setHours(0,0,0,0)) {
      return;
    }
    const selected = this.#grid.querySelector(".selected")
    if (selected) {
      const ts = selected.getAttribute("data-ts") * 1
      if (ts !== date)
        selected.classList.remove("selected")
    }
    this.setDate(date);
    const newSelected = this.#grid.querySelector(`[data-ts="${date}"]`)
    if (newSelected) {
      newSelected.classList.add("selected")
    }
  }

  onKeyDown(event) {
    const focusedElement = document.activeElement;
    const currentDate = focusedElement.dataset.ts ? new Date(parseInt(focusedElement.dataset.ts)) : null;
    if (!currentDate) return;

    let newDate = new Date(currentDate);
    let preventDefault = true;
    switch(event.key) {
      case 'ArrowLeft':
        newDate.setDate(newDate.getDate() - 1);
        break;
      case 'ArrowRight':
        newDate.setDate(newDate.getDate() + 1);
        break;
      case 'ArrowUp':
        newDate.setDate(newDate.getDate() - 7);
        break;
      case 'ArrowDown':
        newDate.setDate(newDate.getDate() + 7);
        break;
      case 'Home':
        newDate.setDate(1);
        break;
      case 'End':
        newDate = new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0);
        break;
      case 'PageUp':
        if (event.shiftKey) {
          newDate.setFullYear(newDate.getFullYear() - 1);
        } else {
          newDate.setMonth(newDate.getMonth() - 1);
        }
        break;
      case 'PageDown':
        if (event.shiftKey) {
          newDate.setFullYear(newDate.getFullYear() + 1);
        } else {
          newDate.setMonth(newDate.getMonth() + 1);
        }
        break;
      case 'Enter':
      case ' ':
        this.setDate(currentDate);
        break;
      default:
        preventDefault = false;
    }

    if (preventDefault) {
      event.preventDefault();
      if (event.key !== 'Enter' && event.key !== ' ') {
        const newTimestamp = newDate.getTime();
        const newElement = this.#grid.querySelector(`[data-ts="${newTimestamp}"]`);
        if (newElement) {
          newElement.focus();
        } else {
          this.#currentDate = new Date(newDate.getFullYear(), newDate.getMonth(), 1);
          this.updateCalendar({ month: true, year: true, grid: true });
          setTimeout(() => {
            const targetElement = this.#grid.querySelector(`[data-ts="${newTimestamp}"]`);
            if (targetElement) {
              targetElement.focus();
            }
          }, 0);
        }
      }
    }
  }

  getDayClasses(date, isOtherMonth = false) {
    const classes = ['calendar-day'];
    const eventData = this.getEventMetadata(date);

    if (isOtherMonth) {
      classes.push('other-month');
    }
    if (this.isToday(date)) {
      classes.push('today');
    }
    if (this.isSelected(date)) {
      classes.push('selected');
    }
    if (this.isWeekend(date)) {
      classes.push('weekend');
    }
    if (this.hasEvents(date)) {
      classes.push('has-events');
    }
    if (this.hasPriorityEvents(date)) {
      classes.push('priority-event');
    }
    if (!this.#options.allowPastDates && date < new Date().setHours(0,0,0,0)) {
      classes.push('disabled');
    }
    if (eventData && eventData.cssClass) {
      classes.push(eventData.cssClass);
    }
    
    return classes;
  }

  getDayAttributes(date) {
    const attributes = [];
    const eventData = this.getEventMetadata(date);
    
    if (eventData && eventData.title) {
      attributes.push(`title="${eventData.title}"`);
    }
    if (eventData && eventData.ariaLabel) {
      attributes.push(`aria-label="${eventData.ariaLabel}"`);
    }
    
    return attributes.join(' ');
  }

  // Event handling methods
  setDateFromYearInput(event) {
    const year = parseInt(event.target.value);
    if (year && year >= 0 && year <= 3000) {
      this.#currentDate.setFullYear(year);
      this.updateCalendar({ grid: true });
    }
  }

  setDateFromMonthInput(event) {
    const month = parseInt(event.target.value);
    this.#currentDate.setMonth(month);
    this.updateCalendar({ grid: true });
  }

  setDateFromTimeInput(event) {
    const [hours, minutes] = event.target.value.split(':').map(Number);
    this.#currentDate.setHours(hours, minutes);
    this.dispatchEvent('datechange', {
      date: new Date(this.#currentDate),
      timestamp: this.#currentDate.getTime()
    });
  }

  // Navigation methods
  previousMonth() {
    this.#currentDate.setMonth(this.#currentDate.getMonth() - 1);
    this.updateCalendar({ month: true, year: true, grid: true });
  }

  nextMonth() {
    this.#currentDate.setMonth(this.#currentDate.getMonth() + 1);
    this.updateCalendar({ month: true, year: true, grid: true });
  }

  goToToday() {
    this.#currentDate = new Date();
    this.updateCalendar({ month: true, year: true, grid: true, footer: true });
  }

  // Public API methods
  setDate(date) {
    if (date instanceof Date) {
      this.#currentDate = new Date(date);
      this.#selectedDate = new Date(date);
    } else if (typeof date === 'number') {
      this.#currentDate = new Date(date);
      this.#selectedDate = new Date(date);
    }
    
    this.updateCalendar({ month: true, year: true, grid: true, footer: true, time: true });
    this.dispatchEvent('datechange', {
      date: new Date(this.#selectedDate),
      timestamp: this.#selectedDate.getTime()
    });
  }

  getDate() {
    return this.#selectedDate ? new Date(this.#selectedDate) : null;
  }

  addEventDate(date, metadata = {}) {
    const timestamp = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    ).getTime();
    
    this.#eventDates.set(timestamp, metadata);
    
    if (metadata.priority) {
      this.#priorityEventDates.add(timestamp);
    }
    
    this.updateCalendar({ grid: true, footer: true });
  }

  removeEventDate(date) {
    const timestamp = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    ).getTime();
    
    this.#eventDates.delete(timestamp);
    this.#priorityEventDates.delete(timestamp);
    
    this.updateCalendar({ grid: true, footer: true });
  }

  clearEventDates() {
    this.#eventDates.clear();
    this.#priorityEventDates.clear();
    this.updateCalendar({ grid: true, footer: true });
  }

  getEventDates() {
    return Array.from(this.#eventDates.entries()).map(([timestamp, metadata]) => ({
      date: new Date(timestamp),
      metadata
    }));
  }

  setOptions(options) {
    this.#options = { ...this.#options, ...options };
    this.updateCalendar({ month: true, year: true, grid: true, footer: true, time: true });
  }

  getOptions() {
    return { ...this.#options };
  }

  // Utility methods
  formatDate(date, format = 'YYYY-MM-DD') {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    return format
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day);
  }

  dispatchEvent(eventName, detail = {}) {
    const event = new CustomEvent(eventName, {
      detail,
      bubbles: true,
      cancelable: true
    });
    this.#container.dispatchEvent(event);
  }

  updateCalendar(updates = {}) {
    const { month = false, year = false, grid = false, footer = false, time = false } = updates;
    
    if (month && this.#monthInput) {
      this.#monthInput.value = this.#currentDate.getMonth();
    }
    
    if (year && this.#yearInput) {
      const yearInput = this.#yearInput.querySelector('input');
      if (yearInput) {
        yearInput.value = this.#currentDate.getFullYear();
      }
    }
    
    if (grid) {
      const newGrid = this.renderBodyGrid(
        this.#currentDate.getMonth(),
        this.#currentDate.getFullYear()
      );
      this.#grid.replaceWith(newGrid);
      this.#grid = newGrid;
    }
    
    if (footer) {
      const newFooter = this.renderFooter(
        this.#currentDate.getMonth(),
        this.#currentDate.getFullYear()
      );
      if (this.#footer) {
        this.#footer.replaceWith(newFooter);
      }
      this.#footer = newFooter;
    }
    
    if (time && this.#timeInput) {
      const hours = this.#currentDate.getHours().toString().padStart(2, '0');
      const minutes = this.#currentDate.getMinutes().toString().padStart(2, '0');
      this.#timeInput.value = `${hours}:${minutes}`;
    }
  }

  // Cleanup method
  destroy() {
    if (this.#container && this.#container.parentNode) {
      this.#container.parentNode.removeChild(this.#container);
    }
    
    // Clear all references
    this.#container = null;
    this.#grid = null;
    this.#monthInput = null;
    this.#yearInput = null;
    this.#timeInput = null;
    this.#footer = null;
    this.#eventDates.clear();
    this.#priorityEventDates.clear();
  }
}



