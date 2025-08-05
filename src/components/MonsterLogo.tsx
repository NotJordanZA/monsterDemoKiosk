import React from 'react';

// Use public directory path for the logo
const monsterLogoPath = '/monster-logo.png';

const MonsterLogo: React.FC = () => {
  return (
    <div className="flex items-center justify-center">
      <div className="relative">
        {/* Main logo container */}
        <div className="bg-monster-dark rounded-2xl p-6 border-2 border-monster-green monster-glow-strong">
          {/* Monster Energy Logo Image */}
          <div className="flex justify-center">
            <img 
              src={monsterLogoPath} 
              alt="Monster Energy"
              className="h-24 w-auto object-contain"
            />
          </div>
          
          {/* Subtitle */}
          <div className="text-center mt-4">
            <div className="text-monster-silver text-lg font-medium">
              Real-Time Transformation Demo
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonsterLogo;