import { useState, useEffect } from 'react';
import { Save, Quote, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import useJournalStore from '@/hooks/useJournalStore';
import { useI18n } from '@/hooks/useI18n';
import { cn } from '@/lib/utils';

export default function Home() {
  const [sentences, setSentences] = useState<[string, string, string]>(['', '', '']);
  const [currentQuote, setCurrentQuote] = useState('');
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
  }, [today, getEntry, t.home.motivationalQuotes]);

  const refreshQuote = () => {
    const quotes = t.home.motivationalQuotes;
    const currentIndex = quotes.indexOf(currentQuote);
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * quotes.length);
    } while (newIndex === currentIndex && quotes.length > 1);
    setCurrentQuote(quotes[newIndex]);
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
    if (existingEntry) {
      updateEntry(today, sentences);
      toast.success(t.home.updated);
    } else {
      addEntry(today, sentences);
      toast.success(t.home.saved);
    }
  };

  const filledCount = sentences.filter(s => s.trim().length > 0).length;

  return (
    <div className="p-4 space-y-6">
      {/* Date Header */}
      <div className="text-center py-4">
        <h1 className="text-lg font-medium text-gray-800">{todayFormatted}</h1>
      </div>

      {/* Daily Quote Banner */}
      <div className="bg-gradient-to-r from-orange-400 to-orange-500 rounded-2xl p-6 text-center text-white shadow-lg relative">
        <Quote className="mx-auto mb-3" size={24} />
        <p className="text-lg font-medium mb-3">{currentQuote}</p>
        <button
          onClick={refreshQuote}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/20 transition-colors"
          title={t.home.refreshQuote}
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Three Sentence Input Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            ✏️ {t.home.todayThreeSentences}
          </h2>
          <span className="text-sm text-gray-500">{filledCount}/3</span>
        </div>
        
        {sentences.map((sentence, index) => (
          <div key={index} className="space-y-2">
            <textarea
              value={sentence}
              onChange={(e) => handleSentenceChange(index, e.target.value)}
              placeholder={t.home.placeholders[index]}
              className={cn(
                "w-full p-4 border-2 rounded-xl resize-none transition-colors",
                "focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100",
                sentence.trim().length > 0 
                  ? "border-orange-300 bg-orange-50" 
                  : "border-gray-200 bg-white"
              )}
              rows={3}
              maxLength={40}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{t.home.sentenceLabel.replace('{index}', (index + 1).toString())}</span>
              <span>{sentence.length}/40</span>
            </div>
          </div>
        ))}
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className="w-full bg-gradient-to-r from-orange-400 to-orange-500 text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 min-h-[44px]"
      >
        <Save size={20} />
        {t.home.save}
      </button>


    </div>
  );
}