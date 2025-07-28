import React, { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Share2, Bot, TrendingUp, Loader2, Sparkles, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import useJournalStore from '@/hooks/useJournalStore';
import { generateWeeklySummary, generateMoodInsight } from '@/services/geminiApi';
import { useI18n } from '@/hooks/useI18n';
import { cn } from '@/lib/utils';
import TypewriterText from '@/components/TypewriterText';

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



export default function Summary() {
  const { entries } = useJournalStore();
  const { t, language } = useI18n();
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
  });
  const [aiSummary, setAiSummary] = useState<string>('');
  const [moodInsight, setMoodInsight] = useState<string>('');
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [isLoadingMood, setIsLoadingMood] = useState(false);
  const [isRefreshingSummary, setIsRefreshingSummary] = useState(false);
  const [isRefreshingMood, setIsRefreshingMood] = useState(false);
  
  const weekRange = useMemo(() => getWeekRange(currentWeekStart), [currentWeekStart]);
  
  const weekEntries = useMemo(() => {
    const endDate = new Date(currentWeekStart);
    endDate.setDate(currentWeekStart.getDate() + 6);
    return entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= currentWeekStart && entryDate <= endDate;
    });
  }, [currentWeekStart, entries]);
  
  const moodAnalysis = useMemo(() => analyzeMood(weekEntries), [weekEntries]);
  
  // 获取存储键
  const getStorageKey = (type: 'summary' | 'mood', weekStart: string) => {
    return `ai_${type}_${weekStart}`;
  };

  // 检查数据是否过期（超过1天）
  const isDataStale = (timestamp: number) => {
    return Date.now() - timestamp > 24 * 60 * 60 * 1000;
  };

  // 从本地存储加载AI总结
  useEffect(() => {
    const weekStartStr = weekRange.start.toISOString().split('T')[0];
    const storageKey = getStorageKey('summary', weekStartStr);
    
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const { summary, timestamp, entriesHash } = JSON.parse(stored);
        const currentEntriesHash = JSON.stringify(weekEntries.map(e => ({ id: e.id, sentences: e.sentences })));
        
        // 如果数据没有过期且条目没有变化，使用缓存的总结
        if (!isDataStale(timestamp) && entriesHash === currentEntriesHash) {
          setAiSummary(summary);
          return;
        }
      }
    } catch (error) {
      console.error('Failed to load cached summary:', error);
    }
    
    // 如果没有缓存或缓存过期，生成新的总结
    if (weekEntries.length > 0) {
      generateAISummary();
    } else {
      setAiSummary('');
    }
  }, [weekRange.start, weekEntries]);

  // 从本地存储加载情绪洞察
  useEffect(() => {
    const weekStartStr = weekRange.start.toISOString().split('T')[0];
    const storageKey = getStorageKey('mood', weekStartStr);
    
    if (weekEntries.length === 0) {
      setMoodInsight('');
      return;
    }
    
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const { insight, timestamp, entriesHash } = JSON.parse(stored);
        const currentEntriesHash = JSON.stringify(weekEntries.map(e => ({ id: e.id, sentences: e.sentences })));
        
        // 如果数据没有过期且条目没有变化，使用缓存的洞察
        if (!isDataStale(timestamp) && entriesHash === currentEntriesHash) {
          setMoodInsight(insight);
          return;
        }
      }
    } catch (error) {
      console.error('Failed to load cached mood insight:', error);
    }
    
    // 如果没有缓存或缓存过期，生成新的洞察
    generateMoodAnalysis();
  }, [weekRange.start, weekEntries]);

  // 生成AI总结
  const generateAISummary = async () => {
    if (weekEntries.length === 0) {
      setAiSummary('');
      return;
    }
    
    setIsLoadingSummary(true);
    try {
      const summary = await generateWeeklySummary(weekEntries, language);
      setAiSummary(summary);
      
      // 保存到本地存储
      const weekStartStr = weekRange.start.toISOString().split('T')[0];
      const storageKey = getStorageKey('summary', weekStartStr);
      const entriesHash = JSON.stringify(weekEntries.map(e => ({ id: e.id, sentences: e.sentences })));
      
      localStorage.setItem(storageKey, JSON.stringify({
        summary,
        timestamp: Date.now(),
        entriesHash
      }));
    } catch (error) {
      console.error('Failed to generate AI summary:', error);
      toast.error(t?.summary?.summaryGenerationFailed || 'AI总结生成失败，请稍后重试');
    } finally {
      setIsLoadingSummary(false);
    }
  };

  // 生成情绪洞察
  const generateMoodAnalysis = async () => {
    if (weekEntries.length === 0) {
      setMoodInsight('');
      return;
    }
    
    setIsLoadingMood(true);
    try {
      const insight = await generateMoodInsight(weekEntries, language);
      setMoodInsight(insight);
      
      // 保存到本地存储
      const weekStartStr = weekRange.start.toISOString().split('T')[0];
      const storageKey = getStorageKey('mood', weekStartStr);
      const entriesHash = JSON.stringify(weekEntries.map(e => ({ id: e.id, sentences: e.sentences })));
      
      localStorage.setItem(storageKey, JSON.stringify({
        insight,
        timestamp: Date.now(),
        entriesHash
      }));
    } catch (error) {
      console.error('Failed to generate mood insight:', error);
    } finally {
      setIsLoadingMood(false);
    }
  };

  // 重新生成AI总结
  const handleRegenerateSummary = async () => {
    if (weekEntries.length === 0) return;
    
    setIsRefreshingSummary(true);
    setIsLoadingSummary(true);
    
    try {
      const summary = await generateWeeklySummary(weekEntries, language);
      setAiSummary(summary);
      
      // 保存到本地存储
      const weekStartStr = weekRange.start.toISOString().split('T')[0];
      const storageKey = getStorageKey('summary', weekStartStr);
      const entriesHash = JSON.stringify(weekEntries.map(e => ({ id: e.id, sentences: e.sentences })));
      
      localStorage.setItem(storageKey, JSON.stringify({
        summary,
        timestamp: Date.now(),
        entriesHash
      }));
    } catch (error) {
      console.error('Failed to regenerate AI summary:', error);
      toast.error(t?.summary?.summaryGenerationFailed || 'AI总结生成失败，请稍后重试');
    } finally {
      setIsLoadingSummary(false);
      setTimeout(() => setIsRefreshingSummary(false), 800);
    }
  };

  // 重新生成情绪洞察
  const handleRegenerateMoodInsight = async () => {
    if (weekEntries.length === 0) return;
    
    setIsRefreshingMood(true);
    setIsLoadingMood(true);
    
    try {
      const insight = await generateMoodInsight(weekEntries, language);
      setMoodInsight(insight);
      
      // 保存到本地存储
      const weekStartStr = weekRange.start.toISOString().split('T')[0];
      const storageKey = getStorageKey('mood', weekStartStr);
      const entriesHash = JSON.stringify(weekEntries.map(e => ({ id: e.id, sentences: e.sentences })));
      
      localStorage.setItem(storageKey, JSON.stringify({
        insight,
        timestamp: Date.now(),
        entriesHash
      }));
    } catch (error) {
      console.error('Failed to regenerate mood insight:', error);
    } finally {
      setIsLoadingMood(false);
      setTimeout(() => setIsRefreshingMood(false), 800);
    }
  };
  
  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentWeekStart);
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setCurrentWeekStart(newDate);
  };
  
  const handleShare = async () => {
    const shareText = `我的本周总结：\n\n${aiSummary || '正在生成中...'}\n\n来自三句话日记`;
    
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
        toast.success(t?.summary?.copiedToClipboard || '总结已复制到剪贴板');
      } catch (error) {
        toast.error(t?.summary?.shareFailed || '分享失败');
      }
    }
  };
  
  const weekRangeText = language === 'zh' 
    ? `${weekRange.start.getMonth() + 1}月${weekRange.start.getDate()}日 - ${weekRange.end.getMonth() + 1}月${weekRange.end.getDate()}日`
    : `${weekRange.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekRange.end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  
  return (
    <div className="p-4 space-y-6 page-slide-in">
      {/* Header */}
      <div className="flex items-center justify-between py-4 fade-in">
        <button
          onClick={() => navigateWeek('prev')}
          className="p-2 rounded-lg hover:bg-gray-100 transition-all duration-300 hover:scale-110 active:scale-95 min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <ChevronLeft size={20} />
        </button>
        
        <div className="text-center">
          <h1 className="text-lg font-semibold text-gray-800 typewriter">📊 {t?.summary?.title || '周总结'}</h1>
          <p className="text-sm text-gray-500 fade-in-delay-1">{weekRangeText}</p>
        </div>
        
        <button
          onClick={() => navigateWeek('next')}
          className="p-2 rounded-lg hover:bg-gray-100 transition-all duration-300 hover:scale-110 active:scale-95 min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Weekly Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6 fade-in-delay-1">
        <div className="bg-orange-50 rounded-xl p-4 text-center card-hover slide-in-up">
          <div className="text-2xl font-bold text-orange-600 count-up">{weekEntries.length}</div>
          <div className="text-sm text-gray-600">{t?.summary?.recordedDays || '记录天数'}</div>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 text-center card-hover slide-in-up fade-in-delay-1">
          <div className="text-2xl font-bold text-blue-600 count-up">
            {weekEntries.reduce((sum, entry) => 
              sum + entry.sentences.filter((s: string) => s.trim().length > 0).length, 0
            )}
          </div>
          <div className="text-sm text-gray-600">{t?.summary?.totalSentences || '总句数'}</div>
        </div>
        <div className="bg-green-50 rounded-xl p-4 text-center card-hover slide-in-up fade-in-delay-2">
          <div className="text-2xl font-bold text-green-600 count-up">
            {Math.round((weekEntries.length / 7) * 100)}%
          </div>
          <div className="text-sm text-gray-600">{t?.summary?.completionRate || '完成率'}</div>
        </div>
      </div>

      {/* AI Weekly Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Bot className="text-orange-600" size={20} />
          </div>
          <h2 className="text-lg font-semibold text-gray-800">{t?.summary?.aiWeeklySummary || 'AI 周总结'}</h2>
          <div className="flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
            <Sparkles size={12} />
            <span>Gemini 2.5 Pro</span>
          </div>
        </div>
        
        {isLoadingSummary ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="animate-spin text-orange-500" size={24} />
            <span className="ml-2 text-gray-600">{t?.summary?.aiAnalyzing || 'AI正在为你生成专属总结...'}</span>
          </div>
        ) : (
          <>
            {aiSummary ? (
              <TypewriterText
                text={aiSummary}
                speed={40}
                delay={200}
                className="text-gray-700 leading-relaxed mb-4 block"
              />
            ) : (
              <p className="text-gray-700 leading-relaxed mb-4">
                {t?.summary?.noSummaryYet || '暂无总结内容'}
              </p>
            )}
            
            <div className="flex items-center justify-between">
              <button
                onClick={handleShare}
                disabled={!aiSummary}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Share2 size={16} />
                {t?.summary?.shareTitle || '分享总结'}
              </button>
              
              {!isLoadingSummary && aiSummary && weekEntries.length > 0 && (
                <button
                  onClick={handleRegenerateSummary}
                  className={cn(
                    "p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-300 hover:scale-110",
                    isRefreshingSummary ? "spin-refresh" : ""
                  )}
                  title={t?.summary?.regenerate || '重新生成总结'}
                  disabled={isRefreshingSummary}
                >
                  <RefreshCw size={16} />
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Mood Analysis */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <TrendingUp className="text-blue-600" size={20} />
          </div>
          <h2 className="text-lg font-semibold text-gray-800">{t?.summary?.moodAnalysis || '情绪分析'}</h2>
        </div>
        
        {/* AI Mood Insight */}
        {weekEntries.length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="text-blue-600" size={16} />
              <span className="text-sm font-medium text-blue-800">{t?.summary?.aiMoodInsight || 'AI 情绪洞察'}</span>
            </div>
            {isLoadingMood ? (
              <div className="flex items-center gap-2 text-blue-600">
                <Loader2 className="animate-spin" size={16} />
                <span className="text-sm">{t?.summary?.analyzing || '分析中...'}</span>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between">
                  {moodInsight ? (
                    <TypewriterText
                      text={moodInsight}
                      speed={40}
                      delay={200}
                      className="text-sm text-blue-700 leading-relaxed flex-1 block"
                    />
                  ) : (
                    <p className="text-sm text-blue-700 leading-relaxed flex-1">
                      {t?.summary?.noInsightYet || '正在分析你的情绪变化...'}
                    </p>
                  )}
                  {!isLoadingMood && moodInsight && weekEntries.length > 0 && (
                    <button
                      onClick={handleRegenerateMoodInsight}
                      className={cn(
                        "p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-all duration-300 ml-2 flex-shrink-0 hover:scale-110",
                        isRefreshingMood ? "spin-refresh" : ""
                      )}
                      title={t?.summary?.regenerate || '重新生成情绪洞察'}
                      disabled={isRefreshingMood}
                    >
                      <RefreshCw size={14} />
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}
        
        <div className="space-y-4">
          {/* Positive */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-green-600">{t?.summary?.positive || '积极'} 😊</span>
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
              <span className="text-sm font-medium text-gray-600">{t?.summary?.neutral || '平静'} 😐</span>
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
              <span className="text-sm font-medium text-red-600">{t?.summary?.negative || '消极'} 😔</span>
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
            <p>{t?.summary?.noRecordsThisWeek || '这周还没有记录'}</p>
            <p className="text-sm mt-1">{t?.summary?.startRecordingPrompt || '开始记录来查看情绪分析吧！'}</p>
          </div>
        )}
      </div>

      {/* Weekly Entries */}
      {weekEntries.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">📝 {t?.summary?.weeklyRecords || '本周记录'}</h2>
          <div className="space-y-3">
            {weekEntries
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((entry) => {
                const date = new Date(entry.date);
                const dateStr = date.toLocaleDateString(language === 'en' ? 'en-US' : 'zh-CN', {
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