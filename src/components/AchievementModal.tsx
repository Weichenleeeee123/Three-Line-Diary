import React, { useEffect, useState } from 'react';
import { Trophy, X, Star, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { playAchievementSound } from '@/services/soundService';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  requirement: number;
  type: 'days' | 'streak' | 'sentences';
  unlocked: boolean;
}

interface AchievementModalProps {
  achievement: Achievement | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function AchievementModal({ achievement, isOpen, onClose }: AchievementModalProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [playAnimation, setPlayAnimation] = useState(false);

  useEffect(() => {
    if (isOpen && achievement) {
      // 播放音效
      playAchievementSound();
      
      // 触发震动
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }
      
      // 延迟显示动画
      setTimeout(() => {
        setPlayAnimation(true);
        setShowConfetti(true);
      }, 100);
      
      // 自动关闭彩带效果
      setTimeout(() => {
        setShowConfetti(false);
      }, 3000);
    } else {
      setPlayAnimation(false);
      setShowConfetti(false);
    }
  }, [isOpen, achievement]);



  if (!isOpen || !achievement) return null;

  const Icon = achievement.icon;

  return (
    <>
      {/* 背景遮罩 - 限制在手机屏幕内 */}
      <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        {/* 彩带效果 */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  "absolute w-2 h-8 opacity-80 animate-bounce",
                  i % 4 === 0 ? "bg-yellow-400" : 
                  i % 4 === 1 ? "bg-orange-400" : 
                  i % 4 === 2 ? "bg-red-400" : "bg-pink-400"
                )}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                  transform: `rotate(${Math.random() * 360}deg)`
                }}
              />
            ))}
          </div>
        )}
        
        {/* 弹窗内容 */}
        <div className={cn(
          "bg-white rounded-3xl p-8 max-w-sm w-full mx-4 text-center relative transform transition-all duration-500",
          playAnimation ? "scale-100 opacity-100" : "scale-75 opacity-0"
        )}>
          {/* 关闭按钮 */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
          
          {/* 成就图标 */}
          <div className={cn(
            "w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center relative",
            "bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg",
            playAnimation ? "animate-bounce" : ""
          )}>
            <Icon size={40} className="text-white" />
            
            {/* 闪光效果 */}
            <div className={cn(
              "absolute inset-0 rounded-full",
              playAnimation ? "animate-ping" : "",
              "bg-yellow-300 opacity-30"
            )} />
            
            {/* 星星装饰 */}
            <Sparkles 
              size={16} 
              className={cn(
                "absolute -top-2 -right-2 text-yellow-400",
                playAnimation ? "animate-pulse" : ""
              )} 
            />
            <Star 
              size={12} 
              className={cn(
                "absolute -bottom-1 -left-1 text-orange-400",
                playAnimation ? "animate-pulse" : ""
              )} 
            />
          </div>
          
          {/* 成就标题 */}
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            🎉 成就解锁！
          </h2>
          
          {/* 成就名称 */}
          <h3 className="text-xl font-semibold text-orange-600 mb-3">
            {achievement.title}
          </h3>
          
          {/* 成就描述 */}
          <p className="text-gray-600 mb-6">
            {achievement.description}
          </p>
          
          {/* 继续按钮 */}
          <button
            onClick={onClose}
            className={cn(
              "w-full bg-gradient-to-r from-orange-400 to-orange-500 text-white py-3 rounded-xl font-semibold text-lg shadow-lg transition-all duration-300",
              "hover:shadow-xl hover:scale-105 active:scale-95"
            )}
          >
            太棒了！
          </button>
        </div>
      </div>
    </>
  );
}