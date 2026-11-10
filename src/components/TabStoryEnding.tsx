'use client';

import React, { useState } from 'react';
import {
  OPENING_SCRIPT,
  MID_EVENT_SCRIPT,
  ENDINGS,
  TRUTH_GUIDE
} from '@/data/scripts';
import { CHARACTERS, CHARACTER_MAP } from '@/data/characters';
import { CLUE_CARDS } from '@/data/cards';
import {
  ActionSkillActor,
  CharacterData,
  CharacterId,
  RoomState,
  SkillStatus
} from '@/types/game';
import {
  Film,
  Lock,
  KeyRound,
  Dices,
  Trophy,
  Eye,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Crosshair,
  Zap,
  Crown
} from 'lucide-react';

interface TabStoryEndingProps {
  character: CharacterData;
  room: RoomState;
  calculateCharacterBonus: (charId: CharacterId) => number;
  onUnlockGate: (gate: 0 | 1 | 2 | 3) => Promise<boolean>;
  onSubmitSecretPick: (
    actor: 'clive' | 'grace',
    targetId: CharacterId | null
  ) => void;
  onSetJailed: (charId: CharacterId | null) => void;
  onRollCliveEscape: (val: number | null) => void;
  onSetChaseDice: (charId: CharacterId, val: number | null) => void;
  onSetSkillStatus?: (actor: ActionSkillActor, status: SkillStatus) => void;
  onSetPlayerScore?: (characterId: CharacterId, score: number) => void;
  onResetRoom?: () => void;
}

export default function TabStoryEnding({
  character,
  room,
  calculateCharacterBonus,
  onUnlockGate,
  onSubmitSecretPick,
  onSetJailed,
  onRollCliveEscape,
  onSetChaseDice,
  onSetSkillStatus,
  onSetPlayerScore,
  onResetRoom
}: TabStoryEndingProps) {


  const [selectedEndingId, setSelectedEndingId] = useState<
    'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'AB'
  >('C');
  const [showTruthSection, setShowTruthSection] = useState(false);

  const activeChars = CHARACTERS;

  // 클라이브가 수감되었으나 4 이상으로 탈옥에 성공했는지 판정
  const isCharacterBlockedFromChase = (charId: CharacterId) => {
    if (room.jailedCharacter !== charId) return false;
    if (charId === 'clive' && (room.cliveEscapeRoll ?? 0) >= 4) {
      return false; // 탈옥 성공!
    }
    return true;
  };

  // 추격전 최고 눈금 1위 계산
  const chaseResults = activeChars
    .map((c) => {
      const blocked = isCharacterBlockedFromChase(c.id);
      const dice = room.chaseDiceRolls[c.id] ?? null;
      const bonus = calculateCharacterBonus(c.id);
      const total = !blocked && dice !== null ? dice + bonus : null;
      return {
        char: c,
        blocked,
        dice,
        bonus,
        total
      };
    })
    .sort((a, b) => (b.total ?? -1) - (a.total ?? -1));

  const highestTotal =
    chaseResults.length > 0 && chaseResults[0].total !== null
      ? chaseResults[0].total
      : null;

  // 클라이브 & 그레이스 비밀 지목 채점 결과
  const clivePickedChar = room.cliveSecretPick
    ? CHARACTER_MAP[room.cliveSecretPick]
    : null;
  const isClivePickCorrect =
    room.cliveSecretPick === 'florence' || room.cliveSecretPick === 'grace';

  const gracePickedChar = room.graceSecretPick
    ? CHARACTER_MAP[room.graceSecretPick]
    : null;
  const isGracePickCorrect = room.graceSecretPick === 'clive';

  return (
    <div className="space-y-5 pb-10">
      {/* 1. 오프닝 나레이션 (상시 열람) */}
      <section className="p-4 rounded-2xl bg-stone-900 border border-stone-800 space-y-3">
        <div className="flex items-center justify-between border-b border-stone-800 pb-2">
          <h2 className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
            <Film className="w-4 h-4" /> {OPENING_SCRIPT.title}
          </h2>
          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/50">
            낭독 가능
          </span>
        </div>
        <p className="text-[11px] text-amber-200/90">{OPENING_SCRIPT.guide}</p>
        <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-200 whitespace-pre-line leading-relaxed font-serif">
          {OPENING_SCRIPT.body}
        </div>
        <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-800/50 text-[11px] text-amber-200">
          💡 {OPENING_SCRIPT.afterNote}
        </div>
      </section>

      {/* 2. 긴급 상황 발생 (새로운 국면) */}
      <section className="p-4 rounded-2xl bg-stone-900 border border-amber-700/60 space-y-3">
        <div className="flex items-center justify-between border-b border-stone-800 pb-2">
          <h2 className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
            {room.gate1Unlocked ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <Lock className="w-4 h-4 text-amber-400" />
            )}
            긴급 상황 발생 (새로운 국면)
          </h2>
          <span
            className={`text-[10px] px-2 py-0.5 rounded font-bold ${
              room.gate1Unlocked
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50'
                : 'bg-amber-950 text-amber-300 border border-amber-700/50'
            }`}
          >
            {room.gate1Unlocked ? '해금 완료' : '🔒 대기 중'}
          </span>
        </div>

        {!room.gate1Unlocked ? (
          <div className="space-y-3 py-1">
            <p className="text-xs text-stone-300 leading-relaxed">
              전반전 대화와 밀담이 종료된 후, 마스터(진행자)가 사건을 해금하면 새로운 사건 대본과 추가 조사 구역이 열립니다.
            </p>
            {character.id === 'gm' ? (
              <button
                onClick={() => onUnlockGate(1)}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-extrabold text-xs shadow-lg transition"
              >
                🔓 [마스터 전용] 긴급 상황 즉시 해금하기 (전체 플레이어 동기화)
              </button>
            ) : (
              <div className="p-3 rounded-xl bg-stone-950/80 border border-stone-800 text-center text-xs text-amber-400 font-semibold animate-pulse">
                ⏳ 마스터의 사건 해금을 기다리고 있습니다...
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-xs font-bold text-rose-400">
              {MID_EVENT_SCRIPT.subtitle}
            </div>
            <div className="p-3.5 rounded-xl bg-stone-950 border border-rose-800/60 text-xs text-stone-100 whitespace-pre-line leading-relaxed font-serif">
              {MID_EVENT_SCRIPT.body}
            </div>
            <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-700/50 space-y-1.5">
              <div className="text-xs font-bold text-amber-300">
                🚨 후반전 추가 규칙 및 신규 구역 안내
              </div>
              <ul className="space-y-1.5 text-[11px] text-stone-200 list-disc pl-4 leading-relaxed">
                {MID_EVENT_SCRIPT.rules.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </section>

      {/* 3. 비밀 지목 & 최후의 결판 */}
      <section className="p-4 rounded-2xl bg-stone-900 border border-amber-700/60 space-y-4">
        <div className="flex items-center justify-between border-b border-stone-800 pb-2">
          <h2 className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
            {room.gate2Unlocked ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <Lock className="w-4 h-4 text-amber-400" />
            )}
            최후의 변론 및 최종 결판
          </h2>
          <span
            className={`text-[10px] px-2 py-0.5 rounded font-bold ${
              room.gate2Unlocked
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50'
                : 'bg-amber-950 text-amber-300 border border-amber-700/50'
            }`}
          >
            {room.gate2Unlocked ? '해금 완료' : '🔒 대기 중'}
          </span>
        </div>

        {!room.gate2Unlocked ? (
          <div className="space-y-3 py-1">
            <p className="text-xs text-stone-300 leading-relaxed">
              최후 변론이 끝난 직후, 마스터(진행자)가 결판을 해금하면 <b>최후의 비밀 지목</b>과 <b>최종 투표 및 결판</b>이 열립니다.
            </p>
            {character.id === 'gm' ? (
              <button
                onClick={() => onUnlockGate(2)}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-extrabold text-xs shadow-lg transition"
              >
                🔓 [마스터 전용] 최종 결판 즉시 해금하기 (전체 플레이어 동기화)
              </button>
            ) : (
              <div className="p-3 rounded-xl bg-stone-950/80 border border-stone-800 text-center text-xs text-amber-400 font-semibold animate-pulse">
                ⏳ 마스터의 최종 결판 해금을 기다리고 있습니다...
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            {/* 최후 변론 직후 비밀 지목 (1회 확정 + 마스터 재설정) */}
            <div className="p-3.5 rounded-xl bg-stone-950 border border-amber-700/50 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Crosshair className="w-4 h-4 text-amber-400" /> 최후 변론 직후 비밀 지목
                </h3>
                <span className="text-[10px] text-stone-400">
                  1회 확정 · 행동 전 실시
                </span>
              </div>

              <div className="flex gap-2 text-[11px]">
                <div
                  className={`flex-1 p-2 rounded-lg border text-center font-semibold flex flex-col items-center justify-center gap-1 ${
                    room.cliveSecretPick
                      ? 'bg-emerald-950/50 border-emerald-700 text-emerald-300'
                      : 'bg-stone-900 border-stone-800 text-stone-400'
                  }`}
                >
                  <span>
                    ⭐ 클라이브(조력자):{' '}
                    {room.cliveSecretPick ? '제출 완료 ✓' : '대기 중...'}
                  </span>
                  {character.id === 'gm' && room.cliveSecretPick && (
                    <button
                      onClick={() => {
                        if (window.confirm('클라이브의 비밀 지목을 초기화하고 다시 선택하게 하시겠습니까?')) {
                          onSubmitSecretPick('clive', null);
                        }
                      }}
                      className="px-2 py-0.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 text-[10px]"
                    >
                      마스터 재설정
                    </button>
                  )}
                </div>
                <div
                  className={`flex-1 p-2 rounded-lg border text-center font-semibold flex flex-col items-center justify-center gap-1 ${
                    room.graceSecretPick
                      ? 'bg-emerald-950/50 border-emerald-700 text-emerald-300'
                      : 'bg-stone-900 border-stone-800 text-stone-400'
                  }`}
                >
                  <span>
                    ⛪ 그레이스(매드독):{' '}
                    {room.graceSecretPick ? '제출 완료 ✓' : '대기 중...'}
                  </span>
                  {character.id === 'gm' && room.graceSecretPick && (
                    <button
                      onClick={() => {
                        if (window.confirm('그레이스의 비밀 지목을 초기화하고 다시 선택하게 하시겠습니까?')) {
                          onSubmitSecretPick('grace', null);
                        }
                      }}
                      className="px-2 py-0.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 text-[10px]"
                    >
                      마스터 재설정
                    </button>
                  )}
                </div>
              </div>

              {/* 클라이브 본인에게만 보이는 조력자 지목 UI (1회 확정) */}
              {character.id === 'clive' && (
                <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-600/60 space-y-2">
                  <div className="text-xs font-bold text-amber-200">
                    🔫 [클라이브 전용] 행크의 조력자(+2점 목표) 비밀 지목
                  </div>
                  {room.cliveSecretPick ? (
                    <div className="p-2.5 rounded-lg bg-emerald-950/70 border border-emerald-600/70 text-xs font-bold text-emerald-300 flex items-center justify-between">
                      <span>
                        ✓ 지목 확정 완료: {CHARACTER_MAP[room.cliveSecretPick]?.emoji}{' '}
                        {CHARACTER_MAP[room.cliveSecretPick]?.name}
                      </span>
                      <span className="text-[10px] text-stone-400">변경 불가</span>
                    </div>
                  ) : (
                    <>
                      <p className="text-[11px] text-stone-300">
                        마을 주민 중 행크를 돕고 있는 조력자로 의심되는 1명을 선택하세요. <b>한 번 선택하면 변경할 수 없습니다.</b>
                      </p>
                      <div className="grid grid-cols-2 gap-1.5 pt-1">
                        {activeChars
                          .filter((c) => c.id !== 'clive')
                          .map((target) => (
                            <button
                              key={target.id}
                              onClick={() => {
                                if (
                                  window.confirm(
                                    `[${target.name}]님을 행크의 조력자로 최종 지목하시겠습니까? (확정 후 변경 불가)`
                                  )
                                ) {
                                  onSubmitSecretPick('clive', target.id);
                                }
                              }}
                              className="p-2 rounded-lg text-xs font-bold border text-left bg-stone-900 hover:bg-amber-950/50 border-stone-700 hover:border-amber-500 text-stone-200 transition"
                            >
                              {target.emoji} {target.name.split(' ')[0]}
                            </button>
                          ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* 그레이스 본인에게만 보이는 매드독 지목 UI (1회 확정) */}
              {character.id === 'grace' && (
                <div className="p-3 rounded-lg bg-purple-950/30 border border-purple-500/60 space-y-2">
                  <div className="text-xs font-bold text-purple-200">
                    ⛪ [그레이스 전용] &lsquo;매드독&rsquo;의 정체(+3점 목표) 비밀 지목
                  </div>
                  {room.graceSecretPick ? (
                    <div className="p-2.5 rounded-lg bg-emerald-950/70 border border-emerald-600/70 text-xs font-bold text-emerald-300 flex items-center justify-between">
                      <span>
                        ✓ 지목 확정 완료: {CHARACTER_MAP[room.graceSecretPick]?.emoji}{' '}
                        {CHARACTER_MAP[room.graceSecretPick]?.name}
                      </span>
                      <span className="text-[10px] text-stone-400">변경 불가</span>
                    </div>
                  ) : (
                    <>
                      <p className="text-[11px] text-stone-300">
                        두목 &lsquo;매드독&rsquo;으로 의심되는 인물 1명을 선택하세요. <b>한 번 선택하면 변경할 수 없습니다.</b> (결말 해금 전까지 비공개)
                      </p>
                      <div className="grid grid-cols-2 gap-1.5 pt-1">
                        {activeChars
                          .filter((c) => c.id !== 'grace')
                          .map((target) => (
                            <button
                              key={target.id}
                              onClick={() => {
                                if (
                                  window.confirm(
                                    `[${target.name}]님을 매드독의 정체로 최종 지목하시겠습니까? (확정 후 변경 불가)`
                                  )
                                ) {
                                  onSubmitSecretPick('grace', target.id);
                                }
                              }}
                              className="p-2 rounded-lg text-xs font-bold border text-left bg-stone-900 hover:bg-purple-950/50 border-stone-700 hover:border-purple-400 text-stone-200 transition"
                            >
                              {target.emoji} {target.name.split(' ')[0]}
                            </button>
                          ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* 행동 스킬 발동 체크판 */}
            <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-400" /> 행동 스킬 발동 순서 체크
                </h3>
                <span className="text-[10px] text-stone-400">
                  {character.id === 'gm' ? '마스터 진행 기록' : '실시간 진행 현황'}
                </span>
              </div>

              <div className="space-y-1.5 text-[11px]">
                {(
                  [
                    { actor: 'clive', label: '1번 · 🔫 클라이브 (총구 겨누기)', desc: '대상 1명 투표권 박탈 & 도주 봉인' },
                    { actor: 'annie', label: '2번 · 🍷 애니 (수면제)', desc: '대상 1명 특수 능력 영구 봉인' },
                    { actor: 'david', label: '3번 · ⭐ 데이비드 (아이템 압수)', desc: '타인 아이템 1개 압수 (소지품에서 이동)' },
                    { actor: 'florence', label: '4번 · 💉 플로렌스 (현장 도주)', desc: '최종 투표 유치장 수감 면제' },
                    { actor: 'grace', label: '방어 · ⛪ 그레이스 (은빛 십자가)', desc: '공격 1회 즉시 방어' }
                  ] as const
                ).map((sk) => {
                  const status = room.skillStatus?.[sk.actor] || 'pending';
                  return (
                    <div
                      key={sk.actor}
                      className="p-2 rounded-lg bg-stone-900/90 border border-stone-800 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-stone-200 truncate">{sk.label}</div>
                        <div className="text-[10px] text-stone-400 truncate">{sk.desc}</div>
                      </div>
                      {character.id === 'gm' && onSetSkillStatus ? (
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() =>
                              onSetSkillStatus(sk.actor, status === 'used' ? 'pending' : 'used')
                            }
                            className={`px-2 py-1 rounded text-[10px] font-bold border transition ${
                              status === 'used'
                                ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                                : 'bg-stone-950 text-stone-400 border-stone-700 hover:border-emerald-600'
                            }`}
                          >
                            {status === 'used' ? '발동 ✓' : '완료'}
                          </button>
                          <button
                            onClick={() =>
                              onSetSkillStatus(sk.actor, status === 'blocked' ? 'pending' : 'blocked')
                            }
                            className={`px-2 py-1 rounded text-[10px] font-bold border transition ${
                              status === 'blocked'
                                ? 'bg-rose-950 text-rose-300 border-rose-600'
                                : 'bg-stone-950 text-stone-400 border-stone-700 hover:border-rose-600'
                            }`}
                          >
                            {status === 'blocked' ? '봉인 ✕' : '봉인'}
                          </button>
                        </div>
                      ) : (
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 border ${
                            status === 'used'
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                              : status === 'blocked'
                              ? 'bg-rose-950 text-rose-300 border-rose-700'
                              : 'bg-stone-950 text-stone-500 border-stone-800'
                          }`}
                        >
                          {status === 'used' ? '발동 완료 ✓' : status === 'blocked' ? '봉인/무효' : '대기'}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 최종 투표 유치장 수감자 지정 (마스터 전용) & 클라이브 탈옥 주사위 */}
            <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-amber-300">
                  ⛓️ 최종 투표 최다 득표자 (유치장 수감 1인)
                </h3>
                <span className="text-[10px] text-stone-400">
                  {character.id === 'gm' ? '마스터 전용 확정' : '마스터 확정 대기'}
                </span>
              </div>
              <p className="text-[11px] text-stone-400">
                투표 결과 최다 득표로 유치장에 수감된 인물 1명입니다. 수감자는 최종 결판에 참여할 수 없습니다.
              </p>

              {character.id === 'gm' ? (
                <div className="flex flex-wrap gap-1.5">
                  {activeChars.map((c) => {
                    const isJailed = room.jailedCharacter === c.id;
                    return (
                      <button
                        key={c.id}
                        onClick={() => onSetJailed(isJailed ? null : c.id)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition ${
                          isJailed
                            ? 'bg-rose-700 border-rose-400 text-white'
                            : 'bg-stone-900 border-stone-700 text-stone-300 hover:border-amber-500'
                        }`}
                      >
                        {c.emoji} {c.name.split(' ')[0]}{' '}
                        {isJailed ? '(수감됨 ⛓️)' : ''}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-2.5 rounded-lg bg-stone-900 border border-stone-800 text-xs font-bold text-center">
                  {room.jailedCharacter ? (
                    <span className="text-rose-300">
                      ⛓️ 최종 수감 확정: {CHARACTER_MAP[room.jailedCharacter]?.emoji}{' '}
                      {CHARACTER_MAP[room.jailedCharacter]?.name}
                    </span>
                  ) : (
                    <span className="text-stone-400 font-normal">
                      ⏳ 마스터가 최종 투표 결과에 따라 수감자를 확정 중입니다... (수감자 없음 포함)
                    </span>
                  )}
                </div>
              )}

              {/* 클라이브 수감 시: 4 이상 탈옥 주사위 판정기 */}
              {room.jailedCharacter === 'clive' && (
                <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-600/70 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-200">
                      🎲 클라이브 유치장 탈옥 판정 (주사위 4 이상 탈옥!)
                    </span>
                    {room.cliveEscapeRoll === null ? (
                      character.id === 'clive' || character.id === 'gm' ? (
                        <button
                          onClick={() => {
                            const r = Math.floor(Math.random() * 6) + 1;
                            onRollCliveEscape(r);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-extrabold text-xs shadow animate-pulse"
                        >
                          🎲 주사위 굴리기
                        </button>
                      ) : (
                        <span className="text-[11px] text-stone-400">
                          ⏳ 클라이브 굴림 대기 중
                        </span>
                      )
                    ) : (
                      character.id === 'gm' && (
                        <button
                          onClick={() => {
                            if (confirm('클라이브 탈옥 주사위를 초기화하고 다시 굴리게 하시겠습니까?')) {
                              onRollCliveEscape(null);
                            }
                          }}
                          className="px-2 py-0.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-400 text-[10px]"
                        >
                          마스터 재설정
                        </button>
                      )
                    )}
                  </div>
                  {room.cliveEscapeRoll !== null && (
                    <div
                      className={`text-xs font-bold p-2.5 rounded-lg ${
                        room.cliveEscapeRoll >= 4
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700'
                          : 'bg-rose-950/80 text-rose-300 border border-rose-700'
                      }`}
                    >
                      주사위 결과: [{room.cliveEscapeRoll}] (굴림 완료 · 변경 불가) ➔{' '}
                      {room.cliveEscapeRoll >= 4
                        ? '💥 탈옥 성공! 클라이브가 유치장을 부수고 결판에 정상 합류합니다!'
                        : '⛓️ 탈옥 실패 (1~3)! 클라이브는 결판에 참여할 수 없습니다.'}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 12단계: 행크 추격전 주사위 & 아이템 자동 합산기 */}
            <div className="p-3.5 rounded-xl bg-stone-950 border border-amber-700/60 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Dices className="w-4 h-4 text-amber-400" /> 행크 추격전 최종 결판 (주사위 판정)
                </h3>
                <span className="text-[10px] text-stone-400">
                  최종 눈금 = 1d6 + 아이템 보너스(개당 +1)
                </span>
              </div>

              <div className="space-y-2">
                {activeChars.map((c) => {
                  const blocked = isCharacterBlockedFromChase(c.id);
                  const bonus = calculateCharacterBonus(c.id);
                  const diceVal = room.chaseDiceRolls[c.id] ?? null;
                  const total =
                    !blocked && diceVal !== null ? diceVal + bonus : null;
                  const isTop =
                    highestTotal !== null &&
                    total === highestTotal &&
                    !blocked;

                  return (
                    <div
                      key={c.id}
                      className={`p-3 rounded-xl border transition ${
                        blocked
                          ? 'bg-stone-900/40 border-stone-800 opacity-50'
                          : isTop
                          ? 'bg-amber-950/50 border-amber-400 shadow-md'
                          : 'bg-stone-900/90 border-stone-800'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{c.emoji}</span>
                          <div>
                            <span className="text-xs font-bold text-stone-100">
                              [{c.initial}] {c.name.split(' ')[0]}
                            </span>
                            <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-stone-800 text-amber-300">
                              보너스 +{bonus}
                            </span>
                          </div>
                        </div>

                        {blocked ? (
                          <span className="text-[11px] font-bold text-rose-400">
                            ⛓️ 수감됨 (불참)
                          </span>
                        ) : total !== null ? (
                          <div className="flex items-center gap-1.5">
                            {isTop && (
                              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-500 text-stone-950">
                                🏆 1위
                              </span>
                            )}
                            <span className="text-sm font-extrabold text-amber-300">
                              최종 {total} ({diceVal}+{bonus})
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-stone-500">
                            주사위 대기
                          </span>
                        )}
                      </div>

                      {!blocked && (
                        <div className="pt-1.5 border-t border-stone-800/80">
                          {diceVal !== null ? (
                            <div className="flex items-center justify-between text-xs py-0.5">
                              <span className="text-emerald-400 font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> 주사위 눈금: <b>[{diceVal}]</b> (굴림 완료 · 변경 불가)
                              </span>
                              {character.id === 'gm' && (
                                <button
                                  onClick={() => {
                                    if (confirm(`${c.name}의 주사위를 초기화하고 다시 굴리게 하시겠습니까?`)) {
                                      onSetChaseDice(c.id, null);
                                    }
                                  }}
                                  className="px-2 py-0.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-400 text-[10px]"
                                >
                                  마스터 재설정
                                </button>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center justify-between py-0.5">
                              {character.id === c.id || character.id === 'gm' ? (
                                <>
                                  <span className="text-[11px] text-stone-400">
                                    🎲 단 한 번만 굴릴 수 있습니다!
                                  </span>
                                  <button
                                    onClick={() => {
                                      const rand = Math.floor(Math.random() * 6) + 1;
                                      onSetChaseDice(c.id, rand);
                                    }}
                                    className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-extrabold text-xs shadow transition animate-pulse"
                                  >
                                    🎲 주사위 굴리기
                                  </button>
                                </>
                              ) : (
                                <span className="text-[11px] text-stone-500">
                                  ⏳ {c.name.split(' ')[0]} 님의 주사위 굴림을 기다리는 중...
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 4. 최종 결말 & 사건의 전말 해설서 */}
      <section className="p-4 rounded-2xl bg-stone-900 border border-amber-700/60 space-y-4">
        <div className="flex items-center justify-between border-b border-stone-800 pb-2">
          <h2 className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
            {room.gate3Unlocked ? (
              <Trophy className="w-4 h-4 text-amber-400" />
            ) : (
              <Lock className="w-4 h-4 text-amber-400" />
            )}
            최종 결말 & 진상 해설서
          </h2>
          <span
            className={`text-[10px] px-2 py-0.5 rounded font-bold ${
              room.gate3Unlocked
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50'
                : 'bg-amber-950 text-amber-300 border border-amber-700/50'
            }`}
          >
            {room.gate3Unlocked ? '해금 완료' : '🔒 대기 중'}
          </span>
        </div>

        {!room.gate3Unlocked ? (
          <div className="space-y-3 py-1">
            <p className="text-xs text-stone-300 leading-relaxed">
              최종 결판이 모두 끝난 뒤, 마스터(진행자)가 결말을 해금하면 <b>비밀 지목 채점 결과, 최종 결말, 사건의 전말 해설서</b>가 공개됩니다.
            </p>
            {character.id === 'gm' ? (
              <button
                onClick={() => onUnlockGate(3)}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-extrabold text-xs shadow-lg transition"
              >
                🔓 [마스터 전용] 최종 결말 및 진상 해설 해금하기 (전체 플레이어 동기화)
              </button>
            ) : (
              <div className="p-3 rounded-xl bg-stone-950/80 border border-stone-800 text-center text-xs text-amber-400 font-semibold animate-pulse">
                ⏳ 마스터의 최종 결말 해금을 기다리고 있습니다...
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            {/* 9단계 비밀 지목 공개 & 핵심 아이템 최종 소유자 요약 */}
            <div className="p-3.5 rounded-xl bg-stone-950 border border-amber-700/50 space-y-2.5 text-xs">
              <h3 className="font-bold text-amber-300">
                📊 비밀 지목 & 핵심 아이템 최종 판정 결과
              </h3>
              <div className="space-y-1.5 text-stone-200">
                <div className="p-2 rounded bg-stone-900 border border-stone-800">
                  • <b>🔫 클라이브의 [행크 조력자] 지목</b>:{' '}
                  {clivePickedChar ? (
                    <>
                      <b>{clivePickedChar.name}</b> 지목 ➔{' '}
                      {isClivePickCorrect ? (
                        <span className="text-emerald-400 font-bold">
                          적중! (클라이브 +2점 획득 & {clivePickedChar.name.split(' ')[0]}의 은폐 목표 +2점 실패/0점 처리!)
                        </span>
                      ) : (
                        <span className="text-rose-400 font-bold">
                          실패! (클라이브 0점 / 플로렌스·그레이스 은폐 +2점 달성!)
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-stone-400">미지목 (플로렌스·그레이스 은폐 +2점 달성)</span>
                  )}
                </div>

                <div className="p-2 rounded bg-stone-900 border border-stone-800">
                  • <b>⛪ 그레이스의 [매드독] 지목</b>:{' '}
                  {gracePickedChar ? (
                    <>
                      <b>{gracePickedChar.name}</b> 지목 ➔{' '}
                      {isGracePickCorrect ? (
                        <span className="text-emerald-400 font-bold">
                          적중! (그레이스 +3점 획득!)
                        </span>
                      ) : (
                        <span className="text-rose-400 font-bold">
                          실패! (진짜 매드독은 클라이브였습니다)
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-stone-400">미지목 (0점)</span>
                  )}
                </div>

                <div className="p-2 rounded bg-stone-900 border border-stone-800">
                  • <b>🌟 [피 묻은 연방 보안관 배지] 최종 소유자</b>:{' '}
                  {room.cardOwners['5-1'] ? (
                    <b className="text-amber-300">
                      {CHARACTER_MAP[room.cardOwners['5-1']].name}
                    </b>
                  ) : (
                    '미소유'
                  )}
                </div>

                <div className="p-2 rounded bg-stone-900 border border-stone-800">
                  • <b>📜 [어니스트 시장의 비리 장부] 최종 소유자</b>:{' '}
                  {room.cardOwners['1-1'] ? (
                    <b className="text-amber-300">
                      {CHARACTER_MAP[room.cardOwners['1-1']].name}
                    </b>
                  ) : (
                    '미소유'
                  )}
                </div>
              </div>
            </div>

            {/* 7인 최종 점수 집계 & 1위 엔딩 판정기 */}
            {(() => {
              const scoreEntries = activeChars.map((c) => {
                const score = room.playerScores?.[c.id] ?? 0;
                const chase = chaseResults.find((r) => r.char.id === c.id);
                const chaseTotal = chase?.total ?? -1;
                return { char: c, score, chaseTotal };
              });
              const sorted = [...scoreEntries].sort((a, b) => {
                if (b.score !== a.score) return b.score - a.score;
                return b.chaseTotal - a.chaseTotal;
              });
              const maxScore = sorted[0]?.score ?? 0;
              const topScorers = sorted.filter((e) => e.score === maxScore);
              const hasScores = maxScore > 0;

              let recommendedId: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'AB' =
                (sorted[0]?.char.initial as 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G') || 'C';
              let winnerLabel = `${sorted[0]?.char.emoji} ${sorted[0]?.char.name} (${maxScore}점)`;

              if (
                hasScores &&
                topScorers.length === 2 &&
                topScorers.some((e) => e.char.id === 'annie') &&
                topScorers.some((e) => e.char.id === 'benny')
              ) {
                recommendedId = 'AB';
                winnerLabel = `🍷🎹 애니 & 베니 공동 1위 (${maxScore}점 · Ending A+B 연속 낭독)`;
              } else if (hasScores && topScorers.length > 1) {
                winnerLabel = `${sorted[0]?.char.emoji} ${sorted[0]?.char.name} (${maxScore}점 · 추격전 우선)`;
              }

              return (
                <div className="p-3.5 rounded-xl bg-stone-950 border border-amber-600/60 space-y-3 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-amber-300 flex items-center gap-1.5">
                      <Crown className="w-4 h-4 text-amber-400" /> 7인 최종 점수 정산표
                    </h3>
                    <span className="text-[10px] text-stone-400">
                      {character.id === 'gm'
                        ? '설정집 체크 자동 반영 · 마스터 조정'
                        : '각 캐릭터 최종 점수 현황'}
                    </span>
                  </div>

                  {hasScores && (
                    <div className="p-2.5 rounded-lg bg-amber-950/50 border border-amber-500/70 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-[10px] text-amber-300 font-semibold">
                          🏆 현재 최종 1위 엔딩 추천
                        </div>
                        <div className="text-xs font-extrabold text-amber-100 truncate">
                          {winnerLabel}
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedEndingId(recommendedId)}
                        className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-[11px] shrink-0 shadow"
                      >
                        Ending {recommendedId} 보기
                      </button>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    {sorted.map((entry, idx) => {
                      const isWinner = hasScores && idx === 0;
                      return (
                        <div
                          key={entry.char.id}
                          className={`p-2 rounded-lg border flex items-center justify-between gap-2 ${
                            isWinner
                              ? 'bg-amber-950/35 border-amber-500/70'
                              : 'bg-stone-900 border-stone-800'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-[11px] font-mono text-stone-500 w-4 text-center shrink-0">
                              {idx + 1}
                            </span>
                            <span className="text-base shrink-0">{entry.char.emoji}</span>
                            <div className="min-w-0">
                              <div className="font-bold text-stone-100 truncate">
                                [{entry.char.initial}] {entry.char.name.split(' ')[0]}
                              </div>
                              <div className="text-[10px] text-stone-400">
                                {entry.chaseTotal >= 0
                                  ? `추격전 최종 ${entry.chaseTotal}`
                                  : '추격전 불참/미입력'}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {character.id === 'gm' && onSetPlayerScore && (
                              <button
                                onClick={() =>
                                  onSetPlayerScore(
                                    entry.char.id,
                                    Math.max(0, entry.score - 1)
                                  )
                                }
                                className="w-6 h-6 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold"
                              >
                                -
                              </button>
                            )}
                            <span className="min-w-[42px] text-center font-extrabold text-amber-300 text-xs">
                              {entry.score}점
                            </span>
                            {character.id === 'gm' && onSetPlayerScore && (
                              <button
                                onClick={() =>
                                  onSetPlayerScore(
                                    entry.char.id,
                                    Math.min(20, entry.score + 1)
                                  )
                                }
                                className="w-6 h-6 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold"
                              >
                                +
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* 엔딩 선택 탭 (Ending A ~ G + 애니&베니 공동 1등) */}
            <div className="space-y-3">
              <div className="text-xs text-stone-300 leading-relaxed bg-amber-950/20 p-3 rounded-xl border border-amber-800/40">
                🏆 <b>엔딩 낭독 규칙</b>: 최종 점수 1위 캐릭터의 이니셜 엔딩을 낭독합니다. (동점 시 <b>행크 추격전 주사위 1등</b> 우선 승리 / 단, <b>애니와 베니가 공동 1등</b>일 때는 <b>Ending A + B</b>를 함께 연속 낭독!)
              </div>

              <div className="flex flex-wrap gap-1.5">
                {ENDINGS.map((end) => (
                  <button
                    key={end.id}
                    onClick={() => setSelectedEndingId(end.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                      selectedEndingId === end.id
                        ? 'bg-amber-600 border-amber-400 text-stone-950'
                        : 'bg-stone-950 border-stone-800 text-stone-300'
                    }`}
                  >
                    {end.emoji} Ending {end.id}
                  </button>
                ))}
                <button
                  onClick={() => setSelectedEndingId('AB')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                    selectedEndingId === 'AB'
                      ? 'bg-rose-600 border-rose-400 text-white'
                      : 'bg-stone-950 border-rose-800/60 text-rose-300'
                  }`}
                >
                  🍷🎹 애니 & 베니 공동 1등 (A+B 연속)
                </button>
              </div>

              {/* 선택된 엔딩 대본 표시 */}
              {selectedEndingId === 'AB' ? (
                <div className="space-y-4">
                  {[ENDINGS[0], ENDINGS[1]].map((end) => (
                    <div
                      key={end.id}
                      className="p-4 rounded-2xl bg-stone-950 border border-rose-700/60 space-y-3"
                    >
                      <h4 className="text-sm font-extrabold text-amber-200">
                        {end.emoji} {end.title}
                      </h4>
                      <p className="text-[11px] text-amber-400">
                        {end.condition}
                      </p>
                      <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800 text-xs text-stone-100 whitespace-pre-line leading-relaxed font-serif">
                        {end.body}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                (() => {
                  const end =
                    ENDINGS.find((e) => e.id === selectedEndingId) ||
                    ENDINGS[2];
                  return (
                    <div className="p-4 rounded-2xl bg-stone-950 border border-amber-700/60 space-y-3">
                      <h4 className="text-sm font-extrabold text-amber-200">
                        {end.emoji} {end.title}
                      </h4>
                      <p className="text-[11px] text-amber-400">
                        {end.condition}
                      </p>
                      <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800 text-xs text-stone-100 whitespace-pre-line leading-relaxed font-serif">
                        {end.body}
                      </div>
                      <div className="p-3 rounded-xl bg-stone-900/60 border border-stone-800 space-y-1">
                        <div className="text-xs font-bold text-amber-300">
                          점수 정산 반영
                        </div>
                        <ul className="text-[11px] text-stone-300 list-disc pl-4 space-y-1">
                          {end.scoreNotes.map((n, idx) => (
                            <li key={idx}>{n}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })()
              )}
            </div>

            {/* 사건의 전말 & 진상 해설서 토글 */}
            <div className="pt-2 border-t border-stone-800 space-y-3">
              <button
                onClick={() => setShowTruthSection(!showTruthSection)}
                className="w-full py-3 rounded-xl bg-stone-800 hover:bg-stone-700 border border-amber-700/50 text-amber-200 font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                <BookOpen className="w-4 h-4" />
                {showTruthSection
                  ? '사건의 전말 & 진상 해설서 접기 ▲'
                  : '📖 사건의 전말 & 진상 해설서 열기 ▼'}
              </button>

              {showTruthSection && (
                <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-4">
                  <h3 className="text-sm font-extrabold text-amber-300">
                    🔍 사건의 전말 & 진상 해설서
                  </h3>
                  {TRUTH_GUIDE.map((sec, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <h4 className="text-xs font-bold text-amber-200">
                        {sec.title}
                      </h4>
                      <ul className="space-y-1.5 text-xs text-stone-300 list-disc pl-4 leading-relaxed">
                        {sec.items.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {/* 새 게임을 위한 방 전체 초기화 버튼 (마스터 전용) */}
              {character.id === 'gm' && onResetRoom && (
                <div className="pt-4 border-t border-stone-800/80 text-center">
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          '정말로 현재 방의 모든 해금 상태와 카드 소유권을 초기화하고 새 게임을 시작하시겠습니까?'
                        )
                      ) {
                        onResetRoom();
                      }
                    }}
                    className="w-full py-3 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-800/70 text-rose-200 text-xs font-bold transition shadow"
                  >
                    🔄 [마스터 전용] 게임 종료: 새 게임을 위해 방 전체 초기화하기
                  </button>
                  <p className="text-[11px] text-stone-500 mt-1.5">
                    초기화 시 모든 단서 및 해금 상태가 리셋되며 메인 로비로 이동합니다.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
