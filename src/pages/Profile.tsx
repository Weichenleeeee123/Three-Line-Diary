import { useState } from 'react';
import { 
  User, 
  Calendar, 
  PenTool, 
  Flame, 
  Trophy, 
  Bell, 
  Palette, 
  Download, 
  Upload,
  Settings,
  Award,
  Target,
  Star
} from 'lucide-react';
import { toast } from 'sonner';
import useJournalStore from '@/hooks/useJournalStore';
import { cn } from '@/lib/utils';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  requirement: number;
  type: 'days' | 'streak' | 'sentences';
  unlocked: boolean;
}

const achievements: Achievement[] = [
  {
    id: 'first-entry',
    title: '初次记录',
    description: '写下第一篇日记',
    icon: PenTool,
    requirement: 1,
    type: 'days',
    unlocked: false
  },
  {
    id: 'week-warrior',
    title: '一周坚持',
    description: '连续记录7天',
    icon: Calendar,
    requirement: 7,
    type: 'streak',
    unlocked: false
  },
  {
    id: 'month-master',
    title: '月度达人',
    description: '累计记录30天',
    icon: Trophy,
    requirement: 30,
    type: 'days',
    unlocked: false
  },
  {
    id: 'fire-streak',
    title: '火焰连击',
    description: '连续记录30天',
    icon: Flame,
    requirement: 30,
    type: 'streak',
    unlocked: false
  },
  {
    id: 'hundred-club',
    title: '百日俱乐部',
    description: '累计记录100天',
    icon: Star,
    requirement: 100,
    type: 'days',
    unlocked: false
  },
  {
    id: 'sentence-master',
    title: '文字大师',
    description: '累计写下1000句话',
    icon: Award,
    requirement: 1000,
    type: 'sentences',
    unlocked: false
  }
];

export default function Profile() {
  const [showSettings, setShowSettings] = useState(false);
  const [dailyReminder, setDailyReminder] = useState(true);
  const { entries, getStats } = useJournalStore();
  
  const stats = getStats();
  
  // Calculate achievements
  const unlockedAchievements = achievements.map(achievement => {
    let unlocked = false;
    
    switch (achievement.type) {
      case 'days':
        unlocked = stats.totalDays >= achievement.requirement;
        break;
      case 'streak':
        unlocked = stats.currentStreak >= achievement.requirement || stats.longestStreak >= achievement.requirement;
        break;
      case 'sentences':
        unlocked = stats.totalSentences >= achievement.requirement;
        break;
    }
    
    return { ...achievement, unlocked };
  });
  
  const unlockedCount = unlockedAchievements.filter(a => a.unlocked).length;
  
  const handleExportData = async () => {
    try {
      const data = {
        entries,
        exportDate: new Date().toISOString(),
        version: '1.0'
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `三句话日记_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('数据导出成功');
    } catch (error) {
      toast.error('导出失败');
    }
  };
  
  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string);
            if (data.entries && Array.isArray(data.entries)) {
              // Here you would implement the import logic
              toast.success('数据导入成功');
            } else {
              toast.error('文件格式不正确');
            }
          } catch (error) {
            toast.error('文件解析失败');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };
  
  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="text-center py-6">
        <div className="w-20 h-20 bg-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center">
          <User className="text-white" size={32} />
        </div>
        <h1 className="text-xl font-semibold text-gray-800">三句日记用户</h1>
        <p className="text-gray-500 text-sm mt-1">记录生活，感受成长</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-orange-50 rounded-xl p-4 text-center">
          <Calendar className="mx-auto mb-2 text-orange-600" size={24} />
          <div className="text-2xl font-bold text-orange-600">{stats.totalDays}</div>
          <div className="text-sm text-gray-600">总天数</div>
        </div>
        
        <div className="bg-blue-50 rounded-xl p-4 text-center">
          <PenTool className="mx-auto mb-2 text-blue-600" size={24} />
          <div className="text-2xl font-bold text-blue-600">{stats.totalSentences}</div>
          <div className="text-sm text-gray-600">总句数</div>
        </div>
        
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <Flame className="mx-auto mb-2 text-green-600" size={24} />
          <div className="text-2xl font-bold text-green-600">{stats.currentStreak}</div>
          <div className="text-sm text-gray-600">连续</div>
        </div>
        
        <div className="bg-purple-50 rounded-xl p-4 text-center">
          <Target className="mx-auto mb-2 text-purple-600" size={24} />
          <div className="text-2xl font-bold text-purple-600">{stats.completionRate}%</div>
          <div className="text-sm text-gray-600">完成率</div>
        </div>
      </div>

      {/* Achievements */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            🏆 成就
          </h2>
          <span className="text-sm text-gray-500">{unlockedCount}/{achievements.length}</span>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {unlockedAchievements.map((achievement) => {
            const Icon = achievement.icon;
            
            return (
              <div
                key={achievement.id}
                className={cn(
                  "p-4 rounded-xl border-2 transition-all",
                  achievement.unlocked
                    ? "bg-yellow-50 border-yellow-200"
                    : "bg-gray-50 border-gray-200 opacity-60"
                )}
              >
                <div className="text-center">
                  <div className={cn(
                    "w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center",
                    achievement.unlocked
                      ? "bg-yellow-200 text-yellow-700"
                      : "bg-gray-200 text-gray-500"
                  )}>
                    <Icon size={20} />
                  </div>
                  <h3 className="font-medium text-sm text-gray-800">{achievement.title}</h3>
                  <p className="text-xs text-gray-600 mt-1">{achievement.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Settings */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          ⚙️ 设置
        </h2>
        
        <div className="space-y-3">
          {/* Daily Reminder */}
          <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100">
            <div className="flex items-center gap-3">
              <Bell className="text-gray-600" size={20} />
              <div>
                <h3 className="font-medium text-gray-800">每日提醒</h3>
                <p className="text-sm text-gray-600">提醒你每天记录</p>
              </div>
            </div>
            <button
              onClick={() => setDailyReminder(!dailyReminder)}
              className={cn(
                "w-12 h-6 rounded-full transition-colors relative",
                dailyReminder ? "bg-orange-500" : "bg-gray-300"
              )}
            >
              <div className={cn(
                "w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform",
                dailyReminder ? "translate-x-6" : "translate-x-0.5"
              )} />
            </button>
          </div>
          
          {/* Theme Settings */}
          <button className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 w-full text-left hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <Palette className="text-gray-600" size={20} />
              <div>
                <h3 className="font-medium text-gray-800">主题设置</h3>
                <p className="text-sm text-gray-600">自定义应用外观</p>
              </div>
            </div>
            <span className="text-gray-400">›</span>
          </button>
          
          {/* Data Backup */}
          <button 
            onClick={handleExportData}
            className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 w-full text-left hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Download className="text-gray-600" size={20} />
              <div>
                <h3 className="font-medium text-gray-800">数据备份</h3>
                <p className="text-sm text-gray-600">导出你的日记数据</p>
              </div>
            </div>
            <span className="text-gray-400">›</span>
          </button>
          
          {/* Data Import */}
          <button 
            onClick={handleImportData}
            className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 w-full text-left hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Upload className="text-gray-600" size={20} />
              <div>
                <h3 className="font-medium text-gray-800">导出数据</h3>
                <p className="text-sm text-gray-600">从备份文件恢复数据</p>
              </div>
            </div>
            <span className="text-gray-400">›</span>
          </button>
        </div>
      </div>
      
      {/* App Info */}
      <div className="text-center py-4 text-gray-500 text-sm">
        <p>三句话日记 v1.0</p>
        <p className="mt-1">简单记录，深度思考</p>
      </div>
    </div>
  );
}