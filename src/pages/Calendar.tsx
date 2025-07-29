import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Edit3, Camera } from 'lucide-react';
import useJournalStore from '@/hooks/useJournalStore';
import { useI18n } from '@/hooks/useI18n';
import { cn } from '@/lib/utils';
import JournalModal from '@/components/JournalModal';
import WeatherIcon from '@/components/WeatherIcon';

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { getEntriesForMonth, hasEntryForDate, getEntry } = useJournalStore();
  const { t, language } = useI18n();

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
      const entry = monthEntries.find(e => e.date === dateStr);
      const hasPhoto = entry?.image ? true : false;

      days.push({
        date: new Date(current),
        dateStr,
        day: current.getDate(),
        isCurrentMonth,
        isToday,
        hasEntry,
        hasPhoto
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
    setSelectedDate(dateStr);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDate(null);
  };

  const completionRate = Math.round((monthEntries.length / new Date(year, month + 1, 0).getDate()) * 100);
  const completedDays = monthEntries.length;
  const totalDays = new Date(year, month + 1, 0).getDate();

  return (
    <div className="p-4 space-y-6 page-slide-in">
      {/* Header */}
      <div className="flex items-center justify-between py-4 fade-in">
        <button
          onClick={() => navigateMonth('prev')}
          className="p-2 rounded-lg hover:bg-orange-50 hover:text-orange-500 transition-all duration-300 hover:scale-110 active:scale-95 min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <ChevronLeft size={20} />
        </button>
        
        <h1 className="text-xl font-bold text-gray-800 typewriter flex items-center">
          📅 {language === 'zh' ? `${year}年${t.calendar.months[month]}` : `${t.calendar.months[month]} ${year}`}
        </h1>
        
        <button
          onClick={() => navigateMonth('next')}
          className="p-2 rounded-lg hover:bg-orange-50 hover:text-orange-500 transition-all duration-300 hover:scale-110 active:scale-95 min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-orange-50 rounded-xl p-4 text-center card-hover fade-in-delay-1">
          <div className="text-2xl font-bold text-orange-600">{completedDays}</div>
          <div className="text-sm text-gray-600">{t.calendar.recorded}</div>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 text-center card-hover fade-in-delay-2">
          <div className="text-2xl font-bold text-blue-600">{totalDays - completedDays}</div>
          <div className="text-sm text-gray-600">{t.calendar.unrecorded}</div>
        </div>
        <div className="bg-green-50 rounded-xl p-4 text-center card-hover fade-in-delay-3">
          <div className="text-2xl font-bold text-green-600">{completionRate}%</div>
          <div className="text-sm text-gray-600">{t.calendar.completionRate}</div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden card-hover fade-in-delay-1">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 bg-gradient-to-r from-gray-50 to-gray-100">
          {t.calendar.weekdays.map((day, index) => (
            <div key={day} className={`p-3 text-center text-sm font-bold text-gray-700 fade-in-delay-${index % 3 + 1}`}>
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1 p-2">
          {calendarDays.map((day, index) => {
            const entry = day.isCurrentMonth && day.hasEntry ? getEntry(day.dateStr) : null;
            
            return (
              <button
                key={index}
                onClick={() => day.isCurrentMonth && handleDateClick(day.dateStr)}
                disabled={!day.isCurrentMonth}
                className={cn(
                  "aspect-square p-2 text-sm relative transition-all duration-300 min-h-[44px] flex flex-col items-center justify-center rounded-xl font-medium",
                  "slide-in-up",
                  day.isCurrentMonth
                    ? day.hasEntry
                      ? "bg-gradient-to-br from-orange-100 to-orange-200 text-orange-700 hover:from-orange-200 hover:to-orange-300 shadow-md hover:scale-110 active:scale-95 cursor-pointer"
                      : day.isToday
                      ? "bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 border-2 border-blue-400 shadow-md hover:scale-110 active:scale-95 cursor-pointer pulse"
                      : "hover:bg-gradient-to-br hover:from-gray-100 hover:to-gray-200 hover:shadow-md hover:scale-110 active:scale-95 cursor-pointer"
                    : "text-gray-300 cursor-not-allowed",
                  day.isToday && !day.hasEntry && "bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 border-2 border-blue-400 font-bold pulse"
                )}
                style={{ animationDelay: `${index * 20}ms` }}
              >
                <span>{day.day}</span>
                
                {/* Weather Icon */}
                {entry?.weather && (
                  <div className="mt-0.5">
                    <WeatherIcon condition={entry.weather} size={12} />
                  </div>
                )}
                
                {/* Entry Indicators */}
                {day.hasEntry && day.isCurrentMonth && (
                  <div className="absolute -top-1 -right-1 flex gap-1">
                    <div className="w-3 h-3 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full shadow-lg pulse"></div>
                    {day.hasPhoto && (
                      <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full shadow-lg pulse flex items-center justify-center">
                        <Camera size={8} className="text-white" />
                      </div>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Entries */}
      <div className="space-y-4 fade-in-delay-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800 typewriter">📖 {t.calendar.recentEntries}</h2>
          <span className="text-sm text-gray-500">{monthEntries.length} {t.calendar.entriesCount}</span>
        </div>
        
        {monthEntries.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>{t.calendar.noEntriesThisMonth}</p>
            <p className="text-sm mt-1">{t.calendar.clickDateToStart}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {monthEntries
              .sort((a, b) => b.date.localeCompare(a.date))
              .slice(0, 5)
              .map((entry) => {
                const date = new Date(entry.date);
                const dateStr = date.toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', {
                  month: 'short',
                  day: 'numeric',
                  weekday: 'short'
                });
                const filledSentences = entry.sentences.filter(s => s.trim().length > 0);
                
                return (
                  <div
                    key={entry.id}
                    onClick={() => handleDateClick(entry.date)}
                    className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 cursor-pointer hover:from-orange-50 hover:to-orange-100 transition-all duration-300 hover:scale-105 active:scale-95 card-hover shadow-sm hover:shadow-md border border-gray-200"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-700">{dateStr}</span>
                        {entry.weather && (
                          <WeatherIcon condition={entry.weather} size={16} />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded-full">{filledSentences.length}/3</span>
                        {entry.image && (
                          <div className="w-5 h-5 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full flex items-center justify-center" title="包含照片">
                            <Camera size={10} className="text-white" />
                          </div>
                        )}
                        <Edit3 size={14} className="text-orange-500" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      {filledSentences.slice(0, 2).map((sentence, index) => (
                        <p key={index} className="text-sm text-gray-700 line-clamp-1 font-medium">
                          {sentence}
                        </p>
                      ))}
                      {filledSentences.length > 2 && (
                        <p className="text-xs text-orange-500 font-medium">...</p>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Journal Modal */}
      {selectedDate && (
        <JournalModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          date={selectedDate}
        />
      )}
    </div>
  );
}