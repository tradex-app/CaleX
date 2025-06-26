
const style = `
/* CSS Custom Properties for Light and Dark Themes */
:root {
  --calendar-max-width: 35em;
  /* Font Definitions */
  --calendar-font-family: DejaVu Sans, Verdana, Arial, sans-serif;
  --calendar-font-size: 1em;
  /* Light Theme Colors */
  --bg-primary: #ffffff;
  --bg-secondary: #f9f9f9;
  --bg-tertiary: #f5f5f5;
  --bg-accent: #4CAF50;
  --bg-accent-hover: #45a049;
  --bg-selected: #4CAF50;
  --bg-today: #2196F3;
  --bg-hover: #e8f5e8;
  --bg-other-month: #fafafa;
  --bg-has-events: #fff3cd;
  --bg-info: #e8f5e8;
  
  /* Special combination colors */
  --bg-today-events: #1976d2; /* Darker blue for today with events */
  --bg-today-events-hover: #1565c0; /* Even darker on hover */
  
  /* Hover state colors */
  --bg-hover-default: #e8f5e8;
  --bg-hover-today: #1976d2;
  --bg-hover-selected: #45a049;
  --bg-hover-events: #fff8dc;
  --bg-hover-other-month: #f0f0f0;
  
  --text-primary: #333333;
  --text-secondary: #666666;
  --text-muted: #aaaaaa;
  --text-on-accent: #ffffff;
  --text-on-selected: #ffffff;
  --text-on-today: #ffffff;
  
  --border-primary: #dddddd;
  --border-secondary: #eeeeee;
  --border-tertiary: #f0f0f0;
  --border-accent: #ffc107;
  --border-today-events: #ff5722; /* Special border for today with events */
  
  --shadow-primary: rgba(0, 0, 0, 0.1);
  --shadow-nav-hover: rgba(255, 255, 255, 0.2);
  --shadow-hover: rgba(0, 0, 0, 0.15);
  --shadow-today-events: rgba(25, 118, 210, 0.4); /* Blue shadow for today with events */
  
  --event-indicator: #ff9800;
  --event-indicator-today: #ffffff; /* White indicator for today with events */
}

/* Dark Theme Colors */
[data-theme="dark"] {
  --bg-primary: #1a1a1a;
  --bg-secondary: #2d2d2d;
  --bg-tertiary: #3a3a3a;
  --bg-accent: #66bb6a;
  --bg-accent-hover: #5cb85c;
  --bg-selected: #66bb6a;
  --bg-today: #42a5f5;
  --bg-hover: #2e4a2e;
  --bg-other-month: #262626;
  --bg-has-events: #4a3c1a;
  --bg-info: #2e4a2e;
  
  /* Special combination colors for dark theme */
  --bg-today-events: #1976d2;
  --bg-today-events-hover: #1565c0;
  
  /* Dark theme hover states */
  --bg-hover-default: #2e4a2e;
  --bg-hover-today: #1976d2;
  --bg-hover-selected: #5cb85c;
  --bg-hover-events: #5a4a2a;
  --bg-hover-other-month: #333333;
  
  --text-primary: #e0e0e0;
  --text-secondary: #b0b0b0;
  --text-muted: #707070;
  --text-on-accent: #ffffff;
  --text-on-selected: #ffffff;
  --text-on-today: #ffffff;
  
  --border-primary: #404040;
  --border-secondary: #333333;
  --border-tertiary: #2a2a2a;
  --border-accent: #ffb74d;
  --border-today-events: #ff7043;
  
  --shadow-primary: rgba(0, 0, 0, 0.3);
  --shadow-nav-hover: rgba(255, 255, 255, 0.1);
  --shadow-hover: rgba(0, 0, 0, 0.4);
  --shadow-today-events: rgba(25, 118, 210, 0.6);
  
  --event-indicator: #ffb74d;
  --event-indicator-today: #ffffff;
}

/* Auto theme based on system preference */
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #1a1a1a;
    --bg-secondary: #2d2d2d;
    --bg-tertiary: #3a3a3a;
    --bg-accent: #66bb6a;
    --bg-accent-hover: #5cb85c;
    --bg-selected: #66bb6a;
    --bg-today: #42a5f5;
    --bg-hover: #2e4a2e;
    --bg-other-month: #262626;
    --bg-has-events: #4a3c1a;
    --bg-info: #2e4a2e;
    
    /* Special combination colors for auto dark theme */
    --bg-today-events: #1976d2;
    --bg-today-events-hover: #1565c0;
    
    /* Dark theme hover states for auto theme */
    --bg-hover-default: #2e4a2e;
    --bg-hover-today: #1976d2;
    --bg-hover-selected: #5cb85c;
    --bg-hover-events: #5a4a2a;
    --bg-hover-other-month: #333333;
    
    --text-primary: #e0e0e0;
    --text-secondary: #b0b0b0;
    --text-muted: #707070;
    --text-on-accent: #ffffff;
    --text-on-selected: #ffffff;
    --text-on-today: #ffffff;
    
    --border-primary: #404040;
    --border-secondary: #333333;
    --border-tertiary: #2a2a2a;
    --border-accent: #ffb74d;
    --border-day: 0;
    --border-today-events: #ff7043;
    
    --shadow-primary: rgba(0, 0, 0, 0.3);
    --shadow-nav-hover: rgba(255, 255, 255, 0.1);
    --shadow-hover: rgba(0, 0, 0, 0.4);
    --shadow-today-events: rgba(25, 118, 210, 0.6);
    
    --event-indicator: #ffb74d;
    --event-indicator-today: #ffffff;
  }
}

/* Updated Calendar Styles Using CSS Variables */
.calendar-container {
  font-family: var(--calendar-font-family);
  font-size: var(--calendar-font-size);
  max-width: var(--calendar-max-width);
  margin: 20px auto;
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px var(--shadow-primary);
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: all 0.3s ease;
}

.calendar-header {
  background-color: var(--bg-accent);
  color: var(--text-on-accent);
  padding: 1em;
  text-align: center;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.calendar-nav {
  background: none;
  border: none;
  color: var(--text-on-accent);
  font-size: 1.5em;
  cursor: pointer;
  padding: .5em 1em;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.calendar-nav:hover {
  background-color: var(--shadow-nav-hover);
}

.calendar-title {
  font-size: 1.5em;
  font-weight: bold;
  margin: 0 1.5em;
  color: var(--text-on-accent);
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background-color: var(--bg-primary);
}

/* Adjust grid columns when week numbers are shown */
.calendar-grid.with-week-numbers {
  grid-template-columns: auto repeat(7, 1fr);
}

.calendar-day-header {
  box-sizing: border-box;
  width: 4em;
  padding: .75em;
  text-align: center;
  font-weight: bold;
  font-size: 1.25em;
  color: var(--text-secondary);
  background-color: var(--bg-tertiary);
}

/* Week number styles */
.calendar-week {
  color: var(--text-secondary);
  opacity: 0.5;
  padding: 12px 8px;
  text-align: center;
  font-size: var(--font-size-sm);
  font-weight: normal;
  display: flex;
  align-items: center;
  justify-content: center;
}

.calendar-day {
  padding: 1em;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  min-height: 2.5em;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  border: var(--border-day) solid var(--border-tertiary);
}

/* Base hover state for all calendar days */
.calendar-day:hover {
  background-color: var(--bg-hover-default);
  box-shadow: 0 2px 8px var(--shadow-hover);
  transform: translateY(-1px);
  z-index: 1;
}

/* Other month days */
.calendar-day.other-month {
  color: var(--text-muted);
  background-color: var(--bg-other-month);
}

.calendar-day.other-month:hover {
  background-color: var(--bg-hover-other-month);
  color: var(--text-secondary);
}

/* Selected day */
.calendar-day.selected {
  background-color: var(--bg-selected);
  color: var(--text-on-selected);
  font-weight: bold;
}

.calendar-day.selected:hover {
  background-color: var(--bg-hover-selected);
  box-shadow: 0 4px 12px var(--shadow-hover);
  transform: translateY(-2px);
}

/* Today */
.calendar-day.today {
  background-color: var(--bg-today);
  color: var(--text-on-today);
  font-weight: bold;
}

.calendar-day.today:hover {
  background-color: var(--bg-hover-today);
  box-shadow: 0 4px 12px var(--shadow-hover);
  transform: translateY(-2px);
}

/* Days with events */
.calendar-day.has-events {
  background-color: var(--bg-has-events);
  border-color: var(--border-accent);
}

.calendar-day.has-events:hover {
  background-color: var(--bg-hover-events);
  border-color: var(--border-accent);
  box-shadow: 0 3px 10px var(--shadow-hover);
}

.calendar-day.has-events::after {
  content: '';
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 6px;
  height: 6px;
  background-color: var(--event-indicator);
  border-radius: 50%;
  transition: all 0.2s ease;
}

.calendar-day.has-events:hover::after {
  width: 8px;
  height: 8px;
  bottom: 3px;
  right: 3px;
}

/* TODAY WITH EVENTS - Special styling to distinguish from regular events */
.calendar-day.today.has-events {
  background-color: var(--bg-today-events);
  border: 2px solid var(--border-today-events);
  box-shadow: 0 0 0 1px var(--shadow-today-events);
  position: relative;
}

.calendar-day.today.has-events:hover {
  background-color: var(--bg-today-events-hover);
  box-shadow: 0 4px 20px var(--shadow-today-events);
  transform: translateY(-3px);
  border-color: var(--border-today-events);
}

/* Special event indicator for today */
.calendar-day.today.has-events::after {
  background-color: var(--event-indicator-today);
  width: 8px;
  height: 8px;
  bottom: 3px;
  right: 3px;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
}

.calendar-day.today.has-events:hover::after {
  width: 10px;
  height: 10px;
  bottom: 4px;
  right: 4px;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.4);
}

/* Add a subtle pulse animation for today with events */
.calendar-day.today.has-events {
  animation: todayEventsPulse 2s ease-in-out infinite;
}

@keyframes todayEventsPulse {
  0%, 100% {
    box-shadow: 0 0 0 1px var(--shadow-today-events);
  }
  50% {
    box-shadow: 0 0 0 3px var(--shadow-today-events);
  }
}

/* Pause animation on hover */
.calendar-day.today.has-events:hover {
  animation: none;
}

/* Additional visual indicator - corner accent */
.calendar-day.today.has-events::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  border-left: 12px solid var(--border-today-events);
  border-bottom: 12px solid transparent;
  z-index: 1;
}

/* Combined states hover effects */
/* SELECTED DAY WITH EVENTS - Special styling */
.calendar-day.today.selected:hover {
  background-color: var(--bg-hover-selected);
  box-shadow: 0 4px 15px var(--shadow-hover);
}

.calendar-day.selected.has-events {
  background-color: var(--bg-selected);
  border: 2px solid var(--border-accent);
  box-shadow: 0 0 0 1px rgba(76, 175, 80, 0.3);
}

.calendar-day.selected.has-events:hover {
  background-color: var(--bg-hover-selected);
  box-shadow: 0 4px 15px var(--shadow-hover);
  transform: translateY(-2px);
}

.calendar-day.selected.has-events::after {
  background-color: var(--text-on-selected);
  width: 7px;
  height: 7px;
  box-shadow: 0 0 3px rgba(0, 0, 0, 0.2);
}

/* TODAY + SELECTED + EVENTS - Ultimate combination */
.calendar-day.today.selected.has-events {
  background: linear-gradient(135deg, var(--bg-today-events) 0%, var(--bg-selected) 100%);
  border: 2px solid var(--border-today-events);
  box-shadow: 
    0 0 0 1px var(--shadow-today-events),
    0 0 0 3px rgba(76, 175, 80, 0.2);
  font-weight: bold;
  position: relative;
}

.calendar-day.today.selected.has-events:hover {
  background: linear-gradient(135deg, var(--bg-today-events-hover) 0%, var(--bg-hover-selected) 100%);
  box-shadow: 
    0 5px 25px var(--shadow-today-events),
    0 0 0 2px var(--border-today-events);
  transform: translateY(-3px);
  animation: none;
}

/* Multiple event indicators for today+selected+events */
.calendar-day.today.selected.has-events::after {
  background-color: var(--event-indicator-today);
  width: 8px;
  height: 8px;
  bottom: 3px;
  right: 3px;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.4);
}

.calendar-day.today.selected.has-events:hover::after {
  width: 10px;
  height: 10px;
  bottom: 4px;
  right: 4px;
}

/* Add a second indicator for the ultimate combination */
.calendar-day.today.selected.has-events::before {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 8px;
  height: 8px;
  background-color: var(--event-indicator-today);
  border-radius: 50%;
  box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);
  z-index: 1;
}

.calendar-day.today.selected.has-events:hover::before {
  width: 10px;
  height: 10px;
  top: 3px;
  left: 3px;
}

/* OTHER MONTH WITH EVENTS - Subtle distinction */
.calendar-day.other-month.has-events {
  background-color: var(--bg-other-month);
  border: 1px dashed var(--border-accent);
  opacity: 0.7;
}

.calendar-day.other-month.has-events:hover {
  background-color: var(--bg-hover-other-month);
  opacity: 0.9;
  border-style: solid;
}

.calendar-day.other-month.has-events::after {
  background-color: var(--event-indicator);
  opacity: 0.6;
}

.calendar-day.other-month.has-events:hover::after {
  opacity: 1;
}

/* DISABLED DATES WITH EVENTS - If you have disabled functionality */
.calendar-day.disabled.has-events {
  background-color: var(--bg-other-month);
  color: var(--text-muted);
  cursor: not-allowed;
  opacity: 0.5;
}

.calendar-day.disabled.has-events:hover {
  background-color: var(--bg-other-month);
  transform: none;
  box-shadow: none;
}

.calendar-day.disabled.has-events::after {
  opacity: 0.3;
}

/* WEEKEND STYLING - If you want to distinguish weekends */
.calendar-day.weekend {
  background-color: color-mix(in srgb, var(--bg-secondary) 20%, var(--bg-primary) 100%);
}

.calendar-day.other-month.weekend {
  background-color: color-mix(in srgb, var(--bg-other-month) 100%, var(--bg-primary) 50%);
}

.calendar-day.weekend.has-events {
  background-color: var(--bg-has-events);
}

.calendar-day.weekend.today.has-events {
  background-color: var(--bg-today-events);
}

/* HIGH PRIORITY EVENTS - Additional class for important events */
.calendar-day.has-priority-events {
  background-color: #ffebee;
  border: 2px solid #f44336;
}

[data-theme="dark"] .calendar-day.has-priority-events {
  background-color: #4a2c2a;
  border-color: #ef5350;
}

.calendar-day.has-priority-events::after {
  background-color: #f44336;
  animation: priorityPulse 1.5s ease-in-out infinite;
}

[data-theme="dark"] .calendar-day.has-priority-events::after {
  background-color: #ef5350;
}

@keyframes priorityPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.calendar-day.today.has-priority-events {
  background: linear-gradient(135deg, var(--bg-today-events) 0%, #ffcdd2 100%);
  border: 2px solid #f44336;
  box-shadow: 
    0 0 0 1px var(--shadow-today-events),
    0 0 0 3px rgba(244, 67, 54, 0.3);
}

[data-theme="dark"] .calendar-day.today.has-priority-events {
  background: linear-gradient(135deg, var(--bg-today-events) 0%, #4a2c2a 100%);
}

/* MULTIPLE EVENTS INDICATOR - Show count */
.calendar-day.has-multiple-events::after {
  content: attr(data-event-count);
  position: absolute;
  bottom: 1px;
  right: 1px;
  width: 14px;
  height: 14px;
  background-color: var(--event-indicator);
  color: white;
  font-size: 10px;
  font-weight: bold;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.calendar-day.today.has-multiple-events::after {
  background-color: var(--event-indicator-today);
  color: var(--bg-today-events);
  font-weight: bold;
}

.calendar-day.has-multiple-events:hover::after {
  width: 16px;
  height: 16px;
  font-size: 11px;
}

/* ACCESSIBILITY IMPROVEMENTS */
.calendar-day:focus {
  outline: 2px solid var(--bg-accent);
  outline-offset: -2px;
  z-index: 2;
}

.calendar-day.today:focus {
  outline-color: var(--border-today-events);
}

/* SCREEN READER SUPPORT */
.calendar-day .sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* PRINT STYLES */
@media print {
  .calendar-day.today.has-events {
    background-color: #e3f2fd !important;
    border: 2px solid #1976d2 !important;
    animation: none !important;
  }
  
  .calendar-day.has-events::after {
    background-color: #333 !important;
  }
  
  .calendar-day.today.has-events::after {
    background-color: #1976d2 !important;
  }
}

/* Rest of the existing styles continue... */
.calendar-controls {
  padding: 1.25em;
  background-color: var(--bg-secondary);
  border-top: 1px solid var(--border-secondary);
}

.calendar-input {
  padding: .5em;
  border: 1px solid var(--border-primary);
  border-radius: 4px;
  margin-bottom: 0;
  font-size: 18px;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: all 0.2s;
}

.calendar-input:focus {
  outline: none;
  border-color: var(--bg-accent);
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}

.calendar-button {
  background-color: var(--bg-accent);
  color: var(--text-on-accent);
  border: none;
  padding: 8px 1em;
  border-radius: 4px;
  cursor: pointer;
  margin-right: .5em;
  margin-bottom: .5em;
  transition: background-color 0.2s;
}

.calendar-button:hover {
  background-color: var(--bg-accent-hover);
}

.calendar-info {
  margin-top: 1em;
  padding: 1em;
  background-color: var(--bg-info);
  border-radius: 4px;
  font-size: 1em;
  color: var(--text-primary);
}

.calendar-time {
  background-color: var(--bg-accent);
  color: var(--text-on-accent);
  text-align: center;
  display: flex;
  justify-content: space-around;
  align-items: center;
}

/* Theme Toggle Button Styles */
.theme-toggle {
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: var(--bg-accent);
  color: var(--text-on-accent);
  border: none;
  padding: 10px 15px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  z-index: 1000;
}

.theme-toggle:hover {
  background-color: var(--bg-accent-hover);
  transform: scale(1.05);
}

`

export default style

