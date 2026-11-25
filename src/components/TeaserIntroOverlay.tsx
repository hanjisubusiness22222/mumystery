'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Play, SkipForward } from 'lucide-react';

interface TeaserIntroOverlayProps {
  canSkip: boolean;
  onFinish: () => void;
}

export default function TeaserIntroOverlay({
  canSkip,
  onFinish
}: TeaserIntroOverlayProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [needsManualPlay, setNeedsManualPlay] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const tryPlay = async () => {
      try {
        await video.play();
        setNeedsManualPlay(false);
      } catch {
        setNeedsManualPlay(true);
      }
    };

    tryPlay();
  }, []);

  const handleManualPlay = async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      await video.play();
      setNeedsManualPlay(false);
    } catch {
      onFinish();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-3 sm:p-6">
      {/* 두 번째 방문부터 활성화되는 스킵 버튼 */}
      {canSkip && (
        <button
          onClick={onFinish}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-stone-900/90 hover:bg-amber-600 text-amber-200 hover:text-stone-950 border border-amber-500/70 text-xs sm:text-sm font-extrabold shadow-xl backdrop-blur transition"
        >
          <span>건너뛰기</span>
          <SkipForward className="w-4 h-4" />
        </button>
      )}

      {/* 티저 영상 */}
      <div className="relative w-full max-w-5xl flex items-center justify-center">
        <video
          ref={videoRef}
          src="/teaser.mp4"
          autoPlay
          muted
          playsInline
          preload="auto"
          onEnded={onFinish}
          onError={onFinish}
          className="w-full max-h-[82vh] rounded-2xl border border-amber-800/50 shadow-2xl object-contain bg-stone-950"
        />

        {/* 자동재생 차단 환경용 수동 재생 폴백 */}
        {needsManualPlay && (
          <button
            onClick={handleManualPlay}
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/70 rounded-2xl text-amber-200 hover:text-amber-100 transition"
          >
            <div className="w-16 h-16 rounded-full bg-amber-600 text-stone-950 flex items-center justify-center shadow-2xl">
              <Play className="w-8 h-8 fill-current ml-1" />
            </div>
            <span className="text-sm font-bold">터치하여 티저 영상 재생</span>
          </button>
        )}
      </div>
    </div>
  );
}
