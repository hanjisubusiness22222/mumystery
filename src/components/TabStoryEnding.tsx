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
import { CharacterData, CharacterId, RoomState } from '@/types/game';
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
  Crosshair
} from 'lucide-react';

interface TabStoryEndingProps {
  character: CharacterData;
  room: RoomState;
  calculateCharacterBonus: (charId: CharacterId) => number;
  onUnlockGate: (gate: 0 | 1 | 2 | 3, password: string) => Promise<boolean>;
  onSubmitSecretPick: (
    actor: 'clive' | 'grace',
    targetId: CharacterId
  ) => void;
  onSetJailed: (charId: CharacterId | null) => void;
  onRollCliveEscape: (val: number | null) => void;
  onSetChaseDice: (charId: CharacterId, val: number | null) => void;
}

export default function TabStoryEnding({
  character,
  room,
  calculateCharacterBonus,
  onUnlockGate,
  onSubmitSecretPick,
  onSetJailed,
  onRollCliveEscape,
  onSetChaseDice
}: TabStoryEndingProps) {
  const [pwGate1, setPwGate1] = useState('');
  const [pwGate2, setPwGate2] = useState('');
  const [pwGate3, setPwGate3] = useState('');
  const [errGate1, setErrGate1] = useState('');
  const [errGate2, setErrGate2] = useState('');
  const [errGate3, setErrGate3] = useState('');

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

      {/* 2. 관문 1: 5단계 ★빈 무덤의 반전 (암호: 1889) */}
      <section className="p-4 rounded-2xl bg-stone-900 border border-amber-700/60 space-y-3">
        <div className="flex items-center justify-between border-b border-stone-800 pb-2">
          <h2 className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
            {room.gate1Unlocked ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <Lock className="w-4 h-4 text-amber-400" />
            )}
            5단계. 긴급 상황 발생 (새로운 국면)
          </h2>
          <span
            className={`text-[10px] px-2 py-0.5 rounded font-bold ${
              room.gate1Unlocked
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50'
                : 'bg-amber-950 text-amber-300 border border-amber-700/50'
            }`}
          >
            {room.gate1Unlocked ? '해금 완료' : '🔒 관문 1 잠김'}
          </span>
        </div>

        {!room.gate1Unlocked ? (
          <div className="space-y-2.5">
            <p className="text-xs text-stone-300 leading-relaxed">
              4단계 전반전 대화와 밀담(20분)이 종료된 후, 진행자가 안내하는 <b>관문 1 해금 암호</b>를 입력하면 새로운 사건 대본과 2차 조사 구역이 열립니다.
            </p>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setErrGate1('');
                const ok = await onUnlockGate(1, pwGate1);
                if (!ok)
                  setErrGate1(
                    '암호가 일치하지 않습니다. 진행자에게 5단계 암호를 확인하세요.'
                  );
              }}
              className="flex gap-2"
            >
              <div className="relative flex-1">
                <KeyRound className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={pwGate1}
                  onChange={(e) => setPwGate1(e.target.value)}
                  placeholder="관문 1 암호 입력"
                  className="w-full pl-8 pr-3 py-2 rounded-lg bg-stone-950 border border-stone-700 text-amber-200 text-xs font-mono font-bold"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-extrabold text-xs shrink-0"
              >
                사건 해금
              </button>
            </form>
            {errGate1 && <p className="text-[11px] text-rose-400">{errGate1}</p>}
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

      {/* 3. 관문 2: 9~12단계 ★비밀 지목 & 행크 추격전 결판 (암호: 0607) */}
      <section className="p-4 rounded-2xl bg-stone-900 border border-amber-700/60 space-y-4">
        <div className="flex items-center justify-between border-b border-stone-800 pb-2">
          <h2 className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
            {room.gate2Unlocked ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <Lock className="w-4 h-4 text-amber-400" />
            )}
            9~12단계. 최후의 변론 및 최종 결판
          </h2>
          <span
            className={`text-[10px] px-2 py-0.5 rounded font-bold ${
              room.gate2Unlocked
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50'
                : 'bg-amber-950 text-amber-300 border border-amber-700/50'
            }`}
          >
            {room.gate2Unlocked ? '해금 완료' : '🔒 관문 2 잠김'}
          </span>
        </div>

        {!room.gate2Unlocked ? (
          <div className="space-y-2.5">
            <p className="text-xs text-stone-300 leading-relaxed">
              8단계 최후 변론(7분)이 끝난 직후, 진행자가 안내하는 <b>관문 2 해금 암호</b>를 입력하면 <b>최후의 비밀 지목 단계</b>와 <b>최종 투표 및 결판 단계</b>가 열립니다.
            </p>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setErrGate2('');
                const ok = await onUnlockGate(2, pwGate2);
                if (!ok)
                  setErrGate2(
                    '암호가 일치하지 않습니다. 진행자에게 9단계 암호를 확인하세요.'
                  );
              }}
              className="flex gap-2"
            >
              <div className="relative flex-1">
                <KeyRound className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={pwGate2}
                  onChange={(e) => setPwGate2(e.target.value)}
                  placeholder="관문 2 암호 입력"
                  className="w-full pl-8 pr-3 py-2 rounded-lg bg-stone-950 border border-stone-700 text-amber-200 text-xs font-mono font-bold"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-extrabold text-xs shrink-0"
              >
                클라이맥스 해금
              </button>
            </form>
            {errGate2 && <p className="text-[11px] text-rose-400">{errGate2}</p>}
          </div>
        ) : (
          <div className="space-y-5">
            {/* 9단계: 1분 비밀 지목 (최후 변론 직후 / 행동 단계 전) */}
            <div className="p-3.5 rounded-xl bg-stone-950 border border-amber-700/50 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Crosshair className="w-4 h-4 text-amber-400" /> [9단계] 최후 변론 직후 1분 비밀 지목
                </h3>
                <span className="text-[10px] text-stone-400">
                  행동 단계 돌입 전 실시
                </span>
              </div>

              <div className="flex gap-2 text-[11px]">
                <span
                  className={`flex-1 p-2 rounded-lg border text-center font-semibold ${
                    room.cliveSecretPick
                      ? 'bg-emerald-950/50 border-emerald-700 text-emerald-300'
                      : 'bg-stone-900 border-stone-800 text-stone-400'
                  }`}
                >
                  ⭐ 클라이브(조력자 지목):{' '}
                  {room.cliveSecretPick ? '제출 완료 ✓' : '대기 중...'}
                </span>
                <span
                  className={`flex-1 p-2 rounded-lg border text-center font-semibold ${
                    room.graceSecretPick
                      ? 'bg-emerald-950/50 border-emerald-700 text-emerald-300'
                      : 'bg-stone-900 border-stone-800 text-stone-400'
                  }`}
                >
                  ⛪ 그레이스(매드독 지목):{' '}
                  {room.graceSecretPick ? '제출 완료 ✓' : '대기 중...'}
                </span>
              </div>

              {/* 클라이브 본인에게만 보이는 조력자 지목 UI */}
              {character.id === 'clive' && (
                <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-600/60 space-y-2">
                  <div className="text-xs font-bold text-amber-200">
                    🔫 [클라이브 전용] 행크의 조력자(+2점 목표) 비밀 지목
                  </div>
                  <p className="text-[11px] text-stone-300">
                    마을 주민 중 행크를 돕고 있는 조력자(플로렌스 또는 그레이스)로 의심되는 1명을 선택하세요. 적중 시 클라이브 +2점 획득 & 해당 조력자의 은폐 점수(+2점)를 0점으로 삭감합니다!
                  </p>
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    {activeChars
                      .filter((c) => c.id !== 'clive')
                      .map((target) => {
                        const isPicked = room.cliveSecretPick === target.id;
                        return (
                          <button
                            key={target.id}
                            onClick={() =>
                              onSubmitSecretPick('clive', target.id)
                            }
                            className={`p-2 rounded-lg text-xs font-bold border text-left transition ${
                              isPicked
                                ? 'bg-amber-600 border-amber-400 text-stone-950'
                                : 'bg-stone-900 border-stone-700 text-stone-200'
                            }`}
                          >
                            {target.emoji} {target.name.split(' ')[0]}{' '}
                            {isPicked ? '✓' : ''}
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* 그레이스 본인에게만 보이는 매드독 지목 UI */}
              {character.id === 'grace' && (
                <div className="p-3 rounded-lg bg-purple-950/30 border border-purple-500/60 space-y-2">
                  <div className="text-xs font-bold text-purple-200">
                    ⛪ [그레이스 전용] &lsquo;매드독&rsquo;의 정체(+3점 목표) 비밀 지목
                  </div>
                  <p className="text-[11px] text-stone-300">
                    10년 전 매드독 갱단을 몰살한 두목 &lsquo;매드독&rsquo;으로 의심되는 인물 1명을 선택하세요. (선택 내역은 13단계 엔딩 해금 전까지 비공개됩니다)
                  </p>
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    {activeChars
                      .filter((c) => c.id !== 'grace')
                      .map((target) => {
                        const isPicked = room.graceSecretPick === target.id;
                        return (
                          <button
                            key={target.id}
                            onClick={() =>
                              onSubmitSecretPick('grace', target.id)
                            }
                            className={`p-2 rounded-lg text-xs font-bold border text-left transition ${
                              isPicked
                                ? 'bg-purple-500 border-purple-300 text-stone-950'
                                : 'bg-stone-900 border-stone-700 text-stone-200'
                            }`}
                          >
                            {target.emoji} {target.name.split(' ')[0]}{' '}
                            {isPicked ? '✓' : ''}
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>

            {/* 11단계: 최종 투표 유치장 수감자 지정 & 클라이브 탈옥 주사위 */}
            <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 space-y-3">
              <h3 className="text-xs font-bold text-amber-300">
                ⛓️ [11단계] 최종 투표 최다 득표자 (유치장 수감 1인)
              </h3>
              <p className="text-[11px] text-stone-400">
                10단계(행동 스킬)와 11단계(최종 투표) 결과, 최다 득표로 유치장에 수감된 인물 1명을 선택하세요. 수감자는 추격전에 참여할 수 없습니다.
              </p>

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
                          : 'bg-stone-900 border-stone-700 text-stone-300'
                      }`}
                    >
                      {c.emoji} {c.name.split(' ')[0]}{' '}
                      {isJailed ? '(수감됨 ⛓️)' : ''}
                    </button>
                  );
                })}
              </div>

              {/* 클라이브 수감 시: 4 이상 탈옥 주사위 판정기 */}
              {room.jailedCharacter === 'clive' && (
                <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-600/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-200">
                      🎲 클라이브 유치장 탈옥 판정 (주사위 4 이상 탈옥!)
                    </span>
                    <button
                      onClick={() => {
                        const r = Math.floor(Math.random() * 6) + 1;
                        onRollCliveEscape(r);
                      }}
                      className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-stone-950 font-extrabold text-xs"
                    >
                      주사위 굴리기
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-stone-400 mr-1">
                      직접 입력:
                    </span>
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <button
                        key={n}
                        onClick={() => onRollCliveEscape(n)}
                        className={`w-7 h-7 rounded font-mono text-xs font-bold border ${
                          room.cliveEscapeRoll === n
                            ? 'bg-amber-500 border-amber-300 text-stone-950'
                            : 'bg-stone-900 border-stone-700 text-stone-300'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                  {room.cliveEscapeRoll !== null && (
                    <div
                      className={`text-xs font-bold p-2 rounded ${
                        room.cliveEscapeRoll >= 4
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700'
                          : 'bg-rose-950/80 text-rose-300 border border-rose-700'
                      }`}
                    >
                      주사위 결과: [{room.cliveEscapeRoll}] ➔{' '}
                      {room.cliveEscapeRoll >= 4
                        ? '💥 탈옥 성공! 클라이브가 유치장을 부수고 행크 추격전에 정상 합류합니다!'
                        : '⛓️ 탈옥 실패 (1~3)! 클라이브는 추격전에 참여할 수 없습니다.'}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 12단계: 행크 추격전 주사위 & 아이템 자동 합산기 */}
            <div className="p-3.5 rounded-xl bg-stone-950 border border-amber-700/60 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Dices className="w-4 h-4 text-amber-400" /> [12단계] 행크 추격전 주사위 결판 (막타 독점)
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
                        <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-stone-800/80">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5, 6].map((n) => (
                              <button
                                key={n}
                                onClick={() =>
                                  onSetChaseDice(
                                    c.id,
                                    diceVal === n ? null : n
                                  )
                                }
                                className={`w-6 h-6 rounded text-xs font-mono font-bold border ${
                                  diceVal === n
                                    ? 'bg-amber-500 border-amber-300 text-stone-950'
                                    : 'bg-stone-950 border-stone-700 text-stone-300'
                                }`}
                              >
                                {n}
                              </button>
                            ))}
                          </div>
                          <button
                            onClick={() => {
                              const rand = Math.floor(Math.random() * 6) + 1;
                              onSetChaseDice(c.id, rand);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-amber-700 hover:bg-amber-600 text-stone-950 font-bold text-[11px]"
                          >
                            🎲 굴리기
                          </button>
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

      {/* 4. 관문 3: 13단계 ★멀티 엔딩 북 & 진상 해설서 (암호: 9999) */}
      <section className="p-4 rounded-2xl bg-stone-900 border border-amber-700/60 space-y-4">
        <div className="flex items-center justify-between border-b border-stone-800 pb-2">
          <h2 className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
            {room.gate3Unlocked ? (
              <Trophy className="w-4 h-4 text-amber-400" />
            ) : (
              <Lock className="w-4 h-4 text-amber-400" />
            )}
            13단계. 캐릭터별 결말 (Ending A~G) & 진상 해설서
          </h2>
          <span
            className={`text-[10px] px-2 py-0.5 rounded font-bold ${
              room.gate3Unlocked
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50'
                : 'bg-amber-950 text-amber-300 border border-amber-700/50'
            }`}
          >
            {room.gate3Unlocked ? '해금 완료' : '🔒 관문 3 잠김'}
          </span>
        </div>

        {!room.gate3Unlocked ? (
          <div className="space-y-2.5">
            <p className="text-xs text-stone-300 leading-relaxed">
              최종 결판이 모두 끝난 뒤, 진행자가 안내하는 <b>관문 3 해금 암호</b>를 입력하면 <b>비밀 지목 채점 결과, 캐릭터별 최종 결말(Ending A~G), 사건의 전말 해설서</b>가 공개됩니다.
            </p>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setErrGate3('');
                const ok = await onUnlockGate(3, pwGate3);
                if (!ok)
                  setErrGate3(
                    '암호가 일치하지 않습니다. 진행자에게 13단계 암호를 확인하세요.'
                  );
              }}
              className="flex gap-2"
            >
              <div className="relative flex-1">
                <KeyRound className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={pwGate3}
                  onChange={(e) => setPwGate3(e.target.value)}
                  placeholder="관문 3 암호 입력"
                  className="w-full pl-8 pr-3 py-2 rounded-lg bg-stone-950 border border-stone-700 text-amber-200 text-xs font-mono font-bold"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-extrabold text-xs shrink-0"
              >
                결말 해금
              </button>
            </form>
            {errGate3 && <p className="text-[11px] text-rose-400">{errGate3}</p>}
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

            {/* 엔딩 선택 탭 (Ending A ~ G + 애니&베니 공동 1등) */}
            <div className="space-y-3">
              <div className="text-xs text-stone-300 leading-relaxed bg-amber-950/20 p-3 rounded-xl border border-amber-800/40">
                🏆 <b>엔딩 낭독 규칙</b>: 최종 점수 1위 캐릭터의 이니셜 엔딩을 낭독합니다. (동점 시 <b>[12단계: 행크 추격전] 주사위 1등</b> 우선 승리 / 단, <b>애니와 베니가 공동 1등</b>일 때는 <b>Ending A + B</b>를 함께 연속 낭독!)
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
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
