# CaleX Calendar

A flexible, lightweight JavaScript calendar component with internationalization support, event highlighting, and customizable features.

## Features

- 📅 **Interactive Calendar**: Navigate between months and years
- 🌍 **Internationalization**: Multi-language support with custom translations
- 📍 **Event Highlighting**: Mark specific dates with events
- ⏰ **Time Selection**: Optional time picker integration
- 📊 **Week Numbers**: Optional week number display
- 🎨 **Customizable**: Flexible styling and configuration options
- ♿ **Accessible**: Keyboard navigation support
- 📱 **Responsive**: Works on desktop and mobile devices

## Installation

```bash
npm install calex-calendar
```

Or include directly in your HTML:

```html
<script src="path/to/calex.js"></script>
```

## Quick Start

```javascript
// Basic usage
const container = document.getElementById('calendar-container');
const calendar = new CaleX(container);

// With options
const calendar = new CaleX(container, {
  showTime: true,
  showWeekNumbers: true,
  allowPastDates: false,
  language: 'en',
  onDateSelect: (date) => {
    console.log('Selected date:', date);
  },
  onMonthChange: (date) => {
    console.log('Month changed:', date);
  }
});
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `onDateSelect` | Function | `null` | Callback when a date is selected |
| `onMonthChange` | Function | `null` | Callback when month changes |
| `showControls` | Boolean | `true` | Show navigation controls |
| `showTime` | Boolean | `true` | Show time picker |
| `showWeekNumbers` | Boolean | `false` | Display week numbers |
| `weekStartsSunday` | Boolean | `true` | Start the week Sunday true, Monday false |
| `allowPastDates` | Boolean | `false` | Allow selection of past dates |
| `language` | String | `"en"` | Language code for localization |
| `languages` | Array | `[]` | Custom language definitions |

## API Reference

### Constructor

```javascript
new CaleX(container, options)
```

- `container` (HTMLElement): DOM element to render the calendar
- `options` (Object): Configuration options

### Methods

#### Date Management

```javascript
// Set selected date (accepts Date, string, or timestamp)
calendar.setDate('2024-01-15');
calendar.setDate(new Date());
calendar.setDate(1705276800000);

// Get selected date
const selected = calendar.getSelectedDate();

// Parse various date formats
const parsed = calendar.parseDate('2024-01-15');
```

#### Event Management

```javascript
// Add event dates
calendar.addEventDates(['2024-01-15', '2024-01-20']);
calendar.addEventDates(new Date());

// Remove event dates
calendar.removeEventDates(['2024-01-15']);

// Clear all events
calendar.clearEventDates();

// Get all event dates
const events = calendar.getEventDates();

// Check if date has events
const hasEvents = calendar.hasEvents(new Date());
```

#### Navigation

```javascript
// Navigate months
calendar.nextMonth();
calendar.previousMonth();

// Go to specific month/year
calendar.goToMonth(2024, 0); // January 2024

// Go to today
calendar.goToToday();

// Get current view
const view = calendar.getCurrentView();
// Returns: { year: 2024, month: 0, monthName: "January" }
```

#### Date Range Operations

```javascript
// Get dates in range
const dates = calendar.getDatesInRange('2024-01-01', '2024-01-07');

// Highlight date range
calendar.highlightRange('2024-01-01', '2024-01-07');
```

#### Utility Methods

```javascript
// Check date properties
calendar.isToday(new Date());
calendar.isSelected(new Date());

// Get week number
const weekNum = calendar.getWeekNumber(new Date());

// Format date
const formatted = calendar.formatDate(new Date());

// Clean up
calendar.destroy();
```

### Properties (Read-only)

```javascript
calendar.container        // HTMLElement
calendar.currentDate      // Date
calendar.selectedDate     // Date
calendar.eventDates       // Set
calendar.language         // String
calendar.monthNames       // Array
calendar.dayNames         // Array
```

## Internationalization

### Using Built-in Languages

CaleX comes preconfigured with the following languages:

* English
* French
* German
* Russian
* Spanish

```javascript
const calendar = new CaleX(container, {
  language: 'en' // Currently supports English
});
```
Further languages can be added by copying and modify the `languages.js` file found in npm package or in the Git repo `./i18n/languages.js`

### Adding Custom Languages

```javascript
const customLanguages = [
  {
    id: { code: "es", name: "Spanish" },
    translations: {
      January: "Enero",
      February: "Febrero",
      March: "Marzo",
      // ... other translations
      Sun: "Dom",
      Mon: "Lun",
      // ... other day names
    }
  }
];

const calendar = new CaleX(container, {
  language: 'es',
  languages: customLanguages
});
```

## Event Handling

```javascript
const calendar = new CaleX(container, {
  onDateSelect: (date) => {
    console.log('Date selected:', date);
    // Handle date selection
  },
  
  onMonthChange: (date) => {
    console.log('Month changed to:', date);
    // Handle month navigation
  }
});
```

## Styling

The calendar includes default styles, but you can customize the appearance using CSS. The entire calendar scales from the `font-size` inherited from the parent element.

Overriding the [CaleX CSS variables](https://github.com/tradex-app/CaleX/blob/master/src/style.js) allows you to apply your own custom styling to the calendar.

Some of the core CSS classes are:

```css
.calendar-container {
  /* Container styles */
}

.calendar-header {
  /* Header styles */
}

.calendar-grid {
  /* Grid layout */
}

.calendar-day {
  /* Day cell styles */
}

.calendar-day.today {
  /* Today's date */
}

.calendar-day.selected {
  /* Selected date */
}

.calendar-day.has-events {
  /* Dates with events */
}

.calendar-week {
  /* Week numbers */
}
```

## Examples

### Basic Calendar

```javascript
const calendar = new CaleX(document.getElementById('calendar'));
```

### Calendar with Events

```javascript
const calendar = new CaleX(document.getElementById('calendar'), {
  onDateSelect: (date) => {
    alert(`Selected: ${date.toDateString()}`);
  }
});

// Add some events
calendar.addEventDates([
  '2024-01-15',
  '2024-01-20',
  '2024-01-25'
]);
```

### Full-Featured Calendar

```javascript
const calendar = new CaleX(document.getElementById('calendar'), {
  showTime: true,
  showWeekNumbers: true,
  allowPastDates: true,
  onDateSelect: (date) => {
    console.log('Selected:', date);
  },
  onMonthChange: (date) => {
    console.log('Viewing:', date.getFullYear(), date.getMonth());
  }
});

// Highlight a date range
calendar.highlightRange('2024-01-01', '2024-01-07');
```

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Dependencies

- DOM utility functions
- i18n module for internationalization
- Type checking utilities

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
