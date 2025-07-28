import React, { useEffect, useState } from 'react';
import { CheckCircle, Heart, Star, Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { playDiarySaveSound } from '@/services/soundService';

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  isFirstTime?: boolean;
}

export default function CelebrationModal({ 
  isOpen, 
  onClose, 
  title = "太棒了！", 
  message = "今日记录已保存",
  isFirstTime = false 
}: CelebrationModalProps) {
  const [showAnimation, setShowAnimation] = useState(false);
  const [showHearts, setShowHearts] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // 播放音效（仅在首次时播放，避免重复）
      if (isFirstTime) {
        playDiarySaveSound();
      }
      
      // 触发震动
      if (navigator.vibrate) {
        navigator.vibrate(isFirstTime ? [200, 100, 200, 100, 200] : [200, 100, 200]);
      }
      
      // 延迟显示动画
      setTimeout(() => {
        setShowAnimation(true);
        setShowHearts(true);
      }, 100);
      
      // 自动关闭爱心效果
      setTimeout(() => {
        setShowHearts(false);
      }, 2500);
      
      // 如果不是首次，自动关闭弹窗
      if (!isFirstTime) {
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } else {
      setShowAnimation(false);
      setShowHearts(false);
    }
  }, [isOpen, isFirstTime, onClose]);



  if (!isOpen) return null;

  return (
    <>
      {/* 背景遮罩 - 限制在手机屏幕内 */}
      <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
        {/* 飘浮的爱心效果 */}
        {showHearts && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-bounce"
                style={{
                  left: `${20 + Math.random() * 60}%`,
                  top: `${20 + Math.random() * 60}%`,
                  animationDelay: `${Math.random() * 1.5}s`,
                  animationDuration: `${1.5 + Math.random() * 1}s`,
                }}
              >
                {i % 3 === 0 ? (
                  <Heart size={16 + Math.random() * 8} className="text-red-400 fill-current" />
                ) : i % 3 === 1 ? (
                  <Star size={12 + Math.random() * 6} className="text-yellow-400 fill-current" />
                ) : (
                  <Sparkles size={14 + Math.random() * 6} className="text-orange-400" />
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* 弹窗内容 */}
        <div className={cn(
          "bg-white rounded-3xl p-6 max-w-sm w-full mx-4 text-center relative transform transition-all duration-500 shadow-2xl",
          showAnimation ? "scale-100 opacity-100 translate-y-0" : "scale-75 opacity-0 translate-y-4"
        )}>
          {/* 关闭按钮 - 仅在首次显示 */}
          {isFirstTime && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          )}
          
          {/* 成功图标 */}
          <div className={cn(
            "w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center relative",
            "bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg",
            showAnimation ? "animate-bounce" : ""
          )}>
            <CheckCircle size={36} className="text-white" />
            
            {/* 脉冲效果 */}
            <div className={cn(
              "absolute inset-0 rounded-full bg-green-300 opacity-30",
              showAnimation ? "animate-ping" : ""
            )} />
          </div>
          
          {/* 标题 */}
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {title}
          </h2>
          
          {/* 消息 */}
          <p className="text-gray-600 mb-4">
            {message}
          </p>
          
          {/* 额外的首次提示 */}
          {isFirstTime && (
            <div className="bg-orange-50 rounded-xl p-4 mb-4">
              <p className="text-orange-700 text-sm">
                🎉 恭喜你开始了记录之旅！坚持下去，你会发现生活中更多美好的瞬间。
              </p>
            </div>
          )}
          
          {/* 继续按钮 - 仅在首次显示 */}
          {isFirstTime && (
            <button
              onClick={onClose}
              className={cn(
                "w-full bg-gradient-to-r from-green-400 to-emerald-500 text-white py-3 rounded-xl font-semibold text-lg shadow-lg transition-all duration-300",
                "hover:shadow-xl hover:scale-105 active:scale-95"
              )}
            >
              继续记录
            </button>
          )}
        </div>
      </div>
    </>
  );
}