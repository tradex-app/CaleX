    import CaleX from "./src/index"

    const element = document.getElementById("myCalendar")
    // Initialize calendar with custom options
    const myCalendar = new CaleX(element, {
      showControls: false,
      showWeekNumbers: true,
      allowPastDates: false,
      // language: "ru",
      onDateSelect: function(date) {
        console.log('Selected date:', date);
        // Handle date selection
      },
      onMonthChange: function(date) {
        console.log('Month changed to:', date);
        // Load events for new month
      }
    });

    window.calendar = myCalendar
    
    // Add dates from your content API
    function loadContentDates(contentItems) {
      const dates = contentItems.map(item => item.id); // timestamps
      myCalendar.addEventDates(dates);
    }
    
    // Example usage with different date formats
    myCalendar.setDate('2024-12-25'); // ISO string
    myCalendar.setDate(1735084800000); // Timestamp
    myCalendar.setDate(new Date()); // Date object
    myCalendar.setDate('December 25, 2024'); // Natural language
    
    // Add event dates
    myCalendar.addEventDates([
      '2024-12-24',
      '2024-12-25',
      1735084800000,
      new Date()
    ]);


// Demo functions
function setCalendarDate() {
  const input = document.getElementById('dateInput');
  if (input.value.trim()) {
    const success = myCalendar.setDate(input.value.trim());
    if (!success) {
      alert('Invalid date format! Try: 2024-12-25, December 25 2024, 12/25/2024, or timestamp');
    }
    input.value = '';
  }
}

function addEventDate() {
  const input = document.getElementById('dateInput');
  if (input.value.trim()) {
    const parsedDate = myCalendar.parseDate(input.value.trim());
    if (parsedDate) {
      myCalendar.addEventDates([parsedDate]);
      alert(`Added event date: ${parsedDate.toLocaleDateString()}`);
    } else {
      alert('Invalid date format!');
    }
    input.value = '';
  }
}

function clearEvents() {
  myCalendar.clearEventDates();
  alert('All event dates cleared!');
}

function goToToday() {
  myCalendar.goToToday();
}

// Additional demo functions for testing
function testDateFormats() {
  const testDates = [
    new Date(), // Date object
    '2024-12-25', // ISO string
    'December 25, 2024', // Long format
    '12/25/2024', // US format
    1735084800000, // Millisecond timestamp
    '1735084800', // Second timestamp as string
    1735084800, // Second timestamp as number
  ];
  
  console.log('Testing date formats:');
  testDates.forEach(date => {
    const parsed = myCalendar.parseDate(date);
    console.log(`Input: ${date} (${typeof date}) -> Parsed: ${parsed}`);
  });
}

// Expose test function globally
window.testDateFormats = testDateFormats;

// Example of advanced usage
function demonstrateAdvancedFeatures() {
  // Highlight a date range
  const startDate = new Date();
  const endDate = new Date(Date.now() + (7 * 86400000)); // Next 7 days
  myCalendar.highlightRange(startDate, endDate);
  
  // Get all event dates
  console.log('Current event dates:', myCalendar.getEventDates());
  
  // Navigate to specific month
  myCalendar.goToMonth(2024, 11); // December 2024
  
  // Get current view info
  console.log('Current view:', myCalendar.getCurrentView());
}

window.demonstrateAdvancedFeatures = demonstrateAdvancedFeatures;


