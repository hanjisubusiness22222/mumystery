'use client';

import React, { useState } from 'react';
import { CHARACTERS, GM_CHARACTER } from '@/data/characters';
import { CharacterData, CharacterId } from '@/types/game';
import { Shield, Users, Sparkles, Lock } from 'lucide-react';

interface LobbyViewProps {
  roomCode: string;
  playerCount: 6 | 7;
  onChangeRoomCode: (code: string) => void;
  onChangePlayerCount: (count: 6 | 7) => void;
  onSelectCharacter: (charId: CharacterId) => void;
}

export default function LobbyView({
  roomCode,
  playerCount,
  onChangeRoomCode,
  onChangePlayerCount,
  onSelectCharacter
}: LobbyViewProps) {
  const [inputCode, setInputCode] = useState(roomCode || '1889');
  const [confirmChar, setConfirmChar] = useState<CharacterData | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  // 캐릭터별 전용 비밀번호 매핑 (A, B, C, D, E, F, G: 111~117 / GM: 0000)
  const CHARACTER_PINS: Record<CharacterId, string> = {
    annie: '111',
    benny: '112',
    clive: '113',
    david: '114',
    ernest: '115',
    florence: '116',
    grace: '117',
    gm: '0000',
  };

  const handleOpenPinModal = (char: CharacterData) => {
    setConfirmChar(char);
    setPinInput('');
    setPinError('');
  };

  const handleVerifyAndEnter = () => {
    if (!confirmChar) return;
    const correctPin = CHARACTER_PINS[confirmChar.id];
    if (pinInput.trim() === correctPin) {
      onSelectCharacter(confirmChar.id);
      setConfirmChar(null);
    } else {
      setPinError('비밀번호가 올바르지 않습니다.');
    }
  };

  const availableCharacters = CHARACTERS.filter(
    (c) => playerCount === 7 || !c.onlySevenPlayer
  );

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col justify-between p-4 pb-10">
      <div className="max-w-md mx-auto w-full space-y-6 pt-4">
        {/* 타이틀 & 공식 티저 포스터 배너 */}
        <div className="relative overflow-hidden rounded-2xl border border-amber-700/60 shadow-2xl bg-stone-950">
          <div className="relative h-64 w-full overflow-hidden">
            <img
              src="/teaser-poster.jpg"
              alt="옛날 옛적 뉴프론티어에서 공식 티저 포스터"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/45 to-transparent" />
          </div>
          <div className="relative -mt-16 p-5 text-center space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/90 border border-amber-600/60 text-amber-300 text-xs font-semibold shadow">
              <Sparkles className="w-3.5 h-3.5" /> 서부극 누아르 머더 미스터리
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-amber-100 drop-shadow">
              옛날 옛적 뉴프론티어에서
            </h1>
            <p className="text-xs text-stone-300 italic">
              Once Upon a Time in New Frontier · 모바일 디지털 수첩
            </p>
          </div>
        </div>

        {/* 방 코드 & 플레이 인원 설정 */}
        <div className="p-4 rounded-xl bg-stone-900/90 border border-stone-800 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-amber-300 mb-1">
                🏠 함께 플레이할 방 코드
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  placeholder="예: 1889"
                  maxLength={10}
                  className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-700 text-amber-200 font-mono font-bold text-sm focus:outline-none focus:border-amber-500"
                />
                <button
                  onClick={() => onChangeRoomCode(inputCode || '1889')}
                  className="px-3.5 py-2 rounded-lg bg-amber-700 hover:bg-amber-600 text-white font-semibold text-xs shrink-0 transition"
                >
                  방 적용
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-stone-800 flex items-center justify-between">
            <span className="text-xs text-stone-300 flex items-center gap-1.5 font-medium">
              <Users className="w-4 h-4 text-amber-400" /> 플레이 인원 설정
            </span>
            <div className="flex gap-1.5">
              <button
                onClick={() => onChangePlayerCount(6)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                  playerCount === 6
                    ? 'bg-amber-700 border-amber-500 text-white'
                    : 'bg-stone-950 border-stone-800 text-stone-400'
                }`}
              >
                6인 플레이
              </button>
              <button
                onClick={() => onChangePlayerCount(7)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                  playerCount === 7
                    ? 'bg-amber-700 border-amber-500 text-white'
                    : 'bg-stone-950 border-stone-800 text-stone-400'
                }`}
              >
                7인 플레이 (추천)
              </button>
            </div>
          </div>
        </div>

        {/* 캐릭터 선택 리스트 */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold text-amber-200 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-amber-400" /> 당신이 맡은 캐릭터를 선택하세요
            </h2>
            <span className="text-[11px] text-stone-400">
              스포일러 주의 (본인 역할만 열람)
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {availableCharacters.map((char) => (
              <button
                key={char.id}
                onClick={() => handleOpenPinModal(char)}
                className={`w-full text-left p-3.5 rounded-xl bg-gradient-to-r ${char.colorClass} border border-stone-700/80 hover:border-amber-500/80 transition shadow-md flex items-start gap-3`}
              >
                <div className="text-3xl bg-stone-950/60 w-12 h-12 rounded-xl flex items-center justify-center border border-stone-700/60 shrink-0">
                  {char.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-amber-100 text-sm">
                      [{char.initial}] {char.name}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-stone-950/70 text-amber-300 border border-amber-700/40 shrink-0">
                      {char.roleTitle}
                    </span>
                  </div>
                  <p className="text-xs text-stone-300 mt-1 line-clamp-2 leading-relaxed">
                    {char.publicIntro}
                  </p>
                </div>
              </button>
            ))}

            {/* 별도 게임 진행자(GM) 선택 버튼 */}
            <div className="pt-2">
              <button
                onClick={() => handleOpenPinModal(GM_CHARACTER)}
                className="w-full text-left p-3.5 rounded-xl bg-gradient-to-r from-stone-900 to-amber-950/40 border border-amber-600/60 hover:border-amber-400 transition shadow-lg flex items-center gap-3.5"
              >
                <div className="text-3xl bg-stone-950 w-12 h-12 rounded-xl flex items-center justify-center border border-amber-700/60 shrink-0">
                  🎩
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-amber-200 text-sm">
                      게임 진행자 (GM)
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950 border border-amber-600/60 text-amber-300 shrink-0 font-semibold">
                      진행 마스터
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 mt-0.5">
                    전체 진행 가이드 & 4대 관문 해금 컨트롤러 (비밀번호: 0000)
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 캐릭터 입장 전 전용 비밀번호 입력 및 스포일러 방지 모달 */}
      {confirmChar && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-amber-600/70 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-stone-950 border border-amber-700/60 flex items-center justify-center text-3xl">
              {confirmChar.emoji}
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-amber-100">
                [{confirmChar.initial}] {confirmChar.name}
              </h3>
              <p className="text-xs text-amber-400 font-medium">
                {confirmChar.roleTitle} 비밀 설정집 잠금 해제
              </p>
            </div>

            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-200 text-xs leading-relaxed text-left">
              <Lock className="w-3.5 h-3.5 inline mr-1 mb-0.5 text-rose-400" />
              타 플레이어의 비밀 설정집 열람을 방지하기 위해 <b>전용 3자리 비밀번호</b>가 필요합니다. 본인 캐릭터의 비밀번호를 입력해 주세요.
            </div>

            {/* 비밀번호 입력 폼 */}
            <div className="space-y-2 pt-1">
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleVerifyAndEnter();
                }}
                placeholder="비밀번호 3자리 입력 (예: 11X)"
                className="w-full text-center tracking-widest text-lg font-mono py-2.5 px-3 rounded-xl bg-stone-950 border border-stone-700 focus:border-amber-500 focus:outline-none text-amber-200 placeholder:text-stone-600 placeholder:text-xs placeholder:tracking-normal"
                autoFocus
              />
              {pinError && (
                <p className="text-xs font-semibold text-rose-400">
                  ⚠️ {pinError}
                </p>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setConfirmChar(null);
                  setPinInput('');
                  setPinError('');
                }}
                className="flex-1 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold"
              >
                취소
              </button>
              <button
                onClick={handleVerifyAndEnter}
                className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-extrabold"
              >
                확인 및 입장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
