import { htmlToElement, htmlToElements, isHTMLElement } from "./utils/DOM";
import i18n from "./i18n";
import { isArrayOfType, isFunction, isNumber, isString } from "./utils/typeChecks";
import css from "./style";
import languages from "./i18n/languages";

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
  #eventDates = new Map() // Changed to Map to store event metadata
  #priorityEventDates = new Set() // Store high priority events
  #options = {}
  #language = "en"
  #lang
  #monthNames = {}
  #dayNames = {}
  #grid
  #timeInput
  #monthInput
  #yearInput


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
    this.render();

    // inject calendar styles into header only once!
    if (!CaleX.#styleInjected) {
      const style = document.createElement('style');
      style.type = 'text/css';
      style.id = 'plain-calendar-styles';
      style.appendChild(document.createTextNode(css));
      document.head.appendChild(style);
      CaleX.#styleInjected = true;
    }
  }

  /**
   * Set the theme for the calendar
   * @param {string} theme - 'light', 'dark', or 'auto'
   */
  setTheme(theme = 'auto') {
    const validThemes = ['light', 'dark', 'auto'];
    if (!validThemes.includes(theme)) {
      theme = 'auto';
    }

    // Remove existing theme attributes
    document.documentElement.removeAttribute('data-theme');

    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
    // 'auto' uses CSS media queries, so no attribute needed

    this.#options.theme = theme;
  }

  /**
   * Toggle between light and dark themes
   */
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

  /**
   * Set the selected date
   * @param {Date|string|number} date - Date in various formats
   * @returns {boolean} Success status
   */
  setDate(date) {
    const parsedDate = this.parseDate(date);
    if (!parsedDate) {
      console.error('Invalid date format:', date);
      return false;
    }

    this.#selectedDate = parsedDate;
    this.#currentDate = new Date(parsedDate.getFullYear(), parsedDate.getMonth(), 1);

    // Only change view if selected date is in a different month
    if (parsedDate.getMonth() !== this.#currentDate.getMonth() ||
        parsedDate.getFullYear() !== this.#currentDate.getFullYear()) {
      this.render()
    }

    if (this.#options.onDateSelect) {
      this.#options.onDateSelect(parsedDate);
    }

    return true;
  }

  /**
   * Add event dates with enhanced metadata support
   * @param {Array|Date|string|number} dates - Single date or array of dates
   * @param {Object} options - Event options (priority, count, etc.)
   */
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

    this.render();
  }

  /**
   * Clear all event dates
   */
  clearEventDates() {
    this.#eventDates.clear();
    this.#priorityEventDates.clear();
    this.render();
  }

  /**
   * Navigate to previous month
   */
  previousMonth() {
    this.#currentDate.setMonth(this.#currentDate.getMonth() - 1);
    this.render();

    if (this.#options.onMonthChange) {
      this.#options.onMonthChange(new Date(this.#currentDate));
    }
  }

  /**
   * Navigate to next month
   */
  nextMonth() {
    this.#currentDate.setMonth(this.#currentDate.getMonth() + 1);
    this.render();

    if (this.#options.onMonthChange) {
      this.#options.onMonthChange(new Date(this.#currentDate));
    }
  }

  /**
   * Go to today's date
   */
  goToToday() {
    this.#currentDate = new Date();
    this.render();
  }

  /**
   * Get the currently selected date
   * @returns {Date|null} Selected date
   */
  getSelectedDate() {
    return this.#selectedDate ? new Date(this.#selectedDate) : null;
  }

  /**
   * Calculate the week number for a given date
   * @param {Date} day - The date to calculate the week number for
   * @returns {number} The week number (1-53)
   */
  getWeekNumber(day) {
    // Create a copy of the date to avoid modifying the original
    const date = new Date(day.getTime());
    const first = (this.#options.weekStartsSunday) ? "Sunday" : "Monday"

    if (first === 'Monday') {
      // ISO 8601 week numbering (Monday-based)
      const thursday = new Date(date.getTime());
      thursday.setDate(date.getDate() - ((date.getDay() + 6) % 7) + 3);

      const yearStart = new Date(thursday.getFullYear(), 0, 1);
      const weekNumber = Math.ceil((((thursday - yearStart) / 86400000) + 1) / 7);

      return weekNumber;
    } else {
      // Sunday-based week numbering
      const yearStart = new Date(date.getFullYear(), 0, 1);
      const firstSunday = new Date(yearStart.getTime());

      // Find the first Sunday of the year
      const daysToFirstSunday = (7 - yearStart.getDay()) % 7;
      firstSunday.setDate(yearStart.getDate() + daysToFirstSunday);

      // If the date is before the first Sunday, it's week 1
      if (date < firstSunday) {
        return 1;
      }

      // Calculate week number from first Sunday
      const daysSinceFirstSunday = Math.floor((date - firstSunday) / (24 * 60 * 60 * 1000));
      const weekNumber = Math.floor(daysSinceFirstSunday / 7) + 2;

      return weekNumber;
    }
  }

  /**
   * Check if a date has events
   * @param {Date} date - Date to check
   * @returns {boolean} Whether the date has events
   */
  hasEvents(date) {
    const timestamp = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    ).getTime();
    return this.#eventDates.has(timestamp);
  }

  /**
   * Get event metadata for a date
   * @param {Date} date - Date to check
   * @returns {Object|null} Event metadata or null
   */
  getEventMetadata(date) {
    const timestamp = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    ).getTime();
    return this.#eventDates.get(timestamp) || null;
  }

  /**
   * Check if a date has priority events
   * @param {Date} date - Date to check
   * @returns {boolean} Whether the date has priority events
   */
  hasPriorityEvents(date) {
    const timestamp = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    ).getTime();
    return this.#priorityEventDates.has(timestamp);
  }

  /**
   * Check if a date is a weekend
   * @param {Date} date - Date to check
   * @returns {boolean} Whether the date is a weekend
   */
  isWeekend(date) {
    const day = date.getDay();
    return day === 0 || day === 6; // Sunday or Saturday
  }

  /**
   * Check if a date is today
   * @param {Date} date - Date to check
   * @returns {boolean} Whether the date is today
   */
  isToday(date) {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }

  /**
   * Check if a date is selected
   * @param {Date} date - Date to check
   * @returns {boolean} Whether the date is selected
   */
  isSelected(date) {
      if (!this.#selectedDate) return false;
      return date.getDate() === this.#selectedDate.getDate() &&
      date.getMonth() === this.#selectedDate.getMonth() &&
      date.getFullYear() === this.#selectedDate.getFullYear();
  }

  /**
   * Handle day click with enhanced event handling
   * @param {Event} event - Click event
   */
  onDayClick(event) {
      const date = event.currentTarget.dataset.ts * 1
      if (!this.#options.allowPastDates && date < new Date().setHours(0,0,0,0)) {
          return; // Don't allow past dates if option is set
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

          // Add accessibility announcement
          // this.announceSelection(new Date(date));
      }
  }

  /**
   * Announce selection for screen readers
   * @param {Date} date - Selected date
   */
  announceSelection(date) {
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';

      let message = `Selected ${this.formatDate(date)}`;
      if (this.isToday(date)) message += ', today';
      if (this.hasEvents(date)) {
          const eventData = this.getEventMetadata(date);
          if (eventData && eventData.count > 1) {
              message += `, ${eventData.count} events`;
          } else {
              message += ', has events';
          }
      }

      announcement.textContent = message;
      this.#container.appendChild(announcement);

      // Remove after announcement
      setTimeout(() => {
          if (announcement.parentNode) {
              announcement.parentNode.removeChild(announcement);
          }
      }, 1000);
  }

  /**
   * Enhanced keyboard navigation
   * @param {KeyboardEvent} event - Keyboard event
   */
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

          // Focus new date if navigation occurred
          if (event.key !== 'Enter' && event.key !== ' ') {
              const newTimestamp = newDate.getTime();
              const newElement = this.#grid.querySelector(`[data-ts="${newTimestamp}"]`);
              if (newElement) {
                  newElement.focus();
              } else {
                  // Date is in different month, navigate there
                  this.#currentDate = new Date(newDate.getFullYear(), newDate.getMonth(), 1);
                  this.render();
                  // Focus the date after render
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

  /**
   * Render the calendar with enhanced styling support
   */
  render() {
      const year = this.#currentDate.getFullYear();
      const month = this.#currentDate.getMonth();

      const hoursMinutes = this.renderTime()
      const header = this.renderHeader(month, year)
      const bodyGrid = this.renderBodyGrid(month, year)
      const footer = this.renderFooter(month, year)
      const themeToggle = this.renderThemeToggle()

      const calendar = document.createElement("div")
      calendar.classList.add("calendar-container")
      if (this.#options.showWeekNumbers)
        calendar.classList.add("show-week-numbers")

      calendar.appendChild(header)
      calendar.append(bodyGrid)

      if (this.#options.showControls)
          calendar.appendChild(footer)

          calendar.append(hoursMinutes)

          this.#container.innerHTML = ""
          this.#container.appendChild(calendar)
          // this.#container.appendChild(themeToggle)
  }

  /**
   * Render theme toggle button
   */
  renderThemeToggle() {
      const button = document.createElement('button');
      button.className = 'theme-toggle';
      button.setAttribute('aria-label', 'Toggle theme');

      const getThemeText = () => {
          switch (this.#options.theme) {
              case 'light': return '☀️ Light';
              case 'dark': return '🌙 Dark';
              default: return '🔄 Auto';
          }
      };

      button.textContent = getThemeText();
      button.onclick = () => {
          this.toggleTheme();
          button.textContent = getThemeText();
      };

      return button;
  }

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

      // Add event listeners
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
      this.#yearInput = input
      return input
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
   * Enhanced body grid rendering with new styling classes
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
      const day = daysInPrevMonth - i + 1;  // FIX: Correct calculation
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
      
      // Make days focusable for keyboard navigation
      day.setAttribute('tabindex', '0');
      day.setAttribute('role', 'gridcell');
    })
    
    // Set up grid keyboard navigation
    grid.setAttribute('role', 'grid');
    grid.setAttribute('aria-label', `Calendar for ${this.#monthNames[month]} ${year}`);
    
    this.#grid = grid
    return grid
  }
  

  /**
   * Get CSS classes for a day element with enhanced styling
   * @param {Date} date - The date
   * @param {boolean} isOtherMonth - Whether the date is from another month
   * @returns {Array<string>} Array of CSS classes
   */
  getDayClasses(date, isOtherMonth = false) {
      const classes = ['calendar-day'];
      const eventData = this.getEventMetadata(date);

      // Basic state classes
      if (isOtherMonth) {
          classes.push('other-month');
      }

      if (this.isToday(date)) {
          classes.push('today');
      }

      if (this.isSelected(date)) {
          classes.push('selected');
      }

      // Event-related classes
      if (this.hasEvents(date)) {
          classes.push('has-events');

          if (eventData) {
              // Priority events
              if (eventData.priority) {
                  classes.push('has-priority-events');
              }

              // Multiple events
              if (eventData.count > 1) {
                  classes.push('has-multiple-events');
              }
          }

          // Special handling for other month events
          if (isOtherMonth && !this.#options.showOtherMonthEvents) {
              // Remove has-events class if we don't want to show other month events
              const eventIndex = classes.indexOf('has-events');
              if (eventIndex > -1) {
                  classes.splice(eventIndex, 1);
              }
          }
      }

      // Weekend styling
      if (this.#options.weekendStyling && this.isWeekend(date)) {
          classes.push('weekend');
      }

      // Disabled dates (past dates if not allowed)
      if (!this.#options.allowPastDates && date < new Date().setHours(0,0,0,0)) {
          classes.push('disabled');
      }

      return classes;
  }

  /**
   * Get HTML attributes for a day element
   * @param {Date} date - The date
   * @returns {string} HTML attributes string
   */
  getDayAttributes(date) {
      const attributes = [];
      const eventData = this.getEventMetadata(date);

      // Accessibility attributes
      let ariaLabel = `${date.getDate()}`;

      if (this.isToday(date)) {
          ariaLabel += ', today';
      }

      if (this.isSelected(date)) {
          ariaLabel += ', selected';
          attributes.push('aria-selected="true"');
      }

      if (this.hasEvents(date)) {
          if (eventData && eventData.count > 1) {
              ariaLabel += `, ${eventData.count} events`;
              attributes.push(`data-event-count="${eventData.count}"`);
          } else {
              ariaLabel += ', has events';
          }

          if (eventData && eventData.priority) {
              ariaLabel += ', priority';
          }
      }

      if (this.isWeekend(date)) {
          ariaLabel += ', weekend';
      }

      attributes.push(`aria-label="${ariaLabel}"`);

      // Data attributes for styling
      if (eventData) {
          if (eventData.count > 1) {
              attributes.push(`data-event-count="${eventData.count}"`);
          }

          if (eventData.metadata && Object.keys(eventData.metadata).length > 0) {
              attributes.push(`data-event-metadata='${JSON.stringify(eventData.metadata)}'`);
          }
      }

      return attributes.join(' ');
  }

  setDateFromTimeInput(event){
      const time = event.currentTarget.value
      const [hours, minutes] = time.split(":")
      this.#currentDate.setHours(hours, minutes)
      this.render()
      this.#timeInput.focus()
  }

  setDateFromMonthInput(event) {
      const month = event.currentTarget.value
      this.#currentDate.setMonth(month)
      this.render()
      this.#monthInput.focus()
  }

  setDateFromYearInput(event) {
      const year = event.currentTarget.value
      this.#currentDate.setFullYear(year)
      this.render()
      this.#yearInput.focus()
  }

  /**
   * Format date for display with localization support
   * @param {Date} date - Date to format
   * @returns {string} Formatted date string
   */
  formatDate(date) {
      if (!date) return '';

      try {
          // Use the calendar's language for formatting
          const locale = this.#language === 'en' ? 'en-GB' : this.#language;
          return date.toLocaleDateString(locale, {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
          });
      } catch (error) {
          // Fallback to default formatting
          return date.toLocaleDateString('en-GB', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
          });
      }
  }

  /**
   * Get all event dates with metadata
   * @returns {Array<Object>} Array of event objects with date and metadata
   */
  getEventDates() {
      return Array.from(this.#eventDates.entries()).map(([timestamp, metadata]) => ({
          date: new Date(timestamp),
          ...metadata
      }));
  }

  /**
   * Remove specific event dates
   * @param {Array|Date|string|number} dates - Dates to remove
   */
  removeEventDates(dates) {
      const dateArray = Array.isArray(dates) ? dates : [dates];

      dateArray.forEach(date => {
          const parsedDate = this.parseDate(date);
          if (parsedDate) {
              const timestamp = new Date(
                  parsedDate.getFullYear(),
                  parsedDate.getMonth(),
                  parsedDate.getDate()
              ).getTime();

              this.#eventDates.delete(timestamp);
              this.#priorityEventDates.delete(timestamp);
          }
      });

      this.render();
  }

  /**
   * Add priority event dates
   * @param {Array|Date|string|number} dates - Dates to mark as priority
   * @param {Object} options - Additional options
   */
  addPriorityEventDates(dates, options = {}) {
      this.addEventDates(dates, { ...options, priority: true });
  }

  /**
   * Get dates in a range
   * @param {Date|string|number} startDate - Start date
   * @param {Date|string|number} endDate - End date
   * @returns {Array<Date>} Array of dates in range
   */
  getDatesInRange(startDate, endDate) {
      const start = this.parseDate(startDate);
      const end = this.parseDate(endDate);

      if (!start || !end) return [];

      const dates = [];
      const currentDate = new Date(start);

      while (currentDate <= end) {
          dates.push(new Date(currentDate));
          currentDate.setDate(currentDate.getDate() + 1);
      }

      return dates;
  }

  /**
   * Highlight dates in a range
   * @param {Date|string|number} startDate - Start date
   * @param {Date|string|number} endDate - End date
   * @param {Object} options - Event options
   */
  highlightRange(startDate, endDate, options = {}) {
      const datesInRange = this.getDatesInRange(startDate, endDate);
      this.addEventDates(datesInRange, options);
  }

  /**
   * Navigate to specific month/year
   * @param {number} year - Year
   * @param {number} month - Month (0-11)
   */
  goToMonth(year, month) {
      this.#currentDate = new Date(year, month, 1);
      this.render();

      if (this.#options.onMonthChange) {
          this.#options.onMonthChange(new Date(this.#currentDate));
      }
  }

  /**
   * Get current viewing month/year
   * @returns {Object} Object with year and month
   */
  getCurrentView() {
      return {
          year: this.#currentDate.getFullYear(),
          month: this.#currentDate.getMonth(),
          monthName: this.monthNames[this.#currentDate.getMonth()]
      };
  }

  /**
   * Export calendar data
   * @returns {Object} Calendar state and data
   */
  exportData() {
      return {
          currentDate: this.#currentDate.toISOString(),
          selectedDate: this.#selectedDate ? this.#selectedDate.toISOString() : null,
          eventDates: Array.from(this.#eventDates.entries()).map(([timestamp, metadata]) => ({
              date: new Date(timestamp).toISOString(),
                                                                                             ...metadata
          })),
          options: { ...this.#options },
          language: this.#language,
          theme: this.#options.theme
      };
  }

  /**
   * Import calendar data
   * @param {Object} data - Calendar data to import
   */
  importData(data) {
      try {
          if (data.currentDate) {
              this.#currentDate = new Date(data.currentDate);
          }

          if (data.selectedDate) {
              this.#selectedDate = new Date(data.selectedDate);
          }

          if (data.eventDates && Array.isArray(data.eventDates)) {
              this.#eventDates.clear();
              this.#priorityEventDates.clear();

              data.eventDates.forEach(eventData => {
                  const date = new Date(eventData.date);
                  const timestamp = new Date(
                      date.getFullYear(),
                                             date.getMonth(),
                                             date.getDate()
                  ).getTime();

                  const { date: _, ...metadata } = eventData;
                  this.#eventDates.set(timestamp, metadata);

                  if (metadata.priority) {
                      this.#priorityEventDates.add(timestamp);
                  }
              });
          }

          if (data.language) {
              this.setLanguage(data.language);
          }

          if (data.theme) {
              this.setTheme(data.theme);
          }

          this.render();
          return true;
      } catch (error) {
          console.error('Error importing calendar data:', error);
          return false;
      }
  }

  /**
   * Get calendar statistics
   * @returns {Object} Statistics about the calendar
   */
  getStatistics() {
      const eventDates = Array.from(this.#eventDates.entries());
      const totalEvents = eventDates.reduce((sum, [, metadata]) => sum + metadata.count, 0);
      const priorityEvents = eventDates.filter(([, metadata]) => metadata.priority).length;

      return {
          totalEventDates: this.#eventDates.size,
          totalEvents: totalEvents,
          priorityEventDates: priorityEvents,
          selectedDate: this.#selectedDate ? this.formatDate(this.#selectedDate) : null,
          currentView: this.getCurrentView(),
          theme: this.#options.theme,
          language: this.#language
      };
  }

  /**
   * Search for events by metadata
   * @param {Function|Object} criteria - Search criteria
   * @returns {Array<Object>} Matching events
   */
  searchEvents(criteria) {
      const results = [];

      for (const [timestamp, metadata] of this.#eventDates.entries()) {
          const date = new Date(timestamp);
          const eventData = { date, ...metadata };

          let matches = false;

          if (typeof criteria === 'function') {
              matches = criteria(eventData);
          } else if (typeof criteria === 'object') {
              matches = Object.entries(criteria).every(([key, value]) => {
                  if (key === 'date') {
                      return this.parseDate(value)?.getTime() === timestamp;
                  }
                  return metadata[key] === value;
              });
          }

          if (matches) {
              results.push(eventData);
          }
      }

      return results;
  }

  /**
   * Batch update events
   * @param {Array<Object>} updates - Array of update operations
   */
  batchUpdateEvents(updates) {
      updates.forEach(update => {
          const { action, dates, options = {} } = update;

          switch (action) {
              case 'add':
                  this.addEventDates(dates, options);
                  break;
              case 'remove':
                  this.removeEventDates(dates);
                  break;
              case 'addPriority':
                  this.addPriorityEventDates(dates, options);
                  break;
              case 'highlightRange':
                  if (dates.length >= 2) {
                      this.highlightRange(dates[0], dates[1], options);
                  }
                  break;
          }
      });

      // Only render once after all updates
      this.render();
  }

  /**
   * Add event listener for calendar events
   * @param {string} eventType - Event type
   * @param {Function} callback - Callback function
   */
  addEventListener(eventType, callback) {
      if (!this.#eventListeners) {
          this.#eventListeners = new Map();
      }

      if (!this.#eventListeners.has(eventType)) {
          this.#eventListeners.set(eventType, new Set());
      }

      this.#eventListeners.get(eventType).add(callback);
  }

  /**
   * Remove event listener
   * @param {string} eventType - Event type
   * @param {Function} callback - Callback function
   */
  removeEventListener(eventType, callback) {
      if (this.#eventListeners && this.#eventListeners.has(eventType)) {
          this.#eventListeners.get(eventType).delete(callback);
      }
  }

  /**
   * Emit custom event
   * @param {string} eventType - Event type
   * @param {Object} data - Event data
   */
  #emitEvent(eventType, data = {}) {
    if (this.#eventListeners && this.#eventListeners.has(eventType)) {
        this.#eventListeners.get(eventType).forEach(callback => {
            try {
                callback({ type: eventType, ...data });
            } catch (error) {
                console.error(`Error in event listener for ${eventType}:`, error);
            }
        });
    }
  }

  /**
   * Enhanced setDate with event emission
   * @param {Date|string|number} date - Date in various formats
   * @returns {boolean} Success status
   */
  setDate(date) {
      const parsedDate = this.parseDate(date);
      if (!parsedDate) {
          console.error('Invalid date format:', date);
          return false;
      }

      const previousDate = this.#selectedDate;
      this.#selectedDate = parsedDate;
      this.#currentDate = new Date(parsedDate.getFullYear(), parsedDate.getMonth(), 1);

      // Only change view if selected date is in a different month
      if (parsedDate.getMonth() !== this.#currentDate.getMonth() ||
          parsedDate.getFullYear() !== this.#currentDate.getFullYear()) {
          this.render()
          }

          // Emit custom event
          this.#emitEvent('dateSelect', {
              selectedDate: parsedDate,
              previousDate: previousDate
          });

      if (this.#options.onDateSelect) {
          this.#options.onDateSelect(parsedDate);
      }

      return true;
  }

  /**
   * Enhanced month navigation with event emission
   */
  previousMonth() {
      const previousMonth = new Date(this.#currentDate);
      this.#currentDate.setMonth(this.#currentDate.getMonth() - 1);
      this.render();

      this.#emitEvent('monthChange', {
          currentMonth: new Date(this.#currentDate),
                      previousMonth: previousMonth,
                      direction: 'previous'
      });

      if (this.#options.onMonthChange) {
          this.#options.onMonthChange(new Date(this.#currentDate));
      }
  }

  nextMonth() {
      const previousMonth = new Date(this.#currentDate);
      this.#currentDate.setMonth(this.#currentDate.getMonth() + 1);
      this.render();

      this.#emitEvent('monthChange', {
          currentMonth: new Date(this.#currentDate),
                      previousMonth: previousMonth,
                      direction: 'next'
      });

      if (this.#options.onMonthChange) {
          this.#options.onMonthChange(new Date(this.#currentDate));
      }
  }

  /**
   * Add event dates to the calendar with optional metadata and styling
   * 
   * @description This method adds one or more dates as event dates to the calendar.
   * Event dates are visually highlighted and can include additional metadata.
   * If a date already has events, the counts and metadata are merged intelligently.
   * 
   * @param {Date|string|number|Array<Date|string|number>} dates - Date(s) to add as events.
   *   Can be a single date or an array of dates in various formats:
   *   - Date object: new Date('2024-01-15')
   *   - ISO string: '2024-01-15' or '2024-01-15T10:30:00Z'
   *   - Timestamp: 1705276800000
   *   - Date string: 'January 15, 2024'
   * 
   * @param {Object} [options={}] - Configuration options for the events
   * @param {boolean} [options.priority=false] - Mark events as high priority for special styling
   * @param {number} [options.count=1] - Number of events on this date (for display purposes)
   * @param {Object} [options.metadata={}] - Custom metadata to associate with the events.
   *   Can include any key-value pairs for application-specific data:
   *   - title: Event title
   *   - description: Event description
   *   - category: Event category
   *   - color: Custom color
   *   - url: Associated URL
   *   - attendees: Number of attendees
   *   - etc.
   * 
   * @returns {void}
   * 
   * @fires CaleX#eventsAdded - Emitted after events are successfully added
   */
  addEventDates(dates, options = {}) {
      const dateArray = Array.isArray(dates) ? dates : [dates];
      const { priority = false, count = 1, metadata = {} } = options;
      const addedEvents = [];

      dateArray.forEach(date => {
          const parsedDate = this.parseDate(date);
          if (parsedDate) {
              const timestamp = new Date(
                  parsedDate.getFullYear(),
                                         parsedDate.getMonth(),
                                         parsedDate.getDate()
              ).getTime();

              const existingEvent = this.#eventDates.get(timestamp) || { count: 0, priority: false, metadata: {} };
              const newEvent = {
                  count: Math.max(existingEvent.count, count),
                        priority: existingEvent.priority || priority,
                        metadata: { ...existingEvent.metadata, ...metadata }
              };

              this.#eventDates.set(timestamp, newEvent);

              if (priority) {
                  this.#priorityEventDates.add(timestamp);
              }

              addedEvents.push({
                  date: parsedDate,
                  ...newEvent
              });
          }
      });

      this.#emitEvent('eventsAdded', {
          events: addedEvents,
          totalEvents: this.#eventDates.size
      });

      this.render();
  }

  /**
   * Clear events with emission
   */
  clearEventDates() {
      const clearedCount = this.#eventDates.size;
      this.#eventDates.clear();
      this.#priorityEventDates.clear();

      this.#emitEvent('eventsCleared', {
          clearedCount: clearedCount
      });

      this.render();
  }

  /**
   * Enhanced theme management
   * @param {string} [theme='auto'] 
   */
  setTheme(theme = 'auto') {
      const validThemes = ['light', 'dark', 'auto'];
      if (!validThemes.includes(theme)) {
          theme = 'auto';
      }

      const previousTheme = this.#options.theme;

      // Remove existing theme attributes
      this.#container.removeAttribute('data-theme');
      document.documentElement.removeAttribute('data-calendar-theme');

      if (theme === 'light') {
          this.#container.setAttribute('data-theme', 'light');
          document.documentElement.setAttribute('data-calendar-theme', 'light');
      } else if (theme === 'dark') {
          this.#container.setAttribute('data-theme', 'dark');
          document.documentElement.setAttribute('data-calendar-theme', 'dark');
      }

      this.#options.theme = theme;

      this.#emitEvent('themeChange', {
          currentTheme: theme,
          previousTheme: previousTheme
      });
  }

  /**
   * Get accessibility information for screen readers
   * @returns {Object} Accessibility information
   */
  getAccessibilityInfo() {
      const currentView = this.getCurrentView();
      const stats = this.getStatistics();

      return {
          currentMonth: `${currentView.monthName} ${currentView.year}`,
          selectedDate: stats.selectedDate || 'No date selected',
          eventSummary: `${stats.totalEventDates} dates with events, ${stats.totalEvents} total events`,
          priorityEvents: stats.priorityEventDates > 0 ? `${stats.priorityEventDates} priority events` : 'No priority events',
          navigation: 'Use arrow keys to navigate, Enter or Space to select',
          theme: `Current theme: ${stats.theme}`
      };
  }

  /**
   * Validate calendar configuration
   * @returns {Object} Validation results
   */
  validateConfiguration() {
      const issues = [];
      const warnings = [];

      // Check container
      if (!this.#container || !this.#container.parentNode) {
          issues.push('Calendar container is not attached to DOM');
      }

      // Check dates
      if (this.#selectedDate && isNaN(this.#selectedDate.getTime())) {
          issues.push('Selected date is invalid');
      }

      if (this.#currentDate && isNaN(this.#currentDate.getTime())) {
          issues.push('Current date is invalid');
      }

      // Check options
      if (this.#options.onDateSelect && !isFunction(this.#options.onDateSelect)) {
          warnings.push('onDateSelect is not a function');
      }

      if (this.#options.onMonthChange && !isFunction(this.#options.onMonthChange)) {
          warnings.push('onMonthChange is not a function');
      }

      // Check language
      if (!this.#lang || !this.#lang.has(this.#language)) {
          warnings.push(`Language '${this.#language}' is not available`);
      }

      // Check event dates
      let invalidEventDates = 0;
      for (const [timestamp] of this.#eventDates) {
          if (isNaN(timestamp) || timestamp < 0) {
              invalidEventDates++;
          }
      }

      if (invalidEventDates > 0) {
          issues.push(`${invalidEventDates} invalid event dates found`);
      }

      return {
          isValid: issues.length === 0,
          issues,
          warnings,
          summary: `${issues.length} issues, ${warnings.length} warnings`
      };
  }

  /**
   * Performance monitoring
   * @returns {Object} Performance metrics
   */
  getPerformanceMetrics() {
      const startTime = performance.now();

      // Measure render time
      const tempContainer = document.createElement('div');
      const tempCalendar = new CaleX(tempContainer, this.#options);
      tempCalendar.destroy();

      const renderTime = performance.now() - startTime;

      return {
          renderTime: `${renderTime.toFixed(2)}ms`,
          eventCount: this.#eventDates.size,
          priorityEventCount: this.#priorityEventDates.size,
          memoryUsage: this.#estimateMemoryUsage(),
          domElements: this.#container.querySelectorAll('*').length
      };
  }

  /**
   * Estimate memory usage (rough calculation)
   * @returns {string} Estimated memory usage
   */
  #estimateMemoryUsage() {
  let bytes = 0;

  // Estimate event dates storage
  bytes += this.#eventDates.size * 100; // rough estimate per event
  bytes += this.#priorityEventDates.size * 8; // timestamp storage

  // Estimate DOM elements
  bytes += this.#container.querySelectorAll('*').length * 200; // rough estimate per element

  if (bytes < 1024) {
      return `${bytes} bytes`;
  } else if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
  } else {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  }

  /**
   * Debug information
   * @returns {Object} Debug information
   */
  getDebugInfo() {
      return {
          version: '2.0.0',
          container: this.#container.tagName + (this.#container.id ? `#${this.#container.id}` : ''),
          currentDate: this.#currentDate.toISOString(),
          selectedDate: this.#selectedDate ? this.#selectedDate.toISOString() : null,
          language: this.#language,
          theme: this.#options.theme,
          options: { ...this.#options },
          eventDatesCount: this.#eventDates.size,
          priorityEventDatesCount: this.#priorityEventDates.size,
          validation: this.validateConfiguration(),
          performance: this.getPerformanceMetrics(),
          accessibility: this.getAccessibilityInfo()
      };
  }

  /**
   * Reset calendar to initial state
   */
  reset() {
      this.#currentDate = new Date();
      this.#selectedDate = null;
      this.#eventDates.clear();
      this.#priorityEventDates.clear();

      this.#emitEvent('reset', {
          timestamp: new Date().toISOString()
      });

      this.render();
  }

  /**
   * Dispose of the calendar and clean up all resources
   */
  dispose() {
      // Clear all event listeners
      if (this.#eventListeners) {
          this.#eventListeners.clear();
      }

      // Remove DOM event listeners
      if (this.#grid) {
          const days = this.#grid.querySelectorAll('.calendar-day');
          days.forEach(day => {
              day.onclick = null;
              day.onkeydown = null;
          });
      }

      // Clear input references
      if (this.#timeInput) this.#timeInput.onchange = null;
      if (this.#monthInput) this.#monthInput.onchange = null;
      if (this.#yearInput) this.#yearInput.onchange = null;

      // Emit disposal event
      this.#emitEvent('dispose', {
          timestamp: new Date().toISOString()
      });

      // Call destroy
      this.destroy();
  }
}
