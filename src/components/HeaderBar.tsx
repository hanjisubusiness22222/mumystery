'use client';

import React, { useState } from 'react';
import { CharacterData, RoomState } from '@/types/game';
import { TIMETABLE_STEPS, GATE_PASSWORDS } from '@/data/timetable';
import { Lock, Unlock, Compass, Dices, HelpCircle, LogOut, Eye, EyeOff, RotateCcw } from 'lucide-react';

interface HeaderBarProps {
  character: CharacterData;
  room: RoomState;
  myDiceBonus: number;
  isCharacterLocked: boolean;
  onToggleCharacterLock: () => void;
  onLeaveCharacter: () => void;
  onResetRoom: () => void;
  onUnlockGate?: (gate: 0 | 1 | 2 | 3, password: string) => Promise<boolean>;
}

export default function HeaderBar({
  character,
  room,
  myDiceBonus,
  isCharacterLocked,
  onToggleCharacterLock,
  onLeaveCharacter,
  onResetRoom,
  onUnlockGate
}: HeaderBarProps) {
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showHostPasswords, setShowHostPasswords] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 bg-stone-950/95 backdrop-blur border-b border-amber-900/50 px-3 py-2.5 shadow-lg">
        <div className="max-w-md mx-auto flex items-center justify-between gap-2">
          {/* 좌측: 캐릭터 뱃지 & 잠금/변경 */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-2xl select-none">{character.emoji}</span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-amber-100 text-sm truncate">
                  {character.name}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950/90 text-amber-300 border border-amber-700/50 shrink-0">
                  방 {room.roomCode}
                </span>
              </div>
              <p className="text-[11px] text-stone-400 truncate">
                {character.roleTitle}
                {character.id !== 'gm' && character.faction !== 'neutral' && room.gate1Unlocked && (
                  <>
                    {' · '}
                    {character.faction === 'kill_subdue'
                      ? '💥 사살·제압파'
                      : '🛡️ 생존파'}
                  </>
                )}
              </p>
            </div>
          </div>

          {/* 우측: 추격 보너스 (중반 반전 해금 후에만 표시) & 타임테이블 가이드 */}
          <div className="flex items-center gap-1.5 shrink-0">
            {character.id !== 'gm' && room.gate1Unlocked && (
              <div
                className="flex items-center gap-1 px-2 py-1 rounded-md bg-amber-950/80 border border-amber-600/50 text-amber-200 text-xs font-semibold"
                title="후반전 결판 주사위 보너스 (기본 패시브 + 전용 아이템 개당 +1)"
              >
                <Dices className="w-3.5 h-3.5 text-amber-400" />
                <span>+{myDiceBonus}</span>
              </div>
            )}

            {/* 진행표 버튼: 오직 진행자(GM)에게만 노출 (일반 플레이어 화면에서는 완전 비노출) */}
            {character.id === 'gm' && (
              <button
                onClick={() => setShowGuideModal(true)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-950/80 hover:bg-amber-900 border border-amber-600/70 text-amber-200 text-xs font-bold transition shadow"
              >
                <Compass className="w-3.5 h-3.5 text-amber-400" />
                <span>진행표</span>
              </button>
            )}

            <button
              onClick={onToggleCharacterLock}
              className={`p-1.5 rounded-md border transition ${
                isCharacterLocked
                  ? 'bg-amber-950/60 border-amber-700/60 text-amber-400'
                  : 'bg-stone-800 border-stone-700 text-stone-400'
              }`}
              title={isCharacterLocked ? '캐릭터 고정 잠금됨 (터치하여 해제)' : '캐릭터 잠금 해제됨'}
            >
              {isCharacterLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            </button>

            {!isCharacterLocked && (
              <button
                onClick={onLeaveCharacter}
                className="p-1.5 rounded-md bg-rose-950/70 hover:bg-rose-900 border border-rose-700/60 text-rose-200 transition"
                title="캐릭터 다시 선택하기"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 타임테이블 & 진행자 암호 안내 모달 */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-amber-700/60 rounded-xl max-w-md w-full max-h-[88vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="px-4 py-3 bg-stone-950 border-b border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-amber-100 text-sm">
                  13단계 진행 순서 & 권장 시간 (총 120분)
                </h3>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="text-stone-400 hover:text-white text-xs px-2 py-1 rounded bg-stone-800"
              >
                닫기 ✕
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-4 text-xs">
              <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-800/50 text-amber-200/90 leading-relaxed">
                💡 <b>오프라인 진행 팁</b>: 앱 내 강제 타이머 없이 진행자가 오프라인에서 시간을 재며 유연하게 진행합니다. 조사 시작과 반전, 결말은 <b>해금 비밀번호</b>를 입력해야 열립니다.
              </div>

              {/* 진행자 전용 암호 확인 (오직 진행자(GM)로 로그인한 경우에만 노출!) */}
              {character.id === 'gm' ? (
                <div className="p-3 rounded-lg bg-stone-950 border border-amber-700/60 shadow-inner">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-amber-300">
                      🎩 진행자 전용 4대 관문 해금 암호
                    </span>
                    <button
                      onClick={() => setShowHostPasswords(!showHostPasswords)}
                      className="flex items-center gap-1 px-2 py-1 rounded bg-amber-950/80 hover:bg-amber-900 border border-amber-600/50 text-amber-200 text-[11px]"
                    >
                      {showHostPasswords ? (
                        <>
                          <EyeOff className="w-3 h-3" /> 암호 숨기기
                        </>
                      ) : (
                        <>
                          <Eye className="w-3 h-3" /> 암호 보기
                        </>
                      )}
                    </button>
                  </div>

                  {showHostPasswords && (
                    <div className="mt-2.5 pt-2.5 border-t border-stone-800 space-y-2 text-stone-300">
                      <div className="flex justify-between items-center bg-stone-900/60 p-2 rounded-lg gap-2">
                        <span className="text-xs">🔒 관문 0 (3단계 1차 조사):</span>
                        <div className="flex items-center gap-1.5">
                          <code className="font-mono font-bold text-amber-400 bg-amber-950 px-2 py-0.5 rounded text-xs">
                            {GATE_PASSWORDS.GATE_0_ACT1_INVESTIGATION}
                          </code>
                          {onUnlockGate && (
                            <button
                              onClick={() => onUnlockGate(0, GATE_PASSWORDS.GATE_0_ACT1_INVESTIGATION)}
                              disabled={room.gate0Unlocked}
                              className={`px-2 py-1 rounded text-[11px] font-bold transition ${
                                room.gate0Unlocked
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-600/50'
                                  : 'bg-amber-600 hover:bg-amber-500 text-stone-950'
                              }`}
                            >
                              {room.gate0Unlocked ? '✓ 해금됨' : '원터치 해금'}
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-between items-center bg-stone-900/60 p-2 rounded-lg gap-2">
                        <span className="text-xs">🔒 관문 1 (5단계 긴급 상황):</span>
                        <div className="flex items-center gap-1.5">
                          <code className="font-mono font-bold text-amber-400 bg-amber-950 px-2 py-0.5 rounded text-xs">
                            {GATE_PASSWORDS.GATE_1_MID_EVENT}
                          </code>
                          {onUnlockGate && (
                            <button
                              onClick={() => onUnlockGate(1, GATE_PASSWORDS.GATE_1_MID_EVENT)}
                              disabled={room.gate1Unlocked}
                              className={`px-2 py-1 rounded text-[11px] font-bold transition ${
                                room.gate1Unlocked
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-600/50'
                                  : 'bg-amber-600 hover:bg-amber-500 text-stone-950'
                              }`}
                            >
                              {room.gate1Unlocked ? '✓ 해금됨' : '원터치 해금'}
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-between items-center bg-stone-900/60 p-2 rounded-lg gap-2">
                        <span className="text-xs">🔒 관문 2 (9단계 최후 결판):</span>
                        <div className="flex items-center gap-1.5">
                          <code className="font-mono font-bold text-amber-400 bg-amber-950 px-2 py-0.5 rounded text-xs">
                            {GATE_PASSWORDS.GATE_2_CLIMAX}
                          </code>
                          {onUnlockGate && (
                            <button
                              onClick={() => onUnlockGate(2, GATE_PASSWORDS.GATE_2_CLIMAX)}
                              disabled={room.gate2Unlocked}
                              className={`px-2 py-1 rounded text-[11px] font-bold transition ${
                                room.gate2Unlocked
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-600/50'
                                  : 'bg-amber-600 hover:bg-amber-500 text-stone-950'
                              }`}
                            >
                              {room.gate2Unlocked ? '✓ 해금됨' : '원터치 해금'}
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-between items-center bg-stone-900/60 p-2 rounded-lg gap-2">
                        <span className="text-xs">🔒 관문 3 (13단계 최종 결말):</span>
                        <div className="flex items-center gap-1.5">
                          <code className="font-mono font-bold text-amber-400 bg-amber-950 px-2 py-0.5 rounded text-xs">
                            {GATE_PASSWORDS.GATE_3_ENDING}
                          </code>
                          {onUnlockGate && (
                            <button
                              onClick={() => onUnlockGate(3, GATE_PASSWORDS.GATE_3_ENDING)}
                              disabled={room.gate3Unlocked}
                              className={`px-2 py-1 rounded text-[11px] font-bold transition ${
                                room.gate3Unlocked
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-600/50'
                                  : 'bg-amber-600 hover:bg-amber-500 text-stone-950'
                              }`}
                            >
                              {room.gate3Unlocked ? '✓ 해금됨' : '원터치 해금'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-2.5 rounded-lg bg-stone-950 border border-stone-800 text-stone-400 text-center">
                  🔒 단계별 해금 암호는 <b>게임 진행자(GM)</b>의 안내에 따라 공개됩니다.
                </div>
              )}

              {/* 13단계 리스트 */}
              <div className="space-y-2">
                {TIMETABLE_STEPS.map((item) => {
                  const isUnlocked =
                    item.gateNumber === 0
                      ? room.gate0Unlocked
                      : item.gateNumber === 1
                      ? room.gate1Unlocked
                      : item.gateNumber === 2
                      ? room.gate2Unlocked
                      : item.gateNumber === 3
                      ? room.gate3Unlocked
                      : true;

                  return (
                    <div
                      key={item.step}
                      className={`p-2.5 rounded-lg border ${
                        item.isHighlight
                          ? 'bg-amber-950/25 border-amber-700/50'
                          : 'bg-stone-950/60 border-stone-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-stone-100">
                          {item.step}단계. {item.title}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {item.gateNumber !== undefined && (
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                isUnlocked
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50'
                                  : 'bg-rose-950 text-rose-300 border border-rose-700/50'
                              }`}
                            >
                              {isUnlocked ? '해금됨' : `잠김(관문${item.gateNumber})`}
                            </span>
                          )}
                          <span className="text-[11px] font-semibold text-amber-400 bg-stone-900 px-2 py-0.5 rounded border border-stone-700">
                            권장 {item.minutes}분
                          </span>
                        </div>
                      </div>
                      <p className="text-stone-400 text-[11px] leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* 방 초기화 버튼 */}
              <div className="pt-2 border-t border-stone-800 flex justify-between items-center">
                <span className="text-stone-500 text-[11px]">
                  새 게임을 시작할 때만 방 상태를 초기화하세요.
                </span>
                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        '정말로 현재 방의 모든 카드 소유권과 해금 상태를 초기화하시겠습니까?'
                      )
                    ) {
                      onResetRoom();
                      setShowGuideModal(false);
                    }
                  }}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-rose-950/70 hover:bg-rose-900 text-rose-200 border border-rose-800/60 text-[11px]"
                >
                  <RotateCcw className="w-3 h-3" /> 방 전체 초기화
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
