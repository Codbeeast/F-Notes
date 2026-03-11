import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Clock } from 'lucide-react';

/**
 * @typedef {Object} DateTimeCellProps
 * @property {string} value
 * @property {(value: string) => void} onChange
 * @property {(time: string) => void} [onTimeChange]
 * @property {'date'|'time'} type
 * @property {boolean} isSelected
 * @property {boolean} isEditing
 * @property {() => void} onSelect
 * @property {() => void} onStartEdit
 * @property {() => void} onStopEdit
 * @property {(direction: 'up'|'down'|'left'|'right'|'tab'|'enter') => void} onNavigate
 * @property {string} [className]
 */

/**
 * @param {DateTimeCellProps} props
 */
export const DateTimeCell = ({
  value,
  onChange,
  onTimeChange,
  type,
  isSelected,
  isEditing,
  onSelect,
  onStartEdit,
  onStopEdit,
  onNavigate,
  className = ''
}) => {
  const [tempValue, setTempValue] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarPosition, setCalendarPosition] = useState({ top: 0, left: 0 });
  const inputRef = useRef(null);
  const cellRef = useRef(null);
  const calendarRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (type === 'date') {
        setShowCalendar(true);
        updateCalendarPosition();
      } else {
        inputRef.current.select();
      }
    }
  }, [isEditing, type]);

  useEffect(() => {
    if (isEditing) {
      if (type === 'date') {
        setTempValue(value || '');
      } else {
        setTempValue(value || '');
      }
    } else {
      setShowCalendar(false);
    }
  }, [isEditing, value, type]);

  useEffect(() => {
    if (showCalendar) {
      updateCalendarPosition();
    }
  }, [showCalendar]);

  const updateCalendarPosition = () => {
    if (cellRef.current) {
      const rect = cellRef.current.getBoundingClientRect();
      setCalendarPosition({
        top: rect.bottom,
        left: rect.left
      });
    }
  };

  // Auto-select session based on time
  const getSessionFromTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;
    const sessions = {
      'Asian': { start: 0, end: 480 },
      'Frankfurt': { start: 480, end: 600 },
      'London': { start: 600, end: 960 },
      'Pre NY': { start: 960, end: 1020 },
      'NY': { start: 1020, end: 1440 }
    };
    for (const [session, times] of Object.entries(sessions)) {
      if (totalMinutes >= times.start && totalMinutes < times.end) {
        return session;
      }
    }
    return 'Asian';
  };

  const handleKeyDown = (e) => {
    if (!isEditing) {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          onNavigate('up');
          break;
        case 'ArrowDown':
          e.preventDefault();
          onNavigate('down');
          break;
        case 'ArrowLeft':
          e.preventDefault();
          onNavigate('left');
          break;
        case 'ArrowRight':
          e.preventDefault();
          onNavigate('right');
          break;
        case 'Tab':
          e.preventDefault();
          onNavigate('tab');
          break;
        case 'Enter':
          e.preventDefault();
          onStartEdit();
          break;
        case 'F2':
          e.preventDefault();
          onStartEdit();
          break;
        default:
          if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
            onStartEdit();
            setTempValue(e.key);
          }
          break;
      }
    } else {
      switch (e.key) {
        case 'Enter':
          e.preventDefault();
          handleSubmit();
          onNavigate('enter');
          break;
        case 'Tab':
          e.preventDefault();
          handleSubmit();
          onNavigate('tab');
          break;
        case 'Escape':
          e.preventDefault();
          onStopEdit();
          break;
      }
    }
  };

  const handleSubmit = () => {
    if (type === 'date') {
      onChange(tempValue || '');
    } else {
      onChange(tempValue || '');
      if (onTimeChange && tempValue) {
        const session = getSessionFromTime(tempValue);
        onTimeChange(session);
      }
    }
    onStopEdit();
  };

  const handleClick = () => {
    onSelect();
  };

  const handleDoubleClick = () => {
    onStartEdit();
  };

  const handleDateSelect = (selectedDate) => {
    onChange(selectedDate);
    onStopEdit();
  };

  const handleInputChange = (e) => {
    setTempValue(e.target.value);
  };

  const handleInputBlur = () => {
    if (type === 'time' || !showCalendar) {
      handleSubmit();
    }
  };

  const generateCalendar = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    const days = [];
    const current = new Date(startDate);
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return { days, currentMonth, currentYear };
  };

  const { days, currentMonth, currentYear } = generateCalendar();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDisplayValue = () => {
    if (!value) return '';
    if (type === 'date') {
      try {
        return new Date(value + 'T00:00:00').toLocaleDateString();
      } catch {
        return value;
      }
    }
    return value;
  };

  const displayValue = getDisplayValue();

  return (
    <>
      <div
        ref={cellRef}
        className={`
          relative h-5 border cursor-cell select-none excel-cell-content
          ${isSelected ? 'cell-selected' : 'border-gray-300 bg-white'}
          ${isEditing ? 'cell-editing' : ''}
          ${className}
        `}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        {isEditing ? (
          <div className="flex items-center w-full h-full">
            <input
              ref={inputRef}
              type={type === 'date' ? 'date' : 'time'}
              value={tempValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              className="w-full h-full px-1 text-xs border-none outline-none bg-white"
            />
            {type === 'date' ? (
              <Calendar className="w-3 h-3 text-gray-400 mr-1 pointer-events-none" />
            ) : (
              <Clock className="w-3 h-3 text-gray-400 mr-1 pointer-events-none" />
            )}
          </div>
        ) : (
          <div className="w-full h-full flex items-center px-1 text-xs text-gray-900">
            {type === 'date' ? (
              <Calendar className="w-3 h-3 text-gray-400 mr-1" />
            ) : (
              <Clock className="w-3 h-3 text-gray-400 mr-1" />
            )}
            {displayValue || (type === 'date' ? 'Select date' : 'Select time')}
          </div>
        )}
      </div>
      {type === 'date' && showCalendar && (
        <div 
          ref={calendarRef}
          className="calendar-popup"
          style={{
            position: 'fixed',
            top: `${calendarPosition.top}px`,
            left: `${calendarPosition.left}px`,
            zIndex: 10000
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.preventDefault()}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">
              {monthNames[currentMonth]} {currentYear}
            </h3>
            <button
              onClick={() => {
                setShowCalendar(false);
                onStopEdit();
              }}
              className="text-gray-400 hover:text-gray-600 text-xs"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day} className="text-xs text-gray-500 text-center py-1 font-medium">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              const isCurrentMonth = day.getMonth() === currentMonth;
              const isToday = day.toDateString() === new Date().toDateString();
              const dayISOString = day.toISOString().split('T')[0];
              const isSelected = value && dayISOString === value;
              return (
                <button
                  key={index}
                  onClick={() => handleDateSelect(dayISOString)}
                  className={`
                    text-xs py-1 px-1 rounded hover:bg-blue-100 transition-colors
                    ${!isCurrentMonth ? 'text-gray-300' : 'text-gray-700'}
                    ${isToday ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}
                    ${isSelected ? 'bg-blue-200 text-blue-800' : ''}
                  `}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>
          <div className="flex justify-between mt-3 pt-2 border-t border-gray-200">
            <button
              onClick={() => handleDateSelect(new Date().toISOString().split('T')[0])}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Today
            </button>
            <button
              onClick={() => handleDateSelect(new Date(Date.now() - 86400000).toISOString().split('T')[0])}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Yesterday
            </button>
          </div>
        </div>
      )}
    </>
  );
}; 