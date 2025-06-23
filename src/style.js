
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
  
  --shadow-primary: rgba(0, 0, 0, 0.1);
  --shadow-nav-hover: rgba(255, 255, 255, 0.2);
  
  --event-indicator: #ff9800;
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
  
  --shadow-primary: rgba(0, 0, 0, 0.3);
  --shadow-nav-hover: rgba(255, 255, 255, 0.1);
  
  --event-indicator: #ffb74d;
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
    
    --shadow-primary: rgba(0, 0, 0, 0.3);
    --shadow-nav-hover: rgba(255, 255, 255, 0.1);
    
    --event-indicator: #ffb74d;
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

.calendar-day-header {
  background-color: var(--bg-tertiary);
  padding: .75em;
  text-align: center;
  font-weight: bold;
  font-size: 1.25em;
  color: var(--text-secondary);
}

.calendar-day {
  padding: 1em;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  min-height: 2.5em;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  border: var(--border-day) solid var(--border-tertiary);
}

.calendar-day:hover {
  background-color: var(--bg-hover);
}

.calendar-day.other-month {
  color: var(--text-muted);
  background-color: var(--bg-other-month);
}

.calendar-day.selected {
  background-color: var(--bg-selected);
  color: var(--text-on-selected);
  font-weight: bold;
}

.calendar-day.today {
  background-color: var(--bg-today);
  color: var(--text-on-today);
  font-weight: bold;
}

.calendar-day.has-events {
  background-color: var(--bg-has-events);
  border-color: var(--border-accent);
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
}

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

