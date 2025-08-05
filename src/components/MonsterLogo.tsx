import React from 'react';

// Use public directory path for the logo
const monsterLogoPath = '/monster-logo.webp';

const MonsterLogo: React.FC = () => {
  return (
    <div className="flex items-center justify-center">
      <img 
        src={monsterLogoPath} 
        alt="Monster Energy"
        className="h-24 w-auto object-contain"
      />
    </div>
  );
};

export default MonsterLogo;