'use client';

import React from 'react';
import { CharacterData } from '@/types/game';

interface CharacterAvatarProps {
  character: Pick<CharacterData, 'emoji' | 'name' | 'avatarUrl'>;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<CharacterAvatarProps['size']>, string> = {
  xs: 'w-7 h-7 text-base rounded-lg',
  sm: 'w-9 h-9 text-xl rounded-xl',
  md: 'w-11 h-11 text-xl rounded-xl',
  lg: 'w-14 h-14 text-3xl rounded-xl',
  xl: 'w-16 h-16 text-4xl rounded-2xl',
  '2xl': 'w-24 h-24 text-5xl rounded-2xl'
};

/**
 * 캐릭터 유화 초상화가 등록되어 있으면 초상화를 렌더링하고,
 * 아직 초상화가 없는 캐릭터는 기존 이모지로 안전하게 폴백한다.
 */
export default function CharacterAvatar({
  character,
  size = 'md',
  className = ''
}: CharacterAvatarProps) {
  const sizeClass = SIZE_CLASSES[size];

  if (character.avatarUrl) {
    return (
      <div
        className={`${sizeClass} overflow-hidden bg-stone-950 border border-amber-700/60 shadow shrink-0 select-none ${className}`}
      >
        <img
          src={character.avatarUrl}
          alt={character.name}
          className="w-full h-full object-cover object-top"
        />
      </div>
    );
  }

  return (
    <div
      className={`${sizeClass} bg-stone-950/70 border border-stone-700/60 flex items-center justify-center shrink-0 select-none ${className}`}
    >
      <span>{character.emoji}</span>
    </div>
  );
}
