import React from 'react';
import { Sidebar } from './sidebar';
import { LandingPage } from '@/app/landing/page';
import { useAccount } from 'wagmi';

interface MainSectionProps {
  children: React.ReactNode;
}

const MainSection: React.FC<MainSectionProps> = ({ children }) => {

  const { isConnected } = useAccount();
  return (
    <main  className="min-h-[calc(100vh-118px)]">
      {isConnected ? (
    
          <div className="flex-grow flex">
            <Sidebar />
            {children}
          </div>
        
      ) : (
        <LandingPage />
      )}
    </main>
  );
};

export default MainSection;