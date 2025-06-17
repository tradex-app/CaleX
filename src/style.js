
const style = `
.calendar-container {
    font-family: Arial, sans-serif;
    max-width: 400px;
    margin: 20px auto;
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.calendar-header {
    background-color: #4CAF50;
    color: white;
    padding: 15px;
    text-align: center;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.calendar-nav {
    background: none;
    border: none;
    color: white;
    font-size: 18px;
    cursor: pointer;
    padding: 5px 10px;
    border-radius: 4px;
    transition: background-color 0.2s;
}

.calendar-nav:hover {
    background-color: rgba(255,255,255,0.2);
}

.calendar-title {
    font-size: 18px;
    font-weight: bold;
    margin: 0 15px;
}

.calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    background-color: white;
}

.calendar-day-header {
    background-color: #f5f5f5;
    padding: 10px;
    text-align: center;
    font-weight: bold;
    font-size: 12px;
    color: #666;
    border-bottom: 1px solid #eee;
}

.calendar-day {
    padding: 12px;
    text-align: center;
    cursor: pointer;
    border: 1px solid #f0f0f0;
    transition: all 0.2s;
    position: relative;
    min-height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.calendar-day:hover {
    background-color: #e8f5e8;
}

.calendar-day.other-month {
    color: #ccc;
    background-color: #fafafa;
}

.calendar-day.selected {
    background-color: #4CAF50;
    color: white;
    font-weight: bold;
}

.calendar-day.today {
    background-color: #2196F3;
    color: white;
    font-weight: bold;
}

.calendar-day.has-events {
    background-color: #fff3cd;
    border-color: #ffc107;
}

.calendar-day.has-events::after {
    content: '';
    position: absolute;
    bottom: 2px;
    right: 2px;
    width: 6px;
    height: 6px;
    background-color: #ff9800;
    border-radius: 50%;
}

.calendar-controls {
    padding: 15px;
    background-color: #f9f9f9;
    border-top: 1px solid #eee;
}

.calendar-input {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    margin-bottom: 10px;
}

.calendar-button {
    background-color: #4CAF50;
    color: white;
    border: none;
    padding: 8px 12px;
    border-radius: 4px;
    cursor: pointer;
    margin-right: 5px;
    margin-bottom: 5px;
}

.calendar-button:hover {
    background-color: #45a049;
}

.calendar-info {
    margin-top: 10px;
    padding: 10px;
    background-color: #e8f5e8;
    border-radius: 4px;
    font-size: 14px;
}
`

export default style

