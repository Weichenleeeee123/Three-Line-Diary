import { ReactNode } from 'react';
import BottomNavigation from './BottomNavigation';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-yellow-50 pb-20">
      <main className="max-w-md mx-auto bg-white min-h-screen shadow-lg">
        {children}
      </main>
      <BottomNavigation />
    </div>
  );
}