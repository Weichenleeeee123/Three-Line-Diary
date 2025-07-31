import { Home, Calendar, BarChart3, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useI18n } from '@/hooks/useI18n';
import { useState } from 'react';

export default function BottomNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [clickedItem, setClickedItem] = useState<string | null>(null);
  
  const navigationItems = [
    { path: '/', icon: Home, label: t.navigation.home },
    { path: '/calendar', icon: Calendar, label: t.navigation.calendar },
    { path: '/summary', icon: BarChart3, label: t.navigation.summary },
    { path: '/profile', icon: User, label: t.navigation.profile },
  ];

  const handleNavClick = (path: string) => {
    setClickedItem(path);
    setTimeout(() => {
      navigate(path);
      setClickedItem(null);
    }, 150);
  };

  return (
    <div className="flex justify-center pb-6 px-4 flex-shrink-0">
      {/* 真正浮空的椭圆形导航栏 */}
      <div className="bg-white/70 backdrop-blur-sm rounded-full px-6 py-3 shadow-2xl border border-white/10 slide-in-up">
        <div className="flex items-center space-x-8">
          {navigationItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path;
            const isClicked = clickedItem === path;
            
            return (
              <button
                key={path}
                onClick={() => handleNavClick(path)}
                className={cn(
                  "flex flex-col items-center transition-all duration-300 min-w-[44px] min-h-[44px] justify-center relative group",
                  isActive 
                    ? "text-orange-500 scale-110" 
                    : "text-gray-400 hover:text-gray-600 hover:scale-105",
                  isClicked ? "button-press" : ""
                )}
              >
                {/* 活跃状态背景 */}
                {isActive && (
                  <div className="absolute inset-0 bg-orange-200/60 rounded-full scale-125 opacity-90 pulse" />
                )}
                
                <Icon 
                  size={22} 
                  className={cn(
                    "mb-1 transition-all duration-300 relative z-10",
                    isActive ? "icon-bounce" : "",
                    isClicked ? "scale-90" : ""
                  )} 
                />
                <span className={cn(
                  "text-xs font-medium transition-all duration-300 relative z-10",
                  isActive ? "text-glow font-semibold" : ""
                )}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}