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
    <div className="bg-white border-t border-gray-200 px-4 py-2 flex-shrink-0 slide-in-up">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navigationItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          const isClicked = clickedItem === path;
          
          return (
            <button
              key={path}
              onClick={() => handleNavClick(path)}
              className={cn(
                "flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-300 min-w-[44px] min-h-[44px] justify-center relative",
                isActive 
                  ? "text-orange-500 bg-orange-50 scale-105" 
                  : "text-gray-600 hover:text-orange-400 hover:bg-gray-50",
                isClicked ? "button-press" : ""
              )}
            >
              <Icon 
                size={20} 
                className={cn(
                  "mb-1 transition-all duration-300",
                  isActive ? "icon-bounce" : "",
                  isClicked ? "scale-90" : ""
                )} 
              />
              <span className={cn(
                "text-xs font-medium transition-all duration-300",
                isActive ? "text-glow" : ""
              )}>
                {label}
              </span>
              {isActive && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-orange-500 rounded-full pulse" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}