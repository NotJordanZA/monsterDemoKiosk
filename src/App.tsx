import React, { useState, useCallback } from 'react';
import { StreamDiffusionParams, TooltipHint } from './types';
import StreamDiffusionInterface from './components/StreamDiffusionInterface';
import TooltipHints from './components/TooltipHints';
import MonsterLogo from './components/MonsterLogo';

const TOOLTIP_HINTS: TooltipHint[] = [
  { id: 'batman', text: "Try entering 'Batman'", type: 'prompt' },
  { id: 'cyberpunk', text: "Try 'cyberpunk city at night'", type: 'prompt' },
  { id: 'dragon', text: "How about 'fire-breathing dragon'?", type: 'prompt' },
  { id: 'intensity-low', text: "Lower intensity = subtle effect", type: 'general' },
  { id: 'intensity-high', text: "Higher intensity = stronger effect", type: 'general' },
];

const App: React.FC = () => {
  const [currentParams, setCurrentParams] = useState<StreamDiffusionParams>({
    prompt: '',
    steps: 20
  });
  const [lastSent, setLastSent] = useState<string>('');

  const handleParamsChange = useCallback((params: StreamDiffusionParams) => {
    setCurrentParams(params);
  }, []);

  const handleSend = useCallback(async (params: StreamDiffusionParams) => {
    const invertedSteps = 66 - params.steps;
    const dataToSend = { ...params, steps: invertedSteps };
    console.log('🎯 Sending transformation data:', dataToSend);
    try {
      if (window.electronAPI) {
        console.log('✅ ElectronAPI is available');
        const result = await window.electronAPI.sendStreamDiffusionData(dataToSend);
        console.log('📤 Result from Electron:', result);
        if (result.success) {
          setLastSent(`${params.prompt} (intensity: ${Math.round((params.steps / 65) * 100)}%)`);
          console.log('✅ Transformation data sent successfully');
        } else {
          console.error('❌ Failed to send transformation data:', result.error);
        }
      } else {
        console.error('❌ ElectronAPI is not available');
      }
    } catch (error) {
      console.error('💥 Error sending transformation data:', error);
    }
  }, []);

  return (
    <div className="min-h-screen bg-cyber-dark flex flex-col relative overflow-hidden">
      {/* Header with Monster Logo */}
      <div className="flex justify-center py-8">
        <MonsterLogo />
      </div>

      {/* Main Interface */}
      <div className="flex-1 flex items-center justify-center px-8">
        <div className="w-full max-w-4xl">
          <StreamDiffusionInterface
            params={currentParams}
            onParamsChange={handleParamsChange}
            onSend={handleSend}
          />
        </div>
      </div>

      {/* Bottom Section with Tooltips */}
      <div className="pb-8 px-8">
        <div className="max-w-4xl mx-auto">
          <TooltipHints hints={TOOLTIP_HINTS} />
          
          {/* Last Sent Status */}
          {lastSent && (
            <div className="text-center mt-6">
              <div className="text-cyber-green text-sm matrix-text neon-glow-green">
                [LAST_TRANSMISSION]: {lastSent}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;