import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Share2, Bot, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import useJournalStore from '@/hooks/useJournalStore';
import { cn } from '@/lib/utils';

interface MoodAnalysis {
  positive: number;
  neutral: number;
  negative: number;
}

function getWeekRange(date: Date): { start: Date; end: Date } {
  const start = new Date(date);
  const day = start.getDay();
  start.setDate(start.getDate() - day);
  
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  
  return { start, end };
}

function analyzeMood(entries: any[]): MoodAnalysis {
  if (entries.length === 0) {
    return { positive: 0, neutral: 100, negative: 0 };
  }

  const positiveWords = ['开心', '快乐', '高兴', '满足', '成功', '完成', '好', '棒', '赞', '爱', '喜欢', '美好', '顺利', '进步'];
  const negativeWords = ['难过', '失望', '累', '疲惫', '困难', '问题', '失败', '糟糕', '不好', '担心', '焦虑', '压力'];
  
  let positiveCount = 0;
  let negativeCount = 0;
  let totalSentences = 0;
  
  entries.forEach(entry => {
    entry.sentences.forEach((sentence: string) => {
      if (sentence.trim().length > 0) {
        totalSentences++;
        
        const hasPositive = positiveWords.some(word => sentence.includes(word));
        const hasNegative = negativeWords.some(word => sentence.includes(word));
        
        if (hasPositive && !hasNegative) {
          positiveCount++;
        } else if (hasNegative && !hasPositive) {
          negativeCount++;
        }
      }
    });
  });
  
  if (totalSentences === 0) {
    return { positive: 0, neutral: 100, negative: 0 };
  }
  
  const positive = Math.round((positiveCount / totalSentences) * 100);
  const negative = Math.round((negativeCount / totalSentences) * 100);
  const neutral = 100 - positive - negative;
  
  return { positive, neutral, negative };
}

function generateWeeklySummary(entries: any[]): string {
  if (entries.length === 0) {
    return '这周还没有记录，开始写下你的第一篇日记吧！';
  }
  
  const totalSentences = entries.reduce((sum, entry) => 
    sum + entry.sentences.filter((s: string) => s.trim().length > 0).length, 0
  );
  
  const moodAnalysis = analyzeMood(entries);
  const avgSentencesPerDay = (totalSentences / 7).toFixed(1);
  
  let summary = `这周你记录了 ${entries.length} 天，共写下 ${totalSentences} 句话，平均每天 ${avgSentencesPerDay} 句。`;
  
  if (moodAnalysis.positive > 50) {
    summary += ' 从你的记录中可以感受到满满的正能量，继续保持这种积极的心态！';
  } else if (moodAnalysis.negative > 30) {
    summary += ' 这周似乎遇到了一些挑战，记住困难只是暂时的，你一定能够克服！';
  } else {
    summary += ' 这周的生活平静而充实，简单的记录中蕴含着生活的美好。';
  }
  
  if (entries.length >= 5) {
    summary += ' 坚持记录的习惯很棒，这样的自我反思会让你更加了解自己。';
  } else if (entries.length >= 3) {
    summary += ' 记录习惯正在养成，试着每天都写下三句话吧！';
  } else {
    summary += ' 开始记录是个好习惯，试着更频繁地记录你的生活吧！';
  }
  
  return summary;
}

export default function Summary() {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const { getEntriesForWeek } = useJournalStore();
  
  const weekRange = useMemo(() => getWeekRange(currentWeek), [currentWeek]);
  
  const weekEntries = useMemo(() => {
    const startStr = weekRange.start.toISOString().split('T')[0];
    return getEntriesForWeek(startStr);
  }, [weekRange.start, getEntriesForWeek]);
  
  const moodAnalysis = useMemo(() => analyzeMood(weekEntries), [weekEntries]);
  const weeklySummary = useMemo(() => generateWeeklySummary(weekEntries), [weekEntries]);
  
  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentWeek);
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setCurrentWeek(newDate);
  };
  
  const handleShare = async () => {
    const shareText = `我的本周总结：\n\n${weeklySummary}\n\n来自三句话日记`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: '我的周总结',
          text: shareText
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(shareText);
        toast.success('总结已复制到剪贴板');
      } catch (error) {
        toast.error('分享失败');
      }
    }
  };
  
  const weekRangeText = `${weekRange.start.getMonth() + 1}月${weekRange.start.getDate()}日 - ${weekRange.end.getMonth() + 1}月${weekRange.end.getDate()}日`;
  
  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between py-4">
        <button
          onClick={() => navigateWeek('prev')}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <ChevronLeft size={20} />
        </button>
        
        <div className="text-center">
          <h1 className="text-lg font-semibold text-gray-800">本周总结</h1>
          <p className="text-sm text-gray-500">{weekRangeText}</p>
        </div>
        
        <button
          onClick={() => navigateWeek('next')}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Weekly Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-orange-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">{weekEntries.length}</div>
          <div className="text-sm text-gray-600">记录天数</div>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {weekEntries.reduce((sum, entry) => 
              sum + entry.sentences.filter((s: string) => s.trim().length > 0).length, 0
            )}
          </div>
          <div className="text-sm text-gray-600">总句数</div>
        </div>
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {Math.round((weekEntries.length / 7) * 100)}%
          </div>
          <div className="text-sm text-gray-600">完成率</div>
        </div>
      </div>

      {/* AI Weekly Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Bot className="text-orange-600" size={20} />
          </div>
          <h2 className="text-lg font-semibold text-gray-800">AI 周总结</h2>
        </div>
        
        <p className="text-gray-700 leading-relaxed mb-4">
          {weeklySummary}
        </p>
        
        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
        >
          <Share2 size={16} />
          分享总结
        </button>
      </div>

      {/* Mood Analysis */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <TrendingUp className="text-blue-600" size={20} />
          </div>
          <h2 className="text-lg font-semibold text-gray-800">情绪分析</h2>
        </div>
        
        <div className="space-y-4">
          {/* Positive */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-green-600">积极 😊</span>
              <span className="text-sm text-gray-600">{moodAnalysis.positive}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${moodAnalysis.positive}%` }}
              />
            </div>
          </div>
          
          {/* Neutral */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">平静 😐</span>
              <span className="text-sm text-gray-600">{moodAnalysis.neutral}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gray-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${moodAnalysis.neutral}%` }}
              />
            </div>
          </div>
          
          {/* Negative */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-red-600">消极 😔</span>
              <span className="text-sm text-gray-600">{moodAnalysis.negative}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-red-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${moodAnalysis.negative}%` }}
              />
            </div>
          </div>
        </div>
        
        {weekEntries.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            <p>这周还没有记录</p>
            <p className="text-sm mt-1">开始记录来查看情绪分析吧！</p>
          </div>
        )}
      </div>

      {/* Weekly Entries */}
      {weekEntries.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">📝 本周记录</h2>
          <div className="space-y-3">
            {weekEntries
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((entry) => {
                const date = new Date(entry.date);
                const dateStr = date.toLocaleDateString('zh-CN', {
                  month: 'short',
                  day: 'numeric',
                  weekday: 'short'
                });
                const filledSentences = entry.sentences.filter((s: string) => s.trim().length > 0);
                
                return (
                  <div key={entry.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-600">{dateStr}</span>
                      <span className="text-xs text-gray-500">{filledSentences.length}/3</span>
                    </div>
                    <div className="space-y-1">
                      {filledSentences.map((sentence: string, index: number) => (
                        <p key={index} className="text-sm text-gray-700">
                          {sentence}
                        </p>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}