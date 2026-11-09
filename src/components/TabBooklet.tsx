'use client';

import React, { useState } from 'react';
import { CHARACTERS, CHARACTER_MAP } from '@/data/characters';
import { GM_TIMETABLE_GUIDE } from '@/data/timetable';
import { CharacterData, CharacterId, CharacterSkill, RoomState } from '@/types/game';
import {
  BookOpen,
  CheckSquare,
  Square,
  Flame,
  Lock,
  Sparkles,
  FileSignature,
  AlertTriangle
} from 'lucide-react';

interface TabBookletProps {
  character: CharacterData;
  room: RoomState;
  onSetBribe: (residentId: CharacterId | null) => void;
  onUnlockGate?: (gate: 0 | 1 | 2 | 3) => Promise<boolean>;
}

export default function TabBooklet({
  character,
  room,
  onSetBribe,
  onUnlockGate
}: TabBookletProps) {
  const [checkedGoals, setCheckedGoals] = useState<Record<string, boolean>>({});
  const [fullscreenSkill, setFullscreenSkill] = useState<CharacterSkill | null>(
    null
  );

  const isBribedByClive = room.bribedResident === character.id;

  const toggleGoal = (goalId: string) => {
    setCheckedGoals((prev) => ({ ...prev, [goalId]: !prev[goalId] }));
  };

  const totalCheckedPoints = character.goals.reduce((sum, g) => {
    const isLocked = g.isHiddenUntilMidEvent && !room.gate1Unlocked;
    if (isLocked) return sum;
    return checkedGoals[g.id] ? sum + g.points : sum;
  }, 0);

  const residentList = CHARACTERS.filter((c) => c.id !== 'clive');

  // 진행자(GM) 전용 마스터 대시보드 화면
  if (character.id === 'gm') {
    return (
      <div className="space-y-5 pb-8">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950 via-stone-900 to-stone-900 border border-amber-600/70 shadow-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-900 text-amber-200 border border-amber-500/60">
              🎩 진행자(GM) 전용 마스터 대시보드
            </span>
            <span className="text-xs text-amber-300 font-semibold">
              방 코드: {room.roomCode}
            </span>
          </div>
          <p className="text-sm font-bold text-amber-100 pt-1">
            테이블의 몰입과 시간을 책임지는 마스터 컨트롤 타워입니다.
          </p>
        </div>

        {/* 마스터 원터치 전원 해금 제어판 */}
        <section className="p-4 rounded-xl bg-stone-900/90 border border-amber-600/50 space-y-3">
          <div className="flex items-center justify-between border-b border-stone-800 pb-2">
            <h2 className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
              🔑 마스터 원터치 전원 해금 컨트롤러
            </h2>
            <span className="text-[11px] text-amber-400 font-semibold">
              터치 시 전체 플레이어 화면 즉시 자동 해금
            </span>
          </div>
          <p className="text-xs text-stone-300 leading-relaxed">
            마스터가 아래 버튼을 누르면 <b>모든 플레이어의 기기에서 해당 구간이 즉시 자동 해금</b>되어 실시간 동기화됩니다.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 flex items-center justify-between gap-2">
              <div className="space-y-0.5">
                <div className="font-bold text-stone-200">1차 단서 조사 시작</div>
                <div className="text-[11px] text-stone-400">1차 조사 카드 5개 구역 오픈</div>
              </div>
              {onUnlockGate && (
                <button
                  onClick={() => onUnlockGate(0)}
                  disabled={room.gate0Unlocked}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs transition ${
                    room.gate0Unlocked
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/50 cursor-default'
                      : 'bg-amber-600 hover:bg-amber-500 text-stone-950 shadow'
                  }`}
                >
                  {room.gate0Unlocked ? '✓ 전원 해금됨' : '🔓 원터치 해금'}
                </button>
              )}
            </div>

            <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 flex items-center justify-between gap-2">
              <div className="space-y-0.5">
                <div className="font-bold text-stone-200">긴급 상황 발생 (새로운 국면)</div>
                <div className="text-[11px] text-stone-400">사건 대본 및 6·7구역 오픈</div>
              </div>
              {onUnlockGate && (
                <button
                  onClick={() => onUnlockGate(1)}
                  disabled={room.gate1Unlocked}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs transition ${
                    room.gate1Unlocked
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/50 cursor-default'
                      : 'bg-amber-600 hover:bg-amber-500 text-stone-950 shadow'
                  }`}
                >
                  {room.gate1Unlocked ? '✓ 전원 해금됨' : '🔓 원터치 해금'}
                </button>
              )}
            </div>

            <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 flex items-center justify-between gap-2">
              <div className="space-y-0.5">
                <div className="font-bold text-stone-200">최후의 변론 및 최종 결판</div>
                <div className="text-[11px] text-stone-400">비밀 지목 및 최종 결판 오픈</div>
              </div>
              {onUnlockGate && (
                <button
                  onClick={() => onUnlockGate(2)}
                  disabled={room.gate2Unlocked}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs transition ${
                    room.gate2Unlocked
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/50 cursor-default'
                      : 'bg-amber-600 hover:bg-amber-500 text-stone-950 shadow'
                  }`}
                >
                  {room.gate2Unlocked ? '✓ 전원 해금됨' : '🔓 원터치 해금'}
                </button>
              )}
            </div>

            <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 flex items-center justify-between gap-2">
              <div className="space-y-0.5">
                <div className="font-bold text-stone-200">최종 결말 & 진상 해설</div>
                <div className="text-[11px] text-stone-400">캐릭터별 엔딩 & 해설 오픈</div>
              </div>
              {onUnlockGate && (
                <button
                  onClick={() => onUnlockGate(3)}
                  disabled={room.gate3Unlocked}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs transition ${
                    room.gate3Unlocked
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/50 cursor-default'
                      : 'bg-amber-600 hover:bg-amber-500 text-stone-950 shadow'
                  }`}
                >
                  {room.gate3Unlocked ? '✓ 전원 해금됨' : '🔓 원터치 해금'}
                </button>
              )}
            </div>
          </div>
        </section>

        {/* 13단계 상세 마스터 가이드 */}
        <section className="p-4 rounded-xl bg-stone-900/90 border border-stone-800 space-y-3">
          <h2 className="text-sm font-bold text-amber-300 flex items-center gap-1.5 border-b border-stone-800 pb-2">
            📜 상세 진행 가이드
          </h2>
          <div className="space-y-3 text-xs">
            {GM_TIMETABLE_GUIDE.map((g) => (
              <div key={g.step} className="p-3 rounded-xl bg-stone-950 border border-stone-800/80 space-y-1">
                <div className="font-bold text-amber-200">{g.title}</div>
                <p className="text-stone-300 leading-relaxed">{g.actions}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-8">
      {/* 상단 캐릭터 명언 배너 */}
      <div
        className={`p-4 rounded-2xl bg-gradient-to-br ${character.colorClass} border ${character.accentBorder}/60 shadow-lg space-y-2`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-stone-950/80 text-amber-300 border border-amber-700/50">
            1인칭 극비 설정집 · 본인 외 열람 엄금
          </span>
          <span className="text-xs font-semibold text-stone-300">
            만점: {character.maxPoints}점
          </span>
        </div>
        <p className="text-sm font-serif italic text-amber-100 leading-relaxed pt-1">
          &ldquo;{character.quote}&rdquo;
        </p>
      </div>

      {/* 사법거래 회유서 수락 알림 배너 (매수된 주민에게 표시) */}
      {isBribedByClive && (
        <div className="p-3.5 rounded-xl bg-amber-950/70 border-2 border-amber-500 text-amber-100 space-y-1 shadow-md">
          <div className="flex items-center gap-1.5 font-bold text-xs text-amber-300">
            <FileSignature className="w-4 h-4" /> [사법거래 성립] 클라이브의 회유서를 수락했습니다!
          </div>
          <p className="text-xs leading-relaxed text-amber-100/90">
            당신의 기존 5점 목표가 <b>[클라이브 최종 승리 시 (+5점)]</b>으로 변경되었습니다! 이제 본인이 최종 투표에서 유치장에 수감되더라도 후반전 최종 결판에서 클라이브가 승리하면 +5점을 획득합니다.
          </p>
        </div>
      )}

      {/* ① 나의 배경 스토리 */}
      <section className="p-4 rounded-xl bg-stone-900/90 border border-stone-800 space-y-3">
        <h2 className="text-sm font-bold text-amber-300 flex items-center gap-1.5 border-b border-stone-800 pb-2">
          <BookOpen className="w-4 h-4" /> ① 나의 배경 스토리 (절대 비밀)
        </h2>
        <div className="space-y-2.5 text-xs text-stone-200 leading-relaxed">
          {character.secretStory.map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>
      </section>

      {/* ② 어젯밤 내가 저지른 일 */}
      <section className="p-4 rounded-xl bg-stone-900/90 border border-stone-800 space-y-3">
        <h2 className="text-sm font-bold text-amber-300 flex items-center gap-1.5 border-b border-stone-800 pb-2">
          <Sparkles className="w-4 h-4" /> ② {character.lastNightActionsTitle}
        </h2>
        <ul className="space-y-2 text-xs text-stone-200 leading-relaxed list-disc pl-4">
          {character.lastNightActions.map((act, idx) => (
            <li key={idx}>{act}</li>
          ))}
        </ul>
      </section>

      {/* ③ 나의 승리 목표 & 점수 계산기 */}
      <section className="p-4 rounded-xl bg-stone-900/90 border border-stone-800 space-y-3">
        <div className="flex items-center justify-between border-b border-stone-800 pb-2">
          <h2 className="text-sm font-bold text-amber-300">
            ③ 나의 승리 목표 & 점수표 ({character.maxPoints}점 만점)
          </h2>
          <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-amber-950 border border-amber-600/60 text-amber-300">
            예상 점수: {totalCheckedPoints} / {character.maxPoints}점
          </span>
        </div>

        <p className="text-[11px] text-stone-400">
          목표 항목을 터치해 달성 여부를 직접 체크해 볼 수 있습니다.
        </p>

        <div className="space-y-2.5">
          {character.goals.map((goal) => {
            const isLocked = goal.isHiddenUntilMidEvent && !room.gate1Unlocked;
            const isReplacedByBribe =
              isBribedByClive && goal.canBeReplacedByBribe;

            if (isLocked) {
              return (
                <div
                  key={goal.id}
                  className="p-3 rounded-xl bg-stone-950/80 border border-stone-800 flex items-center justify-between text-stone-500"
                >
                  <div className="flex items-center gap-2 text-xs">
                    <Lock className="w-4 h-4 text-amber-600/70 shrink-0" />
                    <span>
                      <b>[{goal.label}] (+{goal.points}점)</b> — 새로운 사건 발생 후 공개됩니다.
                    </span>
                  </div>
                </div>
              );
            }

            const displayTitle = isReplacedByBribe
              ? '🔄 [사법거래 대체] 클라이브가 최종 승리한다'
              : goal.title;
            const displayDesc = isReplacedByBribe
              ? '클라이브의 사법거래 회유서를 수락하여 목표가 변경되었습니다! 후반전 최종 결판에서 클라이브가 주사위 1위로 승리하면 (내가 투표로 수감되더라도) +5점을 획득합니다!'
              : goal.description;

            const isChecked = !!checkedGoals[goal.id];

            return (
              <button
                key={goal.id}
                onClick={() => toggleGoal(goal.id)}
                className={`w-full text-left p-3 rounded-xl border transition flex items-start gap-2.5 ${
                  isChecked
                    ? 'bg-amber-950/40 border-amber-500/80'
                    : 'bg-stone-950/70 border-stone-800 hover:border-stone-700'
                }`}
              >
                <div className="mt-0.5 text-amber-400 shrink-0">
                  {isChecked ? (
                    <CheckSquare className="w-4 h-4" />
                  ) : (
                    <Square className="w-4 h-4 text-stone-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-amber-200">
                      [{goal.label}] {displayTitle}
                    </span>
                    <span className="text-xs font-extrabold px-2 py-0.5 rounded bg-amber-900/60 text-amber-200 shrink-0">
                      +{goal.points}점
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-300 leading-relaxed">
                    {displayDesc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ④ 나의 시그니처 능력 & 전체화면 제시 */}
      <section className="p-4 rounded-xl bg-stone-900/90 border border-stone-800 space-y-3">
        <h2 className="text-sm font-bold text-amber-300 flex items-center gap-1.5 border-b border-stone-800 pb-2">
          <Flame className="w-4 h-4 text-amber-400" /> ④ 나의 시그니처 특수 능력 (게임 중 1회)
        </h2>

        <div className="space-y-3">
          {character.skills.map((skill) => (
            <div
              key={skill.id}
              className="p-3.5 rounded-xl bg-stone-950 border border-amber-800/50 space-y-2.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-amber-300">
                  {skill.itemName}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-900/50 text-amber-200 border border-amber-700/50">
                  {skill.priorityBadge}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-stone-900 border border-stone-800 text-amber-100 font-serif font-bold text-sm text-center">
                {skill.quote}
              </div>

              <p className="text-xs text-stone-300 leading-relaxed">
                <b className="text-amber-300">발동 시점 ({skill.timing}):</b>{' '}
                {skill.description}
              </p>

              {skill.warning && (
                <div className="p-2 rounded bg-rose-950/40 border border-rose-800/50 text-[11px] text-rose-200 flex items-start gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                  <span>{skill.warning}</span>
                </div>
              )}

              <button
                onClick={() => setFullscreenSkill(skill)}
                className="w-full py-2.5 rounded-lg bg-amber-700 hover:bg-amber-600 text-stone-950 font-extrabold text-xs transition shadow"
              >
                🔥 시그니처 대사 카드 전체화면으로 제시하기
              </button>
            </div>
          ))}
        </div>

        {/* 클라이브 전용: 사법거래 회유서 발송 컨트롤 */}
        {character.id === 'clive' && (
          <div className="mt-3 p-3.5 rounded-xl bg-amber-950/30 border border-amber-700/60 space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
              <FileSignature className="w-4 h-4" /> [클라이브 전용] 사법거래 회유서 대상 지정
            </div>
            <p className="text-[11px] text-stone-300 leading-relaxed">
              1:1 밀담에서 회유서를 건네 수락받은 주민 1명을 선택하면, 해당 플레이어의 스마트폰 설정집에 <b>[클라이브 최종 승리 시 (+5점)]</b> 목표 변경이 즉시 연동됩니다.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {residentList.map((res) => {
                const selected = room.bribedResident === res.id;
                return (
                  <button
                    key={res.id}
                    onClick={() => onSetBribe(selected ? null : res.id)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition ${
                      selected
                        ? 'bg-amber-600 border-amber-400 text-stone-950'
                        : 'bg-stone-900 border-stone-700 text-stone-300 hover:border-amber-600'
                    }`}
                  >
                    {res.emoji} {res.name.split(' ')[0]} {selected ? '(매수됨 ✓)' : ''}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 고유 패시브 표시 (클라이브) */}
        {character.passives && (
          <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
            <h3 className="text-xs font-bold text-amber-300">
              ⚡ {character.passives.title}
            </h3>
            <ul className="space-y-1.5 text-xs text-stone-300 list-disc pl-4 leading-relaxed">
              {character.passives.items.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* 시그니처 카드 전체화면 제시 모달 */}
      {fullscreenSkill && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-6 text-center"
          onClick={() => setFullscreenSkill(null)}
        >
          <div className="max-w-sm w-full p-6 rounded-3xl bg-gradient-to-b from-amber-950 via-stone-900 to-stone-950 border-2 border-amber-500 shadow-2xl space-y-5">
            <div className="text-5xl">{character.emoji}</div>
            <div className="space-y-1">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-900/70 text-amber-200 border border-amber-600">
                {character.name} · {fullscreenSkill.priorityBadge}
              </span>
              <h3 className="text-sm font-bold text-stone-300 pt-2">
                {fullscreenSkill.itemName}
              </h3>
            </div>

            <div className="py-6 px-4 rounded-2xl bg-stone-950/90 border border-amber-600/60">
              <p className="text-2xl font-serif font-extrabold text-amber-300 leading-snug">
                {fullscreenSkill.quote}
              </p>
            </div>

            <p className="text-xs text-stone-200 leading-relaxed">
              {fullscreenSkill.description}
            </p>

            <button
              onClick={() => setFullscreenSkill(null)}
              className="w-full py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold"
            >
              화면 닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
