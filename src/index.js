
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

// const languages = [
//   english
// ]

export default class CaleX {

  static #styleInjected = false


  #container
  #currentDate = new Date()
  #selectedDate = null
  #eventDates = new Set() // Store timestamps of dates with events
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
      weekStartsSunday: options?.weekStartsSunday !== false,
      allowPastDates: options?.allowPastDates !== true,
      language: options?.language || "en",
      languages: options?.languages || languages
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
   * Add event dates (dates that should be highlighted)
   * @param {Array|Date|string|number} dates - Single date or array of dates
   */
  addEventDates(dates) {
    const dateArray = Array.isArray(dates) ? dates : [dates];
    
    dateArray.forEach(date => {
      const parsedDate = this.parseDate(date);
      if (parsedDate) {
        // Store as timestamp for easy comparison
        const timestamp = new Date(
          parsedDate.getFullYear(),
          parsedDate.getMonth(),
          parsedDate.getDate()
        ).getTime();
        this.#eventDates.add(timestamp);
      }
    });
    
    this.render();
  }
  
  /**
   * Clear all event dates
   */
  clearEventDates() {
    this.#eventDates.clear();
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
   * Handle day click
   * @param {Event} event - Clicked date
   */
  onDayClick(event) {
    const date = event.currentTarget.dataset.ts * 1
    if (!this.#options.allowPastDates && date < new Date().setHours(0,0,0,0)) {
      return; // Don't allow past dates if option is set
    }
    
    const selected = this.#grid.querySelector(".selected")
    if (selected) {
      const ts = selected.getAttribute("ts") * 1
      if (ts !== date)
        selected.classList.remove("selected")
    }
    this.setDate(date);

    const newSelected = this.#grid.querySelector(`[data-ts="${date}"]`)
    if (newSelected)
        newSelected.classList.add("selected")
  }

  onKeyDown(event) {
    switch(event.key) {
      case 'ArrowLeft':
        // Navigate to previous day
        break;
      case 'ArrowRight':
        // Navigate to next day
        break;
      case 'Enter':
      case ' ':
        // Select current focused date
        break;
    }
  }
  
  /**
   * Render the calendar
   */
  render() {
    const year = this.#currentDate.getFullYear();
    const month = this.#currentDate.getMonth();
    const hoursMinutes = this.renderTime()
    const header = this.renderHeader(month, year)
    const bodyGrid = this.renderBodyGrid(month, year)
    const footer = this.renderFooter(month, year)
    const calendar = document.createElement("div")
          calendar.classList.add("calendar-container")
          calendar.appendChild(header)
          calendar.append(bodyGrid)
    if (this.#options.showControls)
          calendar.appendChild(footer)
          calendar.append(hoursMinutes)

    this.#container.innerHTML = ""
    this.#container.appendChild(calendar)
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
    const html = `
    <div class="calendar-info">
      <strong>Selected:</strong> ${this.#selectedDate ? this.formatDate(this.#selectedDate) : 'None'}<br>
      <strong>Events:</strong> ${this.#eventDates.size} dates
    </div>
    `
    const info = htmlToElement(html)
    const footer = this.renderHeader(month, year)
          footer.append(info)

    return footer
  }

  renderNavPrevNext(step) {
    const nav = document.createElement("button")
          nav.classList.add("calendar-nav")
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
    const html = `<input type="number" class="calendar-year calendar-input" placeholder="YYYY" min="0" max="3000" value="${year}">`
    const input = htmlToElement(html)
          input.onchange = this.setDateFromYearInput.bind(this)
    this.#yearInput = input
    return input
  }

  renderMonth(month) {
    const input = this.renderSelect("month", this.#monthNames, month)
          input.onchange = this.setDateFromMonthInput.bind(this)
          input.classList.add("calendar-input")
    this.#monthInput = input
    return input
  }

  renderTime() {
    const hours = this.#currentDate.getHours().toString().padStart(2, '0');
    const minutes = this.#currentDate.getMinutes().toString().padStart(2, '0');
    const html = `
    <div class="calendar-time">
      <input type="time" class="calendar-input calendar-timeinput" value="${hours}:${minutes}">
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
      if (text === options[selected]) option.selected = true
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
    const prevMonth = new Date(year, month - 1, 0);
    const daysInPrevMonth = prevMonth.getDate();
        
    // Track current position for week number insertion
    let cellCount = 0;
        
    // Previous month's trailing days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const date = new Date(year, month - 1, day);
            
      // Insert week number at the beginning of each week
      if (this.#options.showWeekNumbers && cellCount % 7 === 0) {
        const weekNumber = this.getWeekNumber(date);
        html += `<div class="calendar-week">${weekNumber}</div>`;
      }
            
      html += `<div class="calendar-day other-month" data-date="${day}" data-ts="${date.getTime()}">${day}</div>`;
      cellCount++;
    }
        
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      let classes = ['calendar-day'];
            
      // Insert week number at the beginning of each week
      if (this.#options.showWeekNumbers && cellCount % 7 === 0) {
        const weekNumber = this.getWeekNumber(date);
        html += `<div class="calendar-week">${weekNumber}</div>`;
      }
            
      if (this.isToday(date)) classes.push('today');
      if (this.isSelected(date)) classes.push('selected');
      if (this.hasEvents(date)) classes.push('has-events');
            
      html += `<div class="${classes.join(' ')}" data-date="${day}" data-ts="${date.getTime()}">${day}</div>`;
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
            
      html += `<div class="calendar-day other-month" data-date="${day}" data-ts="${date.getTime()}">${day}</div>`;
      cellCount++;
    }
        
    html += `</div>`
    const grid = htmlToElement(html)
    const days = grid.querySelectorAll(`.calendar-day`)
        
    days.forEach((day) => {
      day.onclick = this.onDayClick.bind(this)
    })
        
    grid.onKeyDown = this.onKeyDown.bind(this)
    this.#grid = grid
    return grid
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
   * Format date for display
   * @param {Date} date - Date to format
   * @returns {string} Formatted date string
   */
  formatDate(date) {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  /**
   * Get all event dates
   * @returns {Array<Date>} Array of event dates
   */
  getEventDates() {
    return Array.from(this.#eventDates).map(timestamp => new Date(timestamp));
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
      }
    });
    
    this.render();
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
   */
  highlightRange(startDate, endDate) {
    const datesInRange = this.getDatesInRange(startDate, endDate);
    this.addEventDates(datesInRange);
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
  

}
