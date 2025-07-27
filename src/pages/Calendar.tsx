import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Edit3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useJournalStore from '@/hooks/useJournalStore';
import { cn } from '@/lib/utils';

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];
const MONTHS = [
  '1月', '2月', '3月', '4月', '5月', '6月',
  '7月', '8月', '9月', '10月', '11月', '12月'
];

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { getEntriesForMonth, hasEntryForDate } = useJournalStore();
  const navigate = useNavigate();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthEntries = useMemo(() => {
    return getEntriesForMonth(year, month + 1);
  }, [year, month, getEntriesForMonth]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const current = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      const dateStr = current.toISOString().split('T')[0];
      const isCurrentMonth = current.getMonth() === month;
      const isToday = dateStr === new Date().toISOString().split('T')[0];
      const hasEntry = hasEntryForDate(dateStr);

      days.push({
        date: new Date(current),
        dateStr,
        day: current.getDate(),
        isCurrentMonth,
        isToday,
        hasEntry
      });

      current.setDate(current.getDate() + 1);
    }

    return days;
  }, [year, month, hasEntryForDate]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(month - 1);
    } else {
      newDate.setMonth(month + 1);
    }
    setCurrentDate(newDate);
  };

  const handleDateClick = (dateStr: string) => {
    // Navigate to home page with selected date
    navigate(`/?date=${dateStr}`);
  };

  const completionRate = Math.round((monthEntries.length / new Date(year, month + 1, 0).getDate()) * 100);
  const completedDays = monthEntries.length;
  const totalDays = new Date(year, month + 1, 0).getDate();

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between py-4">
        <button
          onClick={() => navigateMonth('prev')}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <ChevronLeft size={20} />
        </button>
        
        <h1 className="text-xl font-semibold text-gray-800">
          {year}年{MONTHS[month]}
        </h1>
        
        <button
          onClick={() => navigateMonth('next')}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-orange-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">{completedDays}</div>
          <div className="text-sm text-gray-600">已记录</div>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{totalDays - completedDays}</div>
          <div className="text-sm text-gray-600">未记录</div>
        </div>
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{completionRate}%</div>
          <div className="text-sm text-gray-600">完成率</div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 bg-gray-50">
          {WEEKDAYS.map((day) => (
            <div key={day} className="p-3 text-center text-sm font-medium text-gray-600">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => (
            <button
              key={index}
              onClick={() => day.isCurrentMonth && handleDateClick(day.dateStr)}
              disabled={!day.isCurrentMonth}
              className={cn(
                "aspect-square p-2 text-sm relative transition-colors min-h-[44px] flex items-center justify-center",
                day.isCurrentMonth
                  ? "hover:bg-gray-50 cursor-pointer"
                  : "text-gray-300 cursor-not-allowed",
                day.isToday && "bg-orange-100 text-orange-600 font-semibold"
              )}
            >
              <span>{day.day}</span>
              
              {/* Entry Indicator */}
              {day.hasEntry && day.isCurrentMonth && (
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Recent Entries */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">📖 最近记录</h2>
          <span className="text-sm text-gray-500">{monthEntries.length} 条记录</span>
        </div>
        
        {monthEntries.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>本月还没有记录</p>
            <p className="text-sm mt-1">点击日期开始记录吧！</p>
          </div>
        ) : (
          <div className="space-y-3">
            {monthEntries
              .sort((a, b) => b.date.localeCompare(a.date))
              .slice(0, 5)
              .map((entry) => {
                const date = new Date(entry.date);
                const dateStr = date.toLocaleDateString('zh-CN', {
                  month: 'short',
                  day: 'numeric',
                  weekday: 'short'
                });
                const filledSentences = entry.sentences.filter(s => s.trim().length > 0);
                
                return (
                  <div
                    key={entry.id}
                    onClick={() => handleDateClick(entry.date)}
                    className="bg-gray-50 rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-600">{dateStr}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{filledSentences.length}/3</span>
                        <Edit3 size={14} className="text-gray-400" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      {filledSentences.slice(0, 2).map((sentence, index) => (
                        <p key={index} className="text-sm text-gray-700 line-clamp-1">
                          {sentence}
                        </p>
                      ))}
                      {filledSentences.length > 2 && (
                        <p className="text-xs text-gray-500">...</p>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}