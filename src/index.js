
import { htmlToElement, htmlToElements, isHTMLElement } from "./utils/DOM";
import i18n from "./i18n";
import { isArrayOfType, isNumber, isString } from "./utils/typeChecks";
import css from "./style";

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

const languages = [
  english
]

export default class PlainCalendar {

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
      throw new Error("Calendar expects a valid HTML containter element")

    this.#container = container;
    this.#options = {
      ...options,
      onDateSelect: options?.onDateSelect || null,
      onMonthChange: options?.onMonthChange || null,
      showControls: options?.showControls !== false,
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
    if (!PlainCalendar.#styleInjected) {
      const style = document.createElement('style');
      style.type = 'text/css';
      style.id = 'plain-calendar-styles';
      style.appendChild(document.createTextNode(css));
      document.head.appendChild(style);
      PlainCalendar.#styleInjected = true;
    }
  }
  
  setLanguage(lang="en", translations) {
    if (!(this.#lang instanceof i18n)) {
      const trans = (isArrayOfType(translations, "object")) ? translations : languages
      const calLanguages = [...languages, ...trans]
      this.#lang = new i18n(calLanguages)
    }
    if (this.#lang.has(lang)) {
      this.#language = lang

      this.#monthNames = monthNames.map((month) => {
        return this.#lang.translate(this.#language, month)
      })

      this.#dayNames = dayNames.map((name) => {
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
    this.dayNames.forEach(day => {
      dayNames += `<div class="calendar-day-header">${day}</div>`;
    });
    return dayNames
  }

  renderBodyGrid(month, year) {
    let html = `<div class="calendar-grid">`
        html += this.renderDayHeader()
 
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    // Get previous month info for padding
    const prevMonth = new Date(year, month - 1, 0);
    const daysInPrevMonth = prevMonth.getDate();

    // Previous month's trailing days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const date = new Date(year, month - 1, day);
      html += `<div class="calendar-day other-month" data-date="${day}" data-ts="${date.getTime()}">${day}</div>`;
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      let classes = ['calendar-day'];
      
      if (this.isToday(date)) classes.push('today');
      if (this.isSelected(date)) classes.push('selected');
      if (this.hasEvents(date)) classes.push('has-events');
      
      html += `<div class="${classes.join(' ')}" data-date="${day}" data-ts="${date.getTime()}">${day}</div>`;
    }
    
    // Next month's leading days
    // const totalCells = Math.ceil((startingDayOfWeek + daysInMonth) / 7) * 7;
    const remainingCells = 42 - (startingDayOfWeek + daysInMonth);
    
    for (let day = 1; day <= remainingCells; day++) {
      const date = new Date(year, month + 1, day);
      html += `<div class="calendar-day other-month" data-date="${day}" data-ts="${date.getTime()}">${day}</div>`;
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
  }

  setDateFromYearInput(event) {
    const year = event.currentTarget.value
    this.#currentDate.setFullYear(year)
    this.render()
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
