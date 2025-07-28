import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import useJournalStore from '@/hooks/useJournalStore';
import { toast } from 'sonner';

interface JournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
}

export default function JournalModal({ isOpen, onClose, date }: JournalModalProps) {
  const { getEntry, addEntry, updateEntry } = useJournalStore();
  const [sentences, setSentences] = useState(['', '', '']);
  const [isEditing, setIsEditing] = useState(false);

  const existingEntry = getEntry(date);

  useEffect(() => {
    if (isOpen && date) {
      if (existingEntry) {
        setSentences(existingEntry.sentences);
        setIsEditing(false);
      } else {
        setSentences(['', '', '']);
        setIsEditing(true);
      }
    }
  }, [isOpen, date, existingEntry]);

  const handleSave = () => {
    const filledSentences = sentences.filter(s => s.trim().length > 0);
    
    if (filledSentences.length === 0) {
      toast.error('请至少填写一句话');
      return;
    }

    if (existingEntry) {
      updateEntry(date, sentences as [string, string, string]);
      toast.success('日记已更新');
    } else {
      addEntry(date, sentences as [string, string, string]);
      toast.success('日记已保存');
    }
    
    setIsEditing(false);
  };

  const handleClose = () => {
    setIsEditing(false);
    onClose();
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
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              {existingEntry ? '查看日记' : '新建日记'}
            </h2>
            <p className="text-sm text-gray-500">{formatDate(date)}</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Three Sentences */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                今天发生了什么？
              </label>
              {isEditing ? (
                <textarea
                  value={sentences[0]}
                  onChange={(e) => setSentences([e.target.value, sentences[1], sentences[2]])}
                  placeholder="记录今天发生的事情..."
                  className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  rows={3}
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg min-h-[80px] flex items-center">
                  <p className="text-gray-700">
                    {sentences[0] || '暂无记录'}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                今天的感受如何？
              </label>
              {isEditing ? (
                <textarea
                  value={sentences[1]}
                  onChange={(e) => setSentences([sentences[0], e.target.value, sentences[2]])}
                  placeholder="分享今天的心情和感受..."
                  className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  rows={3}
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg min-h-[80px] flex items-center">
                  <p className="text-gray-700">
                    {sentences[1] || '暂无记录'}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                今天学到了什么？
              </label>
              {isEditing ? (
                <textarea
                  value={sentences[2]}
                  onChange={(e) => setSentences([sentences[0], sentences[1], e.target.value])}
                  placeholder="记录今天的收获和学习..."
                  className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  rows={3}
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg min-h-[80px] flex items-center">
                  <p className="text-gray-700">
                    {sentences[2] || '暂无记录'}
                  </p>
                </div>
              )}
            </div>
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
                  保存
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-3 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex-1 bg-orange-500 text-white py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors"
                >
                  编辑
                </button>
                <button
                  onClick={handleClose}
                  className="px-6 py-3 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  关闭
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}