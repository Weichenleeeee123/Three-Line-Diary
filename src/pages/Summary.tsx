import React, { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Share2, Bot, TrendingUp, Loader2, Sparkles, RefreshCw, Download, Image as ImageIcon, X } from 'lucide-react';
import { toast } from 'sonner';
import useJournalStore from '@/hooks/useJournalStore';
import { generateWeeklySummary, generateMoodInsight } from '@/services/geminiApi';
import { useI18n } from '@/hooks/useI18n';
import { cn } from '@/lib/utils';
import TypewriterText from '@/components/TypewriterText';
import { generateShareImage, downloadImage, shareImageToSocial } from '@/utils/shareImageGenerator';

interface MoodAnalysis {
  positive: number;
  neutral: number;
  negative: number;
}

function getWeekRange(date: Date): { start: Date; end: Date } {
  const start = new Date(date);
  const day = start.getDay();
  // 修复：以周一为一周的开始，与currentWeekStart的计算保持一致
  const diff = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + diff);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  
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
  const [summaryError, setSummaryError] = useState<string>('');
  const [moodError, setMoodError] = useState<string>('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string>('');
  
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
    console.log('🔍 AI总结useEffect触发:', {
      weekRangeStart: weekRange.start.toISOString().split('T')[0],
      weekEntriesLength: weekEntries.length,
      weekEntries: weekEntries.map(e => ({
        id: e.id,
        date: e.date,
        sentencesCount: e.sentences.filter(s => s.trim().length > 0).length,
        hasImage: !!e.image
      }))
    });
    
    const weekStartStr = weekRange.start.toISOString().split('T')[0];
    const storageKey = getStorageKey('summary', weekStartStr);
    
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        console.log('📦 找到缓存的AI总结');
        const { summary, timestamp, entriesHash } = JSON.parse(stored);
        const currentEntriesHash = JSON.stringify(weekEntries.map(e => ({ id: e.id, sentences: e.sentences, image: e.image })));
        
        console.log('🔄 检查缓存有效性:', {
          isDataStale: isDataStale(timestamp),
          entriesHashMatch: entriesHash === currentEntriesHash,
          cachedTimestamp: new Date(timestamp).toLocaleString(),
          currentTime: new Date().toLocaleString()
        });
        
        // 如果数据没有过期且条目没有变化，使用缓存的总结
        if (!isDataStale(timestamp) && entriesHash === currentEntriesHash) {
          console.log('✅ 使用缓存的AI总结');
          setAiSummary(summary);
          return;
        } else {
          console.log('❌ 缓存已过期或数据已变化，需要重新生成');
        }
      } else {
        console.log('📭 没有找到缓存的AI总结');
      }
    } catch (error) {
      console.error('Failed to load cached summary:', error);
    }
    
    // 如果没有缓存或缓存过期，生成新的总结
    if (weekEntries.length > 0) {
      console.log('🚀 开始生成新的AI总结，weekEntries数量:', weekEntries.length);
      generateAISummary();
    } else {
      console.log('📝 没有日记记录，清空AI总结');
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
        const currentEntriesHash = JSON.stringify(weekEntries.map(e => ({ id: e.id, sentences: e.sentences, image: e.image })));
        
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
    console.log('📝 generateAISummary函数被调用');
    console.log('📊 当前weekEntries详情:', {
      length: weekEntries.length,
      entries: weekEntries.map(entry => ({
        id: entry.id,
        date: entry.date,
        sentences: entry.sentences,
        validSentences: entry.sentences.filter(s => s.trim().length > 0),
        hasImage: !!entry.image
      }))
    });
    
    if (weekEntries.length === 0) {
      console.log('❌ weekEntries为空，清空AI总结');
      setAiSummary('');
      setSummaryError('');
      return;
    }
    
    console.log('🚀 开始生成AI总结，设置loading状态');
    setIsLoadingSummary(true);
    setSummaryError('');
    
    try {
      console.log('📡 准备调用generateWeeklySummary API');
      console.log('🌐 使用的语言:', language);
      console.log('📝 传递给API的entries数量:', weekEntries.length);
      
      const summary = await generateWeeklySummary(weekEntries, language);
      
      console.log('✅ AI总结生成成功!');
      console.log('📄 生成的总结内容:', summary);
      console.log('📏 总结长度:', summary.length);
      
      setAiSummary(summary);
      setSummaryError('');
      
      // 保存到本地存储
      const weekStartStr = weekRange.start.toISOString().split('T')[0];
      const storageKey = getStorageKey('summary', weekStartStr);
      const entriesHash = JSON.stringify(weekEntries.map(e => ({ id: e.id, sentences: e.sentences, image: e.image })));
      
      localStorage.setItem(storageKey, JSON.stringify({
        summary,
        timestamp: Date.now(),
        entriesHash
      }));
      console.log('💾 AI总结已保存到缓存，key:', storageKey);
      
    } catch (error) {
      console.error('❌ AI总结生成失败，错误详情:', error);
      console.error('🔍 错误类型:', typeof error);
      console.error('📝 错误消息:', error instanceof Error ? error.message : String(error));
      console.error('📚 错误堆栈:', error instanceof Error ? error.stack : 'No stack trace');
      
      const errorMessage = error instanceof Error ? error.message : (t?.summary?.summaryGenerationFailed || 'AI总结生成失败，请稍后重试');
      console.log('⚠️ 设置错误消息:', errorMessage);
      
      setSummaryError(errorMessage);
      setAiSummary('');
    } finally {
      console.log('🏁 AI总结生成流程结束，取消loading状态');
      setIsLoadingSummary(false);
    }
  };

  // 生成情绪洞察
  const generateMoodAnalysis = async () => {
    if (weekEntries.length === 0) {
      setMoodInsight('');
      setMoodError('');
      return;
    }
    
    setIsLoadingMood(true);
    setMoodError('');
    try {
      const insight = await generateMoodInsight(weekEntries, language);
      setMoodInsight(insight);
      setMoodError('');
      
      // 保存到本地存储
      const weekStartStr = weekRange.start.toISOString().split('T')[0];
      const storageKey = getStorageKey('mood', weekStartStr);
      const entriesHash = JSON.stringify(weekEntries.map(e => ({ id: e.id, sentences: e.sentences, image: e.image })));
      
      localStorage.setItem(storageKey, JSON.stringify({
        insight,
        timestamp: Date.now(),
        entriesHash
      }));
    } catch (error) {
      console.error('Failed to generate mood insight:', error);
      const errorMessage = error instanceof Error ? error.message : (language === 'zh' ? '情绪洞察生成失败，请稍后重试' : 'Mood insight generation failed, please try again later');
      setMoodError(errorMessage);
      setMoodInsight('');
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
      const entriesHash = JSON.stringify(weekEntries.map(e => ({ id: e.id, sentences: e.sentences, image: e.image })));
      
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
      const entriesHash = JSON.stringify(weekEntries.map(e => ({ id: e.id, sentences: e.sentences, image: e.image })));
      
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
  
  const handleGenerateShareImage = async () => {
    if (!aiSummary) {
      toast.error('请等待AI总结生成完成');
      return;
    }
    
    setIsGeneratingImage(true);
    try {
      const shareData = {
        weekRange: weekRangeText,
        aiSummary,
        moodInsight,
        weekEntries,
        moodAnalysis
      };
      
      const imageDataUrl = await generateShareImage(shareData);
      
      // 显示全屏图片预览
      setPreviewImageUrl(imageDataUrl);
      setShowImagePreview(true);
      
      // 存储图片数据供后续使用
      (window as any).currentShareImage = imageDataUrl;
      
      toast.success('分享图片生成成功！');
    } catch (error) {
      console.error('Failed to generate share image:', error);
      toast.error('图片生成失败，请稍后重试');
    } finally {
      setIsGeneratingImage(false);
    }
  };
  
  const handleDownloadImage = () => {
    const imageDataUrl = previewImageUrl || (window as any).currentShareImage;
    if (imageDataUrl) {
      const weekStart = weekRange.start.toISOString().split('T')[0];
      downloadImage(imageDataUrl, `weekly-summary-${weekStart}.png`);
      toast.success('图片已保存到下载文件夹');
    }
  };
  
  const handleShareToSocial = async () => {
    const imageDataUrl = previewImageUrl || (window as any).currentShareImage;
    if (imageDataUrl) {
      const shareText = `我的本周总结 - ${weekRangeText}\n\n来自三句话日记`;
      const shared = await shareImageToSocial(imageDataUrl, shareText);
      if (!shared) {
        toast.info('已为您下载图片，请手动分享到社交媒体');
      }
    }
  };

  const handleClosePreview = () => {
    setShowImagePreview(false);
    setPreviewImageUrl('');
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
        ) : summaryError ? (
          <div className="py-6">
            <div className="text-center text-red-600 mb-4">
              <p className="text-sm">{summaryError}</p>
            </div>
            <div className="flex justify-center">
              <button
                onClick={handleRegenerateSummary}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
              >
                <RefreshCw size={16} />
                {t?.summary?.retry || '重试'}
              </button>
            </div>
          </div>
        ) : (
          <>
            {aiSummary ? (
              <TypewriterText
                text={aiSummary}
                speed={15}
                delay={200}
                className="text-gray-700 leading-relaxed mb-4 block"
              />
            ) : (
              <p className="text-gray-700 leading-relaxed mb-4">
                {t?.summary?.noSummaryYet || '暂无总结内容'}
              </p>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleGenerateShareImage}
                  disabled={!aiSummary || isGeneratingImage}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGeneratingImage ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <ImageIcon size={16} />
                  )}
                  {isGeneratingImage ? '生成中...' : '生成分享图片'}
                </button>
              </div>
              
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
            ) : moodError ? (
              <div className="text-center">
                <p className="text-sm text-red-600 mb-2">{moodError}</p>
                <button
                  onClick={handleRegenerateMoodInsight}
                  className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-xs font-medium mx-auto"
                >
                  <RefreshCw size={12} />
                  {t?.summary?.retry || '重试'}
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between">
                  {moodInsight ? (
                    <TypewriterText
                      text={moodInsight}
                      speed={15}
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

      {/* 全屏图片预览模态框 */}
      {showImagePreview && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={handleClosePreview}
        >
          <div className="relative w-full h-full flex flex-col items-center justify-center max-w-sm mx-auto">
            
            {/* 图片显示容器 - 比手机边框还要小一圈 */}
            <div className="relative flex-1 flex items-center justify-center w-full px-8">
              <div className="relative">
                {/* 关闭按钮 - 适当间距 */}
                <button
                  onClick={handleClosePreview}
                  className="absolute top-3 right-3 p-1.5 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full text-gray-800 transition-all duration-300 z-10 shadow-lg"
                >
                  <X size={16} />
                </button>
                
                <img
                  src={previewImageUrl}
                  alt="分享图片预览"
                  className="w-full h-auto object-contain rounded-lg shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    maxWidth: 'calc(100vw - 80px)',
                    maxHeight: 'calc(100vh - 200px)'
                  }}
                />
                
                {/* 操作按钮 - 适当间距 */}
                <div 
                  className="absolute -bottom-14 left-1/2 transform -translate-x-1/2 flex items-center gap-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={handleDownloadImage}
                    className="w-10 h-10 bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-800 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg"
                    title="保存图片"
                  >
                    <Download size={18} />
                  </button>
                  
                  <button
                    onClick={handleShareToSocial}
                    className="w-10 h-10 bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-800 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg"
                    title="分享图片"
                  >
                    <Share2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}