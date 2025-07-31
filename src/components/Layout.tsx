import { ReactNode } from 'react';
import BottomNavigation from './BottomNavigation';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-8">
      {/* 手机外框 */}
      <div className="relative">
        {/* 手机边框 */}
        <div className="w-[375px] h-[812px] bg-black rounded-[3rem] p-2 shadow-2xl">
          {/* 手机屏幕 */}
          <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden relative flex flex-col">
            {/* 状态栏 - 确保在手机屏幕内部 */}
            <div className="h-11 bg-white flex items-center justify-between px-6 text-sm font-medium text-black flex-shrink-0">
              <span>22:45</span>
              <div className="flex items-center space-x-1">
                <div className="flex space-x-1">
                  <div className="w-1 h-1 bg-black rounded-full"></div>
                  <div className="w-1 h-1 bg-black rounded-full"></div>
                  <div className="w-1 h-1 bg-black rounded-full"></div>
                  <div className="w-1 h-1 bg-black rounded-full"></div>
                </div>
                <svg className="w-6 h-4" viewBox="0 0 24 16" fill="none">
                  <path d="M2 4C2 2.89543 2.89543 2 4 2H20C21.1046 2 22 2.89543 22 4V12C22 13.1046 21.1046 14 20 14H4C2.89543 14 2 13.1046 2 12V4Z" stroke="currentColor" strokeWidth="1" fill="none"/>
                  <path d="M23 6V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <span>100%</span>
                <svg className="w-6 h-4" viewBox="0 0 24 16" fill="currentColor">
                  <path d="M2 4C2 2.89543 2.89543 2 4 2H20C21.1046 2 22 2.89543 22 4V12C22 13.1046 21.1046 14 20 14H4C2.89543 14 2 13.1046 2 12V4Z"/>
                  <path d="M23 6V10" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
            </div>
            
            {/* 应用内容区域 */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
              <main className="flex-1 bg-white overflow-auto pb-24">
                {children}
              </main>
              {/* 浮空导航栏 */}
              <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
                <div className="pointer-events-auto">
                  <BottomNavigation />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 手机按钮 */}
        <div className="absolute right-[-4px] top-[120px] w-1 h-8 bg-gray-800 rounded-l-sm"></div>
        <div className="absolute right-[-4px] top-[170px] w-1 h-12 bg-gray-800 rounded-l-sm"></div>
        <div className="absolute right-[-4px] top-[200px] w-1 h-12 bg-gray-800 rounded-l-sm"></div>
        <div className="absolute left-[-4px] top-[160px] w-1 h-16 bg-gray-800 rounded-r-sm"></div>
        
        {/* Footer Attribution - 放在手机边框下方 */}
        <div className="absolute top-[820px] left-1/2 transform -translate-x-1/2 text-center text-xs text-gray-600 space-y-1 w-[375px]">
          <div>Made in CodeBuddy | Powered by CloudBase</div>
          <div className="flex justify-center space-x-4">
            <a 
              href="https://mc.tencent.com/HRVjVcS5" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-orange-500 transition-colors underline"
            >
              CodeBuddy外链地址
            </a>
            <a 
              href="https://docs.cloudbase.net/ai/cloudbase-ai-toolkit/?from=csdn-hackathon-2025" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-orange-500 transition-colors underline"
            >
              CloudBase外链地址
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}