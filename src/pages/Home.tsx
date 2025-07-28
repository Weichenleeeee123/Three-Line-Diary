import { useState, useEffect } from 'react';
import { Save, Quote, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import useJournalStore from '@/hooks/useJournalStore';
import { useI18n } from '@/hooks/useI18n';
import { cn } from '@/lib/utils';
import TypewriterText from '@/components/TypewriterText';
import CelebrationModal from '@/components/CelebrationModal';
import { playDiarySaveSound, preloadSounds } from '@/services/soundService';


export default function Home() {
  const [sentences, setSentences] = useState<[string, string, string]>(['', '', '']);
  const [currentQuote, setCurrentQuote] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [quoteKey, setQuoteKey] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isFirstTimeToday, setIsFirstTimeToday] = useState(false);
  const { addEntry, updateEntry, getEntry } = useJournalStore();
  const { t, language } = useI18n();
  
  const today = new Date().toISOString().split('T')[0];
  const todayFormatted = new Date().toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });

  useEffect(() => {
    // Set random quote on component mount
    const quotes = t.home.motivationalQuotes;
    setCurrentQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    
    // Load existing entry for today
    const existingEntry = getEntry(today);
    if (existingEntry) {
      setSentences(existingEntry.sentences);
    }

    // Preload sounds for better performance
    preloadSounds();
  }, [today, getEntry, t.home.motivationalQuotes]);

  const refreshQuote = () => {
    setIsRefreshing(true);
    
    // 立即切换内容，不等待动画
    const quotes = t.home.motivationalQuotes;
    const currentIndex = quotes.indexOf(currentQuote);
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * quotes.length);
    } while (newIndex === currentIndex && quotes.length > 1);
    setCurrentQuote(quotes[newIndex]);
    setQuoteKey(prev => prev + 1); // 触发新的打字动画
    
    // 保持旋转动画效果，但不影响内容切换
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };

  const handleSentenceChange = (index: number, value: string) => {
    if (value.length <= 40) {
      const newSentences = [...sentences] as [string, string, string];
      newSentences[index] = value;
      setSentences(newSentences);
    }
  };

  const handleSave = () => {
    const hasContent = sentences.some(sentence => sentence.trim().length > 0);
    
    if (!hasContent) {
      toast.error(t.home.fillAtLeastOne);
      return;
    }

    const existingEntry = getEntry(today);
    const isFirstTime = !existingEntry;
    
    if (existingEntry) {
      updateEntry(today, sentences);
      toast.success(t.home.updated);
      // Play sound effect for updates
      playDiarySaveSound();
    } else {
      addEntry(today, sentences);
      toast.success(t.home.saved);
      setIsFirstTimeToday(isFirstTime);
      setShowCelebration(true);
      // Sound will be played by CelebrationModal for first time entries
    }
  };

  const filledCount = sentences.filter(s => s.trim().length > 0).length;

  return (
    <div className="p-4 space-y-6 page-slide-in">
      {/* Date Header */}
      <div className="text-center py-4 fade-in">
        <h1 className="text-lg font-medium text-gray-800">{todayFormatted}</h1>
      </div>

      {/* Daily Quote Banner */}
      <div className="bg-gradient-to-r from-orange-400 to-orange-500 rounded-2xl p-6 text-center text-white shadow-lg relative card-hover-enhanced gradient-shift fade-in-delay-1">
        <Quote className="mx-auto mb-3 float" size={24} />
        <div className="text-lg font-medium mb-3 min-h-[3rem] flex items-center justify-center">
          {currentQuote && (
            <TypewriterText
              key={quoteKey}
              text={currentQuote}
              speed={60}
              delay={200}
              className="text-center"
            />
          )}
        </div>
        <button
          onClick={refreshQuote}
          className={cn(
            "absolute top-4 right-4 p-2 rounded-full hover:bg-white/20 transition-all duration-300 button-press-enhanced",
            isRefreshing ? "spin-refresh" : "hover:scale-110"
          )}
          title={t.home.refreshQuote}
          disabled={isRefreshing}
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Three Sentence Input Section */}
      <div className="space-y-4 fade-in-delay-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <span className="wiggle">✏️</span> {t.home.todayThreeSentences}
          </h2>
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={cn(
                    "w-3 h-3 rounded-full transition-all duration-300",
                    i <= filledCount ? "bg-orange-500 scale-110" : "bg-gray-300"
                  )}
                />
              ))}
            </div>
            <span className={cn(
              "text-sm text-gray-500 count-up font-medium",
              filledCount > 0 ? "text-orange-600" : ""
            )}>
              {filledCount}/3
            </span>
          </div>
        </div>
        
        {sentences.map((sentence, index) => (
          <div key={index} className={cn(
            "space-y-2 slide-in-up",
            `fade-in-delay-${index + 1}`
          )}>
            <textarea
              value={sentence}
              onChange={(e) => handleSentenceChange(index, e.target.value)}
              placeholder={t.home.placeholders[index]}
              className={cn(
                "w-full p-4 border-2 rounded-xl resize-none transition-all duration-300 input-focus",
                "focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100",
                sentence.trim().length > 0 
                  ? "border-orange-300 bg-orange-50 shadow-sm" 
                  : "border-gray-200 bg-white hover:border-gray-300"
              )}
              rows={3}
              maxLength={40}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{t.home.sentenceLabel.replace('{index}', (index + 1).toString())}</span>
              <span className={cn(
                "transition-colors",
                sentence.length > 35 ? "text-orange-500 font-medium" : ""
              )}>
                {sentence.length}/40
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className={cn(
          "w-full bg-gradient-to-r from-orange-400 to-orange-500 text-white py-4 rounded-xl font-semibold text-lg shadow-lg transition-all duration-300 flex items-center justify-center gap-2 min-h-[44px] fade-in-delay-3 button-press-enhanced",
          "hover:shadow-xl hover:scale-105 active:scale-95 hover:from-orange-500 hover:to-orange-600",
          filledCount > 0 ? "pulse" : ""
        )}
      >
        <Save size={20} className={filledCount > 0 ? "bounce" : ""} />
        {t.home.save}
      </button>

      {/* Celebration Modal */}
      {showCelebration && (
        <CelebrationModal
           isOpen={showCelebration}
           isFirstTime={isFirstTimeToday}
           title={isFirstTimeToday ? '太棒了！' : '更新成功！'}
           message={isFirstTimeToday ? '你完成了今天的日记！' : '日记已更新'}
           onClose={() => setShowCelebration(false)}
         />
      )}

    </div>
  );
}