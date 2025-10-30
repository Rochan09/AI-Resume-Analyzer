import { useEffect, useState } from 'react';

type AvatarState = 'idle' | 'speaking' | 'listening';

interface AIInterviewerAvatarProps {
  state?: AvatarState;
  name?: string;
}

export function AIInterviewerAvatar({ state = 'idle', name = 'AI Interviewer' }: AIInterviewerAvatarProps) {
  const [blink, setBlink] = useState(false);
  const [float, setFloat] = useState(0);

  // Random eye blinks
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
    }, 3000 + Math.random() * 2000);
    return () => clearInterval(blinkInterval);
  }, []);

  // Floating animation
  useEffect(() => {
    const floatInterval = setInterval(() => {
      setFloat(prev => (prev + 1) % 360);
    }, 50);
    return () => clearInterval(floatInterval);
  }, []);

  const floatY = Math.sin(float * Math.PI / 180) * 8;

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Name badge */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        <div className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-2xl border-2 border-white/30">
          {name}
        </div>
      </div>

      {/* Main robot container with 3D effect */}
      <div 
        className="relative w-72 h-80 mx-auto perspective-1000"
        style={{
          transform: `translateY(${floatY}px)`,
          transition: 'transform 0.1s ease-out',
        }}
      >
        {/* Glow effect */}
        <div 
          className={`
            absolute inset-0 rounded-full 
            ${state === 'speaking' ? 'animate-spin-slow bg-gradient-to-r from-cyan-500/40 via-blue-500/40 to-purple-500/40 blur-3xl' : ''}
            ${state === 'listening' ? 'bg-gradient-to-r from-green-500/30 via-emerald-500/30 to-teal-500/30 animate-pulse blur-3xl' : ''}
            ${state === 'idle' ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-2xl' : ''}
          `}
        />

        <div 
          className={`
            relative w-full h-full transform-gpu transition-all duration-500
            ${state === 'speaking' ? 'scale-105 animate-bounce-subtle' : ''}
            ${state === 'listening' ? 'scale-102' : ''}
          `}
          style={{
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Robot body container */}
          <div className="relative w-full h-full flex flex-col items-center justify-start z-10 pt-8">
            
            {/* Antenna */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex flex-col items-center">
              <div className="w-1 h-8 bg-gradient-to-b from-gray-400 to-gray-500 dark:from-gray-500 dark:to-gray-600 rounded-full" />
              <div className={`w-3 h-3 rounded-full ${state === 'speaking' ? 'bg-cyan-400 animate-ping' : state === 'listening' ? 'bg-green-400 animate-pulse' : 'bg-blue-400'} shadow-lg`}>
                <div className="absolute inset-0 rounded-full bg-white/60 animate-pulse" />
              </div>
            </div>

            {/* Robot Head (Helmet) */}
            <div className="relative w-48 h-48 rounded-full bg-gradient-to-br from-gray-100 via-white to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 shadow-2xl border-4 border-gray-300 dark:border-gray-500">
              
              {/* Helmet visor/screen - glossy black area */}
              <div className="absolute top-12 left-1/2 -translate-x-1/2 w-36 h-24 rounded-3xl bg-gradient-to-br from-gray-800 via-gray-900 to-black shadow-inner overflow-hidden border-2 border-cyan-500/30">
                
                {/* Screen reflection */}
                <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent" />
                
                {/* Glowing eyes */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-8">
                  {/* Left eye */}
                  <div className="relative">
                    <div className={`w-10 h-10 rounded-full ${blink ? 'scale-y-0' : 'scale-y-100'} transition-transform duration-150`}>
                      <div className={`
                        w-full h-full rounded-full 
                        ${state === 'speaking' ? 'bg-cyan-400 animate-pulse-fast' : state === 'listening' ? 'bg-green-400 animate-pulse' : 'bg-blue-400'}
                        shadow-[0_0_20px_rgba(56,189,248,0.8)]
                      `}>
                        <div className="absolute top-2 left-2 w-4 h-4 rounded-full bg-white/80" />
                        <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-white/40" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Right eye */}
                  <div className="relative">
                    <div className={`w-10 h-10 rounded-full ${blink ? 'scale-y-0' : 'scale-y-100'} transition-transform duration-150`}>
                      <div className={`
                        w-full h-full rounded-full 
                        ${state === 'speaking' ? 'bg-cyan-400 animate-pulse-fast' : state === 'listening' ? 'bg-green-400 animate-pulse' : 'bg-blue-400'}
                        shadow-[0_0_20px_rgba(56,189,248,0.8)]
                      `}>
                        <div className="absolute top-2 left-2 w-4 h-4 rounded-full bg-white/80" />
                        <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-white/40" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sound wave indicator when speaking */}
                {state === 'speaking' && (
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                    <div className="w-1 h-2 bg-cyan-400 rounded-full animate-sound-wave-1" />
                    <div className="w-1 h-3 bg-cyan-400 rounded-full animate-sound-wave-2" />
                    <div className="w-1 h-4 bg-cyan-400 rounded-full animate-sound-wave-3" />
                    <div className="w-1 h-3 bg-cyan-400 rounded-full animate-sound-wave-2" />
                    <div className="w-1 h-2 bg-cyan-400 rounded-full animate-sound-wave-1" />
                  </div>
                )}
              </div>

              {/* Side ear pieces */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4">
                <div className="w-8 h-12 rounded-l-full bg-gradient-to-br from-gray-400 to-gray-500 dark:from-gray-600 dark:to-gray-700 border-2 border-gray-500 dark:border-gray-600 shadow-lg">
                  <div className="absolute top-1/2 right-2 -translate-y-1/2 w-2 h-6 rounded-full bg-gray-600 dark:bg-gray-800" />
                </div>
              </div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4">
                <div className="w-8 h-12 rounded-r-full bg-gradient-to-br from-gray-400 to-gray-500 dark:from-gray-600 dark:to-gray-700 border-2 border-gray-500 dark:border-gray-600 shadow-lg">
                  <div className="absolute top-1/2 left-2 -translate-y-1/2 w-2 h-6 rounded-full bg-gray-600 dark:bg-gray-800" />
                </div>
              </div>

              {/* Top of helmet detail */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-8 rounded-t-full bg-gradient-to-b from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 border-2 border-gray-300 dark:border-gray-500" />
            </div>

            {/* Neck connector */}
            <div className="relative w-12 h-6 bg-gradient-to-b from-gray-400 to-gray-500 dark:from-gray-600 dark:to-gray-700 rounded-lg -mt-2 shadow-lg">
              <div className="absolute inset-1 flex gap-1 justify-center">
                <div className="w-1 h-full bg-gray-600 dark:bg-gray-800 rounded-full" />
                <div className="w-1 h-full bg-gray-600 dark:bg-gray-800 rounded-full" />
              </div>
            </div>

            {/* Body/Chest */}
            <div className="relative w-32 h-24 bg-gradient-to-br from-gray-100 via-white to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-3xl shadow-2xl border-4 border-gray-300 dark:border-gray-500 -mt-1">
              {/* Chest panel */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-16 rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 border-2 border-gray-400 dark:border-gray-600 shadow-inner">
                {/* Status lights */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 flex gap-2">
                  <div className={`w-2 h-2 rounded-full ${state === 'speaking' ? 'bg-cyan-400 shadow-[0_0_10px_rgba(56,189,248,0.8)]' : 'bg-gray-500'}`} />
                  <div className={`w-2 h-2 rounded-full ${state === 'listening' ? 'bg-green-400 shadow-[0_0_10px_rgba(34,197,94,0.8)]' : 'bg-gray-500'}`} />
                  <div className={`w-2 h-2 rounded-full ${state === 'idle' ? 'bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.8)]' : 'bg-gray-500'}`} />
                </div>
                
                {/* Power core */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${state === 'speaking' ? 'from-cyan-400 to-blue-500' : state === 'listening' ? 'from-green-400 to-emerald-500' : 'from-blue-400 to-purple-500'} shadow-[0_0_15px_rgba(96,165,250,0.6)] ${state === 'speaking' || state === 'listening' ? 'animate-pulse' : ''}`}>
                    <div className="absolute inset-2 rounded-full bg-white/30" />
                  </div>
                </div>
              </div>

              {/* Arms */}
              <div className="absolute left-0 top-4 -translate-x-8">
                <div className="w-6 h-16 bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 rounded-full border-2 border-gray-400 dark:border-gray-600 shadow-lg" />
              </div>
              <div className="absolute right-0 top-4 translate-x-8">
                <div className="w-6 h-16 bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 rounded-full border-2 border-gray-400 dark:border-gray-600 shadow-lg" />
              </div>
            </div>
          </div>

          {/* Floating particles when active */}
          {(state === 'speaking' || state === 'listening') && (
            <>
              <div className={`absolute top-1/4 left-1/4 w-2 h-2 rounded-full ${state === 'speaking' ? 'bg-cyan-400' : 'bg-green-400'} animate-float-1 blur-sm`} />
              <div className={`absolute top-1/3 right-1/4 w-3 h-3 rounded-full ${state === 'speaking' ? 'bg-blue-400' : 'bg-emerald-400'} animate-float-2 blur-sm`} />
              <div className={`absolute bottom-1/3 left-1/3 w-2 h-2 rounded-full ${state === 'speaking' ? 'bg-purple-400' : 'bg-teal-400'} animate-float-3 blur-sm`} />
            </>
          )}
        </div>
      </div>

      {/* Status indicator */}
      <div className="mt-8 flex items-center justify-center gap-3">
        <div className={`
          w-3 h-3 rounded-full 
          ${state === 'speaking' ? 'bg-cyan-500 shadow-[0_0_10px_rgba(56,189,248,0.8)] animate-pulse' : ''}
          ${state === 'listening' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)] animate-pulse' : ''}
          ${state === 'idle' ? 'bg-blue-400' : ''}
        `} />
        <span className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
          {state === 'speaking' && '🎙️ Speaking...'}
          {state === 'listening' && '👂 Listening...'}
          {state === 'idle' && '⚡ Ready'}
        </span>
      </div>
    </div>
  );
}
