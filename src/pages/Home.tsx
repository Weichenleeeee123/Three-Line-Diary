import { useState, useEffect } from 'react';
import { Save, Quote, RefreshCw, Camera, Image, X } from 'lucide-react';
import { toast } from 'sonner';
import useJournalStore from '@/hooks/useJournalStore';
// 移除冗余的语音识别服务导入，统一使用VoiceInput组件中的tencentASR
import { useI18n } from '@/hooks/useI18n';
import { cn } from '@/lib/utils';
import TypewriterText from '@/components/TypewriterText';
import CelebrationModal from '@/components/CelebrationModal';
import { VoiceInput } from '@/components/VoiceInput';
import { playDiarySaveSound, preloadSounds } from '@/services/soundService';
import { compressImage, validateImageFile, validateImageSize, selectImage } from '@/utils/imageUtils';


export default function Home() {
  const [sentences, setSentences] = useState<[string, string, string]>(['', '', '']);
  const [currentQuote, setCurrentQuote] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [quoteKey, setQuoteKey] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isFirstTimeToday, setIsFirstTimeToday] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
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
      setSelectedImage(existingEntry.image || null);
    }

    // Preload sounds for better performance
    preloadSounds();
    
    // 麦克风权限现在由VoiceInput组件统一管理，无需在此处重复请求
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

  const handleImageSelect = async () => {
    try {
      setIsProcessingImage(true);
      const file = await selectImage();
      
      // 验证文件
      if (!validateImageFile(file)) {
        toast.error(t.home.photoFormatError);
        return;
      }
      
      if (!validateImageSize(file)) {
        toast.error(t.home.photoTooLarge);
        return;
      }
      
      // 压缩图片
      const compressedImage = await compressImage(file);
      setSelectedImage(compressedImage);
      toast.success(t.home.photoAdded);
    } catch (error) {
      if (error instanceof Error && error.message !== '用户取消选择') {
        toast.error(t.home.photoError);
      }
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleImageRemove = () => {
    setSelectedImage(null);
    toast.success(t.home.photoRemoved);
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
      updateEntry(today, sentences, selectedImage || undefined);
      toast.success(t.home.updated);
      // Play sound effect for updates
      playDiarySaveSound();
    } else {
      addEntry(today, sentences, selectedImage || undefined);
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
            <div className="relative">
              <textarea
                value={sentence}
                onChange={(e) => handleSentenceChange(index, e.target.value)}
                placeholder={t.home.placeholders[index]}
                className={cn(
                  "w-full p-4 pr-12 border-2 rounded-xl resize-none transition-all duration-300 input-focus",
                  "focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100",
                  sentence.trim().length > 0 
                    ? "border-orange-300 bg-orange-50 shadow-sm" 
                    : "border-gray-200 bg-white hover:border-gray-300"
                )}
                rows={3}
                maxLength={40}
              />
              <div className="absolute top-4 right-2 z-30">
                <VoiceInput
                  onTranscriptConfirm={(text) => {
                    const newText = sentence ? sentence + ' ' + text : text;
                    if (newText.length <= 40) {
                      handleSentenceChange(index, newText);
                    } else {
                      toast.error(t?.voiceInput?.contentTooLong || '内容超出40字限制，请缩短语音输入');
                    }
                  }}
                  placeholder={`点击开始语音输入${t.home.placeholders[index]}`}
                />
              </div>
            </div>
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

      {/* Photo Section */}
      <div className="space-y-4 fade-in-delay-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <span className="wiggle">📷</span> {t.home.addPhoto}
          </h3>
          {selectedImage && (
            <button
              onClick={handleImageRemove}
              className="text-red-500 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50"
              title={t.home.removePhoto}
            >
              <X size={18} />
            </button>
          )}
        </div>
        
        {selectedImage ? (
          <div className="relative group">
            <img
              src={selectedImage}
              alt="Selected photo"
              className="w-full h-48 object-contain rounded-xl shadow-lg transition-all duration-300 group-hover:shadow-xl bg-gray-50"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-xl flex items-center justify-center">
              <button
                onClick={handleImageSelect}
                disabled={isProcessingImage}
                className="opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white text-gray-800 px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 font-medium"
              >
                {isProcessingImage ? '处理中...' : t.home.changePhoto}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={handleImageSelect}
            disabled={isProcessingImage}
            className={cn(
              "w-full h-32 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:border-orange-400 hover:bg-orange-50 active:scale-95",
              isProcessingImage ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            )}
          >
            {isProcessingImage ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-gray-600">处理中...</span>
              </div>
            ) : (
              <>
                <Camera size={32} className="text-gray-400" />
                <span className="text-gray-600 font-medium">{t.home.addPhoto}</span>
                <span className="text-xs text-gray-500">{t?.appInfo?.description || '点击添加照片记录美好时刻'}</span>
              </>
            )}
          </button>
        )}
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