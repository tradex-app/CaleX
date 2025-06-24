export interface CaleXOptions {
  /** Callback function called when a date is selected */
  onDateSelect?: ((date: Date) => void) | null;
  
  /** Callback function called when the month changes */
  onMonthChange?: ((date: Date) => void) | null;
  
  /** Whether to show navigation controls */
  showControls?: boolean;
  
  /** Whether to show time picker */
  showTime?: boolean;
  
  /** Whether to show week numbers */
  showWeekNumbers?: boolean;
  
  /** Whether to allow selection of past dates */
  allowPastDates?: boolean;
  
  /** Language code for localization */
  language?: string;
  
  /** Custom language definitions */
  languages?: CaleXLanguage[];
}

export interface CaleXLanguage {
  /** Language identifier */
  id: {
    /** Language code (e.g., 'en', 'es') */
    code: string;
    /** Display name of the language */
    name: string;
  };
  
  /** Translation mappings */
  translations: Record<string, string>;
}

export interface CaleXCurrentView {
  /** Current year being displayed */
  year: number;
  
  /** Current month being displayed (0-11) */
  month: number;
  
  /** Localized name of the current month */
  monthName: string;
}

export type CaleXDateInput = Date | string | number;

export default class CaleX {
  /**
   * Create a new CaleX calendar instance
   * @param container - HTML element to render the calendar in
   * @param options - Configuration options
   */
  constructor(container: HTMLElement, options?: CaleXOptions);

  // Read-only properties
  /** The container element */
  readonly container: HTMLElement;
  
  /** The current date being displayed */
  readonly currentDate: Date;
  
  /** The currently selected date */
  readonly selectedDate: Date | null;
  
  /** Set of event date timestamps */
  readonly eventDates: Set<number>;
  
  /** Current language code */
  readonly language: string;
  
  /** Localized month names */
  readonly monthNames: string[];
  
  /** Localized day names */
  readonly dayNames: string[];

  // Public methods

  /**
   * Initialize the calendar
   */
  init(): void;

  /**
   * Destroy the calendar and clean up resources
   */
  destroy(): void;

  /**
   * Set the language for the calendar
   * @param lang - Language code
   * @param translations - Optional custom translations
   */
  setLanguage(lang?: string, translations?: CaleXLanguage[]): void;

  /**
   * Parse various date formats into a Date object
   * @param input - Date input in various formats
   * @returns Parsed Date object or null if invalid
   */
  parseDate(input: CaleXDateInput): Date | null;

  /**
   * Set the selected date
   * @param date - Date in various formats
   * @returns Success status
   */
  setDate(date: CaleXDateInput): boolean;

  /**
   * Add event dates (dates that should be highlighted)
   * @param dates - Single date or array of dates
   */
  addEventDates(dates: CaleXDateInput | CaleXDateInput[]): void;

  /**
   * Clear all event dates
   */
  clearEventDates(): void;

  /**
   * Remove specific event dates
   * @param dates - Dates to remove
   */
  removeEventDates(dates: CaleXDateInput | CaleXDateInput[]): void;

  /**
   * Navigate to previous month
   */
  previousMonth(): void;

  /**
   * Navigate to next month
   */
  nextMonth(): void;

  /**
   * Go to today's date
   */
  goToToday(): void;

  /**
   * Navigate to specific month/year
   * @param year - Year
   * @param month - Month (0-11)
   */
  goToMonth(year: number, month: number): void;

  /**
   * Get the currently selected date
   * @returns Selected date or null
   */
  getSelectedDate(): Date | null;

  /**
   * Get all event dates
   * @returns Array of event dates
   */
  getEventDates(): Date[];

  /**
   * Get current viewing month/year
   * @returns Object with year, month, and monthName
   */
  getCurrentView(): CaleXCurrentView;

  /**
   * Calculate the week number for a given date
   * @param day - The date to calculate the week number for
   * @param first - First day of the week ('Sunday' or 'Monday')
   * @returns The week number (1-53)
   */
  getWeekNumber(day: Date, first?: 'Sunday' | 'Monday'): number;

  /**
   * Check if a date has events
   * @param date - Date to check
   * @returns Whether the date has events
   */
  hasEvents(date: Date): boolean;

  /**
   * Check if a date is today
   * @param date - Date to check
   * @returns Whether the date is today
   */
  isToday(date: Date): boolean;

  /**
   * Check if a date is selected
   * @param date - Date to check
   * @returns Whether the date is selected
   */
  isSelected(date: Date): boolean;

  /**
   * Get dates in a range
   * @param startDate - Start date
   * @param endDate - End date
   * @returns Array of dates in range
   */
  getDatesInRange(startDate: CaleXDateInput, endDate: CaleXDateInput): Date[];

  /**
   * Highlight dates in a range
   * @param startDate - Start date
   * @param endDate - End date
   */
  highlightRange(startDate: CaleXDateInput, endDate: CaleXDateInput): void;

  /**
   * Format date for display
   * @param date - Date to format
   * @returns Formatted date string
   */
  formatDate(date: Date): string;

  /**
   * Render the calendar
   */
  render(): void;

  // Event handlers (typically not called directly)
  
  /**
   * Handle day click events
   * @param event - Click event
   */
  onDayClick(event: Event): void;

  /**
   * Handle keyboard events
   * @param event - Keyboard event
   */
  onKeyDown(event: KeyboardEvent): void;

  // Render methods (typically not called directly)
  
  /**
   * Render calendar header
   * @param month - Month index
   * @param year - Year
   * @returns Header element
   */
  renderHeader(month: number, year: number): HTMLElement;

  /**
   * Render calendar footer
   * @param month - Month index
   * @param year - Year
   * @returns Footer element
   */
  renderFooter(month: number, year: number): HTMLElement;

  /**
   * Render navigation buttons
   * @param step - Navigation direction ('prev' or 'next')
   * @returns Navigation button element
   */
  renderNavPrevNext(step: 'prev' | 'next'): HTMLButtonElement;

  /**
   * Render year input
   * @param year - Current year
   * @returns Year input element
   */
  renderYear(year: number): HTMLInputElement;

  /**
   * Render month select
   * @param month - Current month index
   * @returns Month select element
   */
  renderMonth(month: number): HTMLSelectElement;

  /**
   * Render time input
   * @returns Time input container element
   */
  renderTime(): HTMLElement;

  /**
   * Render select element
   * @param type - Type of select
   * @param options - Options array
   * @param selected - Selected index
   * @returns Select element
   */
  renderSelect(type: string, options: string[], selected: number): HTMLSelectElement;

  /**
   * Render day headers
   * @returns Day headers HTML string
   */
  renderDayHeader(): string;

  /**
   * Render calendar body grid
   * @param month - Month index
   * @param year - Year
   * @returns Grid element
   */
  renderBodyGrid(month: number, year: number): HTMLElement;

  // Input change handlers (typically not called directly)
  
  /**
   * Handle time input changes
   * @param event - Input change event
   */
  setDateFromTimeInput(event: Event): void;

  /**
   * Handle month input changes
   * @param event - Input change event
   */
  setDateFromMonthInput(event: Event): void;

  /**
   * Handle year input changes
   * @param event - Input change event
   */
  setDateFromYearInput(event: Event): void;
}

// Export additional types that might be useful
export { CaleXOptions, CaleXLanguage, CaleXCurrentView, CaleXDateInput };
