# addEventDates Method Documentation

## Overview

The `addEventDates` method adds one or more dates as event dates to the calendar with optional metadata and styling. Event dates are visually highlighted and can include additional metadata. If a date already has events, the counts and metadata are merged intelligently.

## Syntax

```javascript
calendar.addEventDates(dates, options)
```

## Parameters

### `dates` (Required)
- **Type:** `Date | string | number | Array<Date | string | number>`
- **Description:** Date(s) to add as events. Can be a single date or an array of dates in various formats.

**Supported formats:**
- **Date object:** `new Date('2024-01-15')`
- **ISO string:** `'2024-01-15'` or `'2024-01-15T10:30:00Z'`
- **Timestamp:** `1705276800000`
- **Date string:** `'January 15, 2024'`

### `options` (Optional)
- **Type:** `Object`
- **Default:** `{}`
- **Description:** Configuration options for the events

#### Options Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `priority` | `boolean` | `false` | Mark events as high priority for special styling |
| `count` | `number` | `1` | Number of events on this date (for display purposes) |
| `metadata` | `Object` | `{}` | Custom metadata to associate with the events |

#### Metadata Examples

The `metadata` object can include any key-value pairs for application-specific data:

- `title`: Event title
- `description`: Event description
- `category`: Event category
- `color`: Custom color
- `url`: Associated URL
- `attendees`: Number of attendees
- `duration`: Event duration in minutes
- `location`: Event location

## Return Value

- **Type:** `void`
- **Description:** This method does not return a value

## Events

### `eventsAdded`
Emitted after events are successfully added.

**Event Data:**
```javascript
{
  events: Array<Object>,    // Array of added event objects
  totalEvents: number       // Total number of event dates in calendar
}
```

## Examples

### Basic Usage

```javascript
// Add a single event date
calendar.addEventDates(new Date('2024-01-15'));
```

### Multiple Dates

```javascript
// Add multiple event dates
calendar.addEventDates([
  '2024-01-15',
  '2024-01-20',
  new Date('2024-01-25')
]);
```

### Priority Events with Metadata

```javascript
// Add priority events with metadata
calendar.addEventDates(['2024-01-15', '2024-01-16'], {
  priority: true,
  count: 2,
  metadata: {
    title: 'Important Meeting',
    category: 'work',
    attendees: 5,
    color: '#ff0000'
  }
});
```

### Rich Metadata Example

```javascript
// Add events with comprehensive metadata
calendar.addEventDates('2024-01-15', {
  count: 3,
  metadata: {
    title: 'Team Standup',
    description: 'Daily team synchronization',
    category: 'meeting',
    duration: 30,
    location: 'Conference Room A',
    attendees: 8,
    url: 'https://meet.example.com/standup',
    recurring: true
  }
});
```

### Event Merging Behavior

```javascript
// First call
calendar.addEventDates('2024-01-15', {
  count: 1,
  metadata: { title: 'Meeting A', category: 'work' }
});

// Second call on same date
calendar.addEventDates('2024-01-15', {
  count: 2,
  priority: true,
  metadata: { title: 'Meeting B', location: 'Room 1' }
});

// Result: count = 2 (max), priority = true, 
// metadata = { title: 'Meeting B', category: 'work', location: 'Room 1' }
```

## Behavior Notes

1. **Date Normalization:** All dates are normalized to midnight (00:00:00) in the local timezone
2. **Duplicate Handling:** Adding events to existing event dates merges the data:
   - `count` uses the maximum value
   - `priority` becomes `true` if either is `true`
   - `metadata` objects are merged (new values override existing)
3. **Invalid Dates:** Invalid date formats are silently ignored
4. **Automatic Rendering:** The calendar re-renders automatically after adding events

## Related Methods

- [`removeEventDates()`](./removeEventDates.md) - Remove event dates
- [`addPriorityEventDates()`](./addPriorityEventDates.md) - Shorthand for adding priority events
- [`hasEvents()`](./hasEvents.md) - Check if a date has events
- [`getEventMetadata()`](./getEventMetadata.md) - Get event metadata for a date
- [`clearEventDates()`](./clearEventDates.md) - Clear all event dates

## Browser Support

- **Minimum Version:** All modern browsers
- **IE Support:** IE 11+ (with polyfills for Map and Set)

## Version History

- **2.0.0:** Initial implementation with metadata support
- **2.1.0:** Added priority event support
- **2.2.0:** Enhanced metadata merging behavior
