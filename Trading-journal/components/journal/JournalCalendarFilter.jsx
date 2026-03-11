import React from 'react';
import TimeFilter from '@/components/TimeFilter';

const JournalCalendarFilter = ({ 
  monthGroups, 
  onFilterChange, 
  showAllMonths, 
  onToggleShowAll,
  loading 
}) => {
  if (loading || monthGroups.length === 0) {
    return null;
  }

  return (
    <TimeFilter
      monthGroups={monthGroups}
      onFilterChange={onFilterChange}
      showAllMonths={showAllMonths}
      onToggleShowAll={onToggleShowAll}
    />
  );
};

export default JournalCalendarFilter;
