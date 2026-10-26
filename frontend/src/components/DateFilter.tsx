import React from 'react';
import { DateRange } from '../hooks/useDashboard';
import { Calendar as CalendarIcon } from 'lucide-react';

interface DateFilterProps {
  dateRange: DateRange;
  onChange: (range: DateRange) => void;
}

const PRESETS = [
  { label: 'Today', value: 'today' },
  { label: '7 Days', value: '7d' },
  { label: '30 Days', value: '30d' },
  { label: 'Custom', value: 'custom' },
];

export const DateFilter: React.FC<DateFilterProps> = ({ dateRange, onChange }) => {
  const handlePresetClick = (preset: string) => {
    const today = new Date().toISOString().slice(0, 10);
    if (preset === 'today') {
      onChange({ from: today, to: today, preset: 'today' });
    } else if (preset === '7d') {
      const from = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
      onChange({ from, to: today, preset: '7d' });
    } else if (preset === '30d') {
      const from = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
      onChange({ from, to: today, preset: '30d' });
    } else if (preset === 'custom') {
      onChange({ ...dateRange, preset: 'custom' });
    }
  };

  const handleCustomDateChange = (field: 'from' | 'to', val: string) => {
    onChange({
      ...dateRange,
      preset: 'custom',
      [field]: val,
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center bg-gray-900/90 p-1 rounded-xl border border-gray-800">
        {PRESETS.map(preset => {
          const isActive = dateRange.preset === preset.value;
          return (
            <button
              key={preset.value}
              type="button"
              onClick={() => handlePresetClick(preset.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.4)]'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
              }`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      {dateRange.preset === 'custom' && (
        <div className="flex items-center gap-2 bg-gray-900/90 px-3 py-1.5 rounded-xl border border-gray-800 animate-fade-in-up">
          <CalendarIcon className="w-3.5 h-3.5 text-blue-400" />
          <input
            type="date"
            value={dateRange.from}
            onChange={e => handleCustomDateChange('from', e.target.value)}
            className="bg-transparent text-xs text-gray-200 focus:outline-none [color-scheme:dark]"
          />
          <span className="text-gray-400 text-xs">to</span>
          <input
            type="date"
            value={dateRange.to}
            onChange={e => handleCustomDateChange('to', e.target.value)}
            className="bg-transparent text-xs text-gray-200 focus:outline-none [color-scheme:dark]"
          />
        </div>
      )}
    </div>
  );
};

export default DateFilter;
