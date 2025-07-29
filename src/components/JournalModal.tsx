import { useState, useEffect } from 'react';
import { X, Camera, Save } from 'lucide-react';
import useJournalStore from '@/hooks/useJournalStore';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { VoiceInput } from './VoiceInput';
import { useI18n } from '../hooks/useI18n';
import WeatherIcon from './WeatherIcon';
import { getTodayWeather, WeatherCondition } from '../services/weatherService';

interface JournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
}

export default function JournalModal({ isOpen, onClose, date }: JournalModalProps) {
  const { getEntry, addEntry, updateEntry } = useJournalStore();
  const { t } = useI18n();
  const [sentences, setSentences] = useState(['', '', '']);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [weather, setWeather] = useState<WeatherCondition | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);

  const existingEntry = getEntry(date);

  useEffect(() => {
    if (isOpen && date) {
      if (existingEntry) {
        setSentences(existingEntry.sentences);
        setSelectedImage(existingEntry.image || null);
        setWeather(existingEntry.weather || null);
        setIsEditing(false);
      } else {
        setSentences(['', '', '']);
        setSelectedImage(null);
        setWeather(null);
        setIsEditing(true);
        // 自动获取今日天气
        loadTodayWeather();
      }
    }
  }, [isOpen, date, existingEntry]);

  const loadTodayWeather = async () => {
    try {
      setIsLoadingWeather(true);
      const weatherData = await getTodayWeather();
      setWeather(weatherData.condition);
    } catch (error) {
      console.warn('Failed to load weather:', error);
      // 静默失败，不显示错误提示
    } finally {
      setIsLoadingWeather(false);
    }
  };

  const handleSave = () => {
    const filledSentences = sentences.filter(s => s.trim().length > 0);
    
    if (filledSentences.length === 0) {
        toast.error(t.journal.validation.atLeastOneSentence);
        return;
      }
      
      if (existingEntry) {
        updateEntry(date, sentences as [string, string, string], selectedImage || undefined, weather || undefined);
        toast.success(t.journal.messages.updated);
      } else {
        addEntry(date, sentences as [string, string, string], selectedImage || undefined, weather || undefined);
        toast.success(t.journal.messages.saved);
      }
    
    setIsEditing(false);
  };

  const handleClose = () => {
    setIsEditing(false);
    onClose();
  };

  const handleImageSelect = async () => {
    try {
      setIsProcessingImage(true);
      
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment';
      
      const file = await new Promise<File>((resolve, reject) => {
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) resolve(file);
          else reject(new Error('用户取消选择'));
        };
        input.click();
      });
      
      if (file.size > 5 * 1024 * 1024) {
          toast.error(t.journal.validation.imageTooLarge);
          return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64 = e.target?.result as string;
          setSelectedImage(base64);
          toast.success(t.journal.messages.photoAdded);
        };
        reader.readAsDataURL(file);
      } catch (error) {
        if (error instanceof Error && error.message !== t.journal.messages.userCancelled) {
          toast.error(t.journal.messages.photoProcessFailed);
        }
      } finally {
        setIsProcessingImage(false);
      }
    };
  
    const handleImageRemove = () => {
      setSelectedImage(null);
      toast.success(t.journal.messages.photoRemoved);
    };



  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                  {existingEntry ? t.journal.title.view : t.journal.title.new}
                </h2>
              <p className="text-sm text-gray-500">{formatDate(date)}</p>
            </div>
            {weather && (
              <div className="flex items-center gap-1">
                <WeatherIcon condition={weather} size={20} />
                {isLoadingWeather && (
                  <div className="w-3 h-3 border border-gray-300 border-t-orange-500 rounded-full animate-spin ml-1"></div>
                )}
              </div>
            )}
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          {/* Three Sentences */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.journal.questions.whatHappened}
                </label>
                {isEditing ? (
                  <div className="relative">
                    <textarea
                      value={sentences[0]}
                      onChange={(e) => setSentences([e.target.value, sentences[1], sentences[2]])}
                      placeholder={t.journal.placeholders.whatHappened}
                      className="w-full p-3 pr-12 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      rows={3}
                    />
                    <div className="absolute top-2 right-2 z-30">
                      <VoiceInput
                        onTranscriptConfirm={(text) => {
                          const newText = sentences[0] ? sentences[0] + ' ' + text : text;
                          setSentences([newText, sentences[1], sentences[2]]);
                        }}
                        placeholder={t.journal.voice.whatHappened}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-gray-50 rounded-lg min-h-[80px] flex items-center">
                    <p className="text-gray-700">
                      {sentences[0] || t.journal.noRecord}
                    </p>
                  </div>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.journal.questions.howDidYouFeel}
                </label>
                {isEditing ? (
                  <div className="relative">
                    <textarea
                      value={sentences[1]}
                      onChange={(e) => setSentences([sentences[0], e.target.value, sentences[2]])}
                      placeholder={t.journal.placeholders.howDidYouFeel}
                      className="w-full p-3 pr-12 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      rows={3}
                    />
                    <div className="absolute top-2 right-2 z-30">
                      <VoiceInput
                        onTranscriptConfirm={(text) => {
                          const newText = sentences[1] ? sentences[1] + ' ' + text : text;
                          setSentences([sentences[0], newText, sentences[2]]);
                        }}
                        placeholder={t.journal.voice.howDidYouFeel}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-gray-50 rounded-lg min-h-[80px] flex items-center">
                    <p className="text-gray-700">
                      {sentences[1] || t.journal.noRecord}
                    </p>
                  </div>
                )}
              </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.journal.questions.whatDidYouLearn}
                </label>
                {isEditing ? (
                  <div className="relative">
                    <textarea
                      value={sentences[2]}
                      onChange={(e) => setSentences([sentences[0], sentences[1], e.target.value])}
                      placeholder={t.journal.placeholders.whatDidYouLearn}
                      className="w-full p-3 pr-12 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      rows={3}
                    />
                    <div className="absolute top-2 right-2 z-30">
                      <VoiceInput
                        onTranscriptConfirm={(text) => {
                          const newText = sentences[2] ? sentences[2] + ' ' + text : text;
                          setSentences([sentences[0], sentences[1], newText]);
                        }}
                        placeholder={t.journal.voice.whatDidYouLearn}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-gray-50 rounded-lg min-h-[80px] flex items-center">
                    <p className="text-gray-700">
                      {sentences[2] || t.journal.noRecord}
                    </p>
                  </div>
                )}
              </div>
          </div>

          {/* Photo Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  📷 {t.journal.photo.title}
                </label>
                {selectedImage && isEditing && (
                  <button
                    onClick={handleImageRemove}
                    className="text-red-500 hover:text-red-600 transition-colors p-1 rounded"
                    title={t.journal.photo.remove}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            
            {selectedImage ? (
              <div className="space-y-3">
                <div className="relative group">
                  <img
                    src={selectedImage}
                    alt="Journal photo"
                    className="w-full h-40 object-contain rounded-lg shadow-sm bg-gray-100"
                  />
                  {isEditing && (
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-lg flex items-center justify-center">
                      <button
                          onClick={handleImageSelect}
                          disabled={isProcessingImage}
                          className="opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white text-gray-800 px-3 py-2 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 text-sm font-medium"
                        >
                          {isProcessingImage ? t.journal.photo.processing : t.journal.photo.change}
                        </button>
                    </div>
                  )}
                </div>
                

              </div>
            ) : (
              isEditing && (
                <button
                  onClick={handleImageSelect}
                  disabled={isProcessingImage}
                  className={cn(
                    "w-full h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 transition-all duration-300 hover:border-orange-400 hover:bg-orange-50 active:scale-95",
                    isProcessingImage ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                  )}
                >
                  {isProcessingImage ? (
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs text-gray-600">{t.journal.photo.processing}</span>
                    </div>
                  ) : (
                    <>
                      <Camera size={24} className="text-gray-400" />
                      <span className="text-sm text-gray-600">{t.journal.photo.add}</span>
                    </>
                  )}
                </button>
              )
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {isEditing ? (
              <>
                <button
                    onClick={handleSave}
                    className="flex-1 bg-orange-500 text-white py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Save size={18} />
                    {t.journal.actions.save}
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-3 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    {t.journal.actions.cancel}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex-1 bg-orange-500 text-white py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors"
                  >
                    {t.journal.actions.edit}
                  </button>
                  <button
                    onClick={handleClose}
                    className="px-6 py-3 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    {t.journal.actions.close}
                  </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}