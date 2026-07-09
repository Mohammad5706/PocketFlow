import { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

export function CustomDatePicker({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const initialDate = value ? new Date(value) : new Date();
  const [currentMonth, setCurrentMonth] = useState(initialDate);
  const containerRef = useRef(null);

  // Close calendar popup if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  // Get number of days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Get start day of month (0 = Sunday, 1 = Monday, etc.)
  // Shift Sunday to index 6
  let firstDayIndex = new Date(year, month, 1).getDay();
  firstDayIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

  // Format YYYY-MM-DD for HTML input values
  const formatYYYYMMDD = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Format DD-MM-YYYY for user display
  const formatDDMMYYYY = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}-${m}-${y}`;
  };

  const handleSelectDay = (day) => {
    const selected = new Date(year, month, day);
    onChange(formatYYYYMMDD(selected));
    setIsOpen(false);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanksArray = Array.from({ length: firstDayIndex }, (_, i) => i);

  // Month names
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const valueDate = value ? new Date(value) : null;

  return (
    <div className="custom-datepicker-container" ref={containerRef}>
      <div className="datepicker-input-wrapper" onClick={() => {
        if (!isOpen && value) {
          setCurrentMonth(new Date(value));
        }
        setIsOpen(!isOpen);
      }}>
        <input
          type="text"
          readOnly
          value={formatDDMMYYYY(value)}
          placeholder="Select Date"
          className="datepicker-input"
        />
        <CalendarIcon size={16} className="datepicker-icon" />
      </div>

      {isOpen && (
        <div className="calendar-popup animate-fade">
          <div className="calendar-header">
            <button type="button" onClick={handlePrevMonth} className="calendar-nav-btn">
              <ChevronLeft size={16} />
            </button>
            <span className="calendar-month-year">
              {monthNames[month]} {year}
            </span>
            <button type="button" onClick={handleNextMonth} className="calendar-nav-btn">
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="calendar-weekdays">
            <span>Mo</span>
            <span>Tu</span>
            <span>We</span>
            <span>Th</span>
            <span>Fr</span>
            <span>Sa</span>
            <span>Su</span>
          </div>

          <div className="calendar-days-grid">
            {blanksArray.map((_, i) => (
              <span key={`blank-${i}`} className="calendar-day blank"></span>
            ))}
            {daysArray.map((day) => {
              const isSelected = valueDate && 
                valueDate.getDate() === day && 
                valueDate.getMonth() === month && 
                valueDate.getFullYear() === year;
              
              const today = new Date();
              const isToday = today.getDate() === day && 
                today.getMonth() === month && 
                today.getFullYear() === year;

              return (
                <button
                  key={`day-${day}`}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  className={`calendar-day-btn ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomDatePicker;
