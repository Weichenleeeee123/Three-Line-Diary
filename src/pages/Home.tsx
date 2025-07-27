import { useState, useEffect } from 'react';
import { Save, Quote } from 'lucide-react';
import { toast } from 'sonner';
import useJournalStore from '@/hooks/useJournalStore';
import { cn } from '@/lib/utils';

const motivationalQuotes = [
  "今天的心情如何呢？ 😊",
  "记录生活，感受成长 🌱",
  "每一天都是新的开始 ✨",
  "用三句话记录美好 📝",
  "简单记录，深度思考 💭",
  "今天又是充满可能的一天 🌟",
  "用文字捕捉生活的美好 🎨",
  "三句话，无限可能 🚀"
];

const placeholders = [
  "今天做了什么？",
  "感受如何？",
  "明天计划？"
];

export default function Home() {
  const [sentences, setSentences] = useState<[string, string, string]>(['', '', '']);
  const [currentQuote, setCurrentQuote] = useState('');
  const { addEntry, updateEntry, getEntry } = useJournalStore();
  
  const today = new Date().toISOString().split('T')[0];
  const todayFormatted = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });

  useEffect(() => {
    // Set daily quote based on date
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    setCurrentQuote(motivationalQuotes[dayOfYear % motivationalQuotes.length]);
    
    // Load existing entry for today
    const existingEntry = getEntry(today);
    if (existingEntry) {
      setSentences(existingEntry.sentences);
    }
  }, [today, getEntry]);

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
      toast.error('请至少填写一句话');
      return;
    }

    const existingEntry = getEntry(today);
    if (existingEntry) {
      updateEntry(today, sentences);
      toast.success('日记已更新！');
    } else {
      addEntry(today, sentences);
      toast.success('日记已保存！');
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
      <div className="bg-gradient-to-r from-orange-400 to-orange-500 rounded-2xl p-6 text-center text-white shadow-lg">
        <Quote className="mx-auto mb-3" size={24} />
        <p className="text-lg font-medium">{currentQuote}</p>
      </div>

      {/* Three Sentence Input Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            ✏️ 今日三句话
          </h2>
          <span className="text-sm text-gray-500">{filledCount}/3</span>
        </div>
        
        {sentences.map((sentence, index) => (
          <div key={index} className="space-y-2">
            <textarea
              value={sentence}
              onChange={(e) => handleSentenceChange(index, e.target.value)}
              placeholder={placeholders[index]}
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
              <span>第{index + 1}句</span>
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
        保存今日记录
      </button>

      {/* Recent Entries Preview */}
      <div className="mt-8">
        <h3 className="text-md font-semibold text-gray-800 mb-3">📖 最近记录</h3>
        <RecentEntries />
      </div>
    </div>
  );
}

function RecentEntries() {
  const { entries } = useJournalStore();
  const recentEntries = [...entries]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);

  if (recentEntries.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>还没有记录，开始写下第一篇日记吧！</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {recentEntries.map((entry) => {
        const date = new Date(entry.date).toLocaleDateString('zh-CN', {
          month: 'short',
          day: 'numeric'
        });
        const filledSentences = entry.sentences.filter(s => s.trim().length > 0);
        
        return (
          <div key={entry.id} className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">{date}</span>
              <span className="text-xs text-gray-500">{filledSentences.length}/3</span>
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
  );
}