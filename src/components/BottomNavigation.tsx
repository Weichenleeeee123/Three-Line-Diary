import { Home, Calendar, BarChart3, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const navigationItems = [
  { path: '/', icon: Home, label: '首页' },
  { path: '/calendar', icon: Calendar, label: '日历' },
  { path: '/summary', icon: BarChart3, label: '总结' },
  { path: '/profile', icon: User, label: '我的' },
];

export default function BottomNavigation() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="bg-white border-t border-gray-200 px-4 py-2 flex-shrink-0">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navigationItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={cn(
                "flex flex-col items-center py-2 px-3 rounded-lg transition-colors min-w-[44px] min-h-[44px] justify-center",
                isActive 
                  ? "text-orange-500 bg-orange-50" 
                  : "text-gray-600 hover:text-orange-400"
              )}
            >
              <Icon size={20} className="mb-1" />
              <span className="text-xs font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}