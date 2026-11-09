'use client';

import React, { useState } from 'react';
import { CLUE_CARDS, ZONES } from '@/data/cards';
import { CHARACTER_MAP } from '@/data/characters';
import { CharacterData, RoomState } from '@/types/game';
import { Lock, Search, CheckCircle2, KeyRound, Info, ChevronDown, ChevronUp } from 'lucide-react';

interface TabClueMapProps {
  character: CharacterData;
  room: RoomState;
  onAcquireCard: (cardId: string) => void;
  onUnlockGate: (gate: 0 | 1 | 2 | 3, password: string) => Promise<boolean>;
  onSwitchToInventory: () => void;
}

export default function TabClueMap({
  character,
  room,
  onAcquireCard,
  onUnlockGate,
  onSwitchToInventory
}: TabClueMapProps) {
  const [selectedZoneId, setSelectedZoneId] = useState<number>(1);
  const [gate0Password, setGate0Password] = useState('');
  const [gate1Password, setGate1Password] = useState('');
  const [unlock0Error, setUnlock0Error] = useState('');
  const [unlock1Error, setUnlock1Error] = useState('');
  const [justAcquiredCardId, setJustAcquiredCardId] = useState<string | null>(
    null
  );
  const [showOrderGuide, setShowOrderGuide] = useState<boolean>(true);

  const visibleZones = ZONES.filter((z) => z.act === 1 || room.gate1Unlocked);
  const currentZone =
    visibleZones.find((z) => z.id === selectedZoneId) || visibleZones[0];
  const zoneCards = CLUE_CARDS.filter((c) => c.zoneId === currentZone.id);

  const myCardCount = Object.values(room.cardOwners).filter(
    (owner) => owner === character.id
  ).length;

  const remainingAct1Cards = CLUE_CARDS.filter(
    (c) => c.act === 1 && !room.cardOwners[c.id]
  ).length;
  const remainingAllCards = CLUE_CARDS.filter(
    (c) => (c.act === 1 || room.gate1Unlocked) && !room.cardOwners[c.id]
  ).length;

  const handleUnlockGate0 = async (e: React.FormEvent) => {
    e.preventDefault();
    setUnlock0Error('');
    const ok = await onUnlockGate(0, gate0Password);
    if (!ok) {
      setUnlock0Error(
        '암호가 올바르지 않습니다. 진행자에게 3단계 해금 암호를 확인하세요.'
      );
    } else {
      setGate0Password('');
    }
  };

  const handleUnlockGate1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setUnlock1Error('');
    const ok = await onUnlockGate(1, gate1Password);
    if (!ok) {
      setUnlock1Error(
        '암호가 올바르지 않습니다. 진행자에게 5단계 해금 암호를 확인하세요.'
      );
    } else {
      setGate1Password('');
      setSelectedZoneId(6);
    }
  };

  return (
    <div className="space-y-4 pb-8">
      {/* 조사 순서 & 방식 안내 아코디언 */}
      <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-700/60 space-y-2">
        <button
          onClick={() => setShowOrderGuide(!showOrderGuide)}
          className="w-full flex items-center justify-between text-left"
        >
          <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
            📋 공식 조사 순서 & 드래프트 규칙 (필독)
          </span>
          {showOrderGuide ? (
            <ChevronUp className="w-4 h-4 text-amber-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-amber-400" />
          )}
        </button>

        {showOrderGuide && (
          <div className="pt-2 border-t border-amber-800/50 space-y-2 text-[11px] text-stone-200 leading-relaxed">
            <div className="p-2.5 rounded-xl bg-stone-950/80 border border-stone-800 space-y-1">
              <div className="font-bold text-amber-300">
                ① [3단계: 1차 조사] — 스네이크 드래프트 (1인당 1장씩 2바퀴 = 총 2장)
              </div>
              <p>
                • <b>1바퀴째 (첫 1장)</b>: 수사관 <b>🔫 클라이브부터 시계 방향</b>으로 1장씩 선택합니다.
                <br />
                <span className="text-stone-400">
                  (순서: 클라이브 ➔ 애니 ➔ 베니 ➔ 데이비드 ➔ 어니스트 ➔ 플로렌스 ➔ 그레이스)
                </span>
              </p>
              <p>
                • <b>2바퀴째 (두 번째 1장)</b>: 마지막 순번이었던 <b>⛪ 그레이스(6인 시 플로렌스)부터 역순(반시계 방향)</b>으로 1장씩 선택합니다.
              </p>
              <p className="text-amber-200 font-semibold">
                ★ 셀프 은폐 방지 규칙: 1차 조사의 첫 번째 바퀴(첫 1장)에서는 본인이 관리하는 구역(예: 데이비드=보안관 사무소, 플로렌스=진료소 등)을 뽑을 수 없으며, 2바퀴째부터 내 구역도 조사할 수 있습니다!
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-stone-950/80 border border-stone-800 space-y-1">
              <div className="font-bold text-amber-300">
                ② [6단계: 2차 조사] — 역순 시작 (신규 6·7구역 7장 + 1차 잔여 3장 = 총 10장)
              </div>
              <p>
                • <b>1바퀴째 (첫 1장)</b>: 1차 조사와 반대로 <b>⛪ 그레이스(6인 시 플로렌스)부터 반시계 방향</b>으로 1장씩 선택합니다 (마지막이 클라이브).
              </p>
              <p>
                • <b>남은 3장 처리</b>: 6인 플레이 시에는 다시 역순으로 1장씩 더 뽑아 24장을 모두 가져갑니다. 7인 플레이 시에는 <b>클라이브부터 시계 방향으로 3명(클라이브·애니·베니) 또는 주사위 높은 순 3명</b>이 1장씩 추가 획득하거나, 합의 하에 광장 공용 단서로 개봉합니다.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 관문 0 잠금: 1차 조사 시작 전 잠금 화면 */}
      {!room.gate0Unlocked ? (
        <div className="p-5 rounded-2xl bg-stone-900 border-2 border-amber-700/70 space-y-3 text-center shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-amber-950/80 border border-amber-600/60 flex items-center justify-center mx-auto text-amber-400">
            <Lock className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-extrabold text-amber-200">
              [🔒 관문 0 잠김] 3단계: 1차 조사 시작 대기 중
            </h3>
            <p className="text-xs text-stone-300 leading-relaxed">
              1단계(설정집 정독)와 2단계(자기소개 및 1차 발언)가 모두 끝나기 전에는 단서 카드를 미리 뽑을 수 없습니다.
              <br />
              자기소개가 끝난 후 진행자가 알려주는 <b>1차 조사 해금 암호</b>를 입력하세요!
            </p>
          </div>
          <form onSubmit={handleUnlockGate0} className="flex gap-2 pt-1 max-w-xs mx-auto">
            <div className="relative flex-1">
              <KeyRound className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={gate0Password}
                onChange={(e) => setGate0Password(e.target.value)}
                placeholder="1차 조사 암호 입력"
                className="w-full pl-8 pr-3 py-2 rounded-lg bg-stone-950 border border-stone-700 text-amber-200 text-xs font-mono font-bold focus:outline-none focus:border-amber-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-extrabold text-xs shrink-0"
            >
              조사 시작
            </button>
          </form>
          {unlock0Error && (
            <p className="text-[11px] text-rose-400 font-medium">{unlock0Error}</p>
          )}
        </div>
      ) : (
        <>
          {/* 조사 현황 요약 바 */}
          <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-between gap-2">
            <div className="space-y-0.5">
              <h2 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5" /> 마을 단서 구역 조사 (
                {room.gate1Unlocked ? '2차 조사 포함 7개 구역' : '1차 조사 5개 구역'})
              </h2>
              <p className="text-[11px] text-stone-400">
                카드 뒷면은 지역명만 표시됩니다. 내 차례에 터치하면 내 소지품으로 독점 획득됩니다.
              </p>
            </div>
            <div className="text-right shrink-0">
              <div className="text-xs font-bold text-amber-200">
                내 보유: {myCardCount}장
              </div>
              <div className="text-[10px] text-stone-400">
                남은 카드: {room.gate1Unlocked ? remainingAllCards : remainingAct1Cards}장
              </div>
            </div>
          </div>

          {/* 구역 선택 탭 버튼 */}
          <div className="grid grid-cols-2 gap-2">
            {visibleZones.map((zone) => {
              const cardsInZone = CLUE_CARDS.filter((c) => c.zoneId === zone.id);
              const leftCount = cardsInZone.filter(
                (c) => !room.cardOwners[c.id]
              ).length;
              const isSelected = currentZone.id === zone.id;

              return (
                <button
                  key={zone.id}
                  onClick={() => setSelectedZoneId(zone.id)}
                  className={`p-2.5 rounded-xl border text-left transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-amber-950/70 border-amber-500 text-amber-100 shadow'
                      : 'bg-stone-900/80 border-stone-800 text-stone-300 hover:border-stone-700'
                  }`}
                >
                  <div className="min-w-0 pr-1">
                    <div className="text-xs font-bold truncate">
                      {zone.emoji} {zone.id}. {zone.name}
                    </div>
                    <div className="text-[10px] text-stone-400 truncate">
                      {zone.act === 2 ? '★2차 신규 구역' : zone.manager}
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                      leftCount > 0
                        ? 'bg-amber-900/60 text-amber-200'
                        : 'bg-stone-800 text-stone-500'
                    }`}
                  >
                    {leftCount}/{zone.cardCount}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 선택된 구역의 카드 뒷면 목록 */}
          <div className="p-4 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-3">
            <div className="flex items-center justify-between border-b border-stone-800 pb-2.5">
              <div>
                <h3 className="text-sm font-bold text-amber-200">
                  {currentZone.emoji} [{currentZone.id}구역] {currentZone.name}
                </h3>
                <p className="text-[11px] text-stone-400">
                  관리/특징: {currentZone.manager}
                </p>
              </div>
              <span className="text-[11px] text-amber-400 font-mono">
                총 {currentZone.cardCount}장
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {zoneCards.map((card, idx) => {
                const ownerId = room.cardOwners[card.id];
                const isMine = ownerId === character.id;
                const ownerChar = ownerId ? CHARACTER_MAP[ownerId] : null;

                return (
                  <div
                    key={card.id}
                    className={`p-3.5 rounded-xl border transition flex items-center justify-between gap-3 ${
                      !ownerId
                        ? 'bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 border-amber-700/50 hover:border-amber-500'
                        : isMine
                        ? 'bg-emerald-950/30 border-emerald-700/60'
                        : 'bg-stone-950/50 border-stone-800 opacity-65'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-12 rounded-lg bg-stone-950 border border-amber-800/60 flex flex-col items-center justify-center shrink-0 text-amber-400 font-mono text-xs font-bold">
                        <span>{currentZone.emoji}</span>
                        <span className="text-[10px]">#{idx + 1}</span>
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-amber-100 truncate">
                          카드 뒷면 : {card.zoneName}
                        </div>
                        <div className="text-[11px] text-stone-400 mt-0.5">
                          {!ownerId ? (
                            '미획득 (조사 가능)'
                          ) : isMine ? (
                            <span className="text-emerald-400 font-semibold">
                              ✓ 내 소지품에 보관 중 ({card.title})
                            </span>
                          ) : (
                            <span>
                              획득됨 ({ownerChar?.emoji}{' '}
                              {ownerChar?.name.split(' ')[0]} 보유)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {!ownerId ? (
                      <button
                        onClick={() => {
                          onAcquireCard(card.id);
                          setJustAcquiredCardId(card.id);
                        }}
                        className="px-3 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-extrabold text-xs shrink-0 transition shadow"
                      >
                        단서 획득
                      </button>
                    ) : isMine ? (
                      <button
                        onClick={onSwitchToInventory}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 font-bold text-[11px] shrink-0"
                      >
                        내용 보기
                      </button>
                    ) : (
                      <span className="text-[11px] font-semibold text-stone-500 px-2 py-1 rounded bg-stone-900 shrink-0">
                        조사 완료
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {justAcquiredCardId && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-600/60 flex items-center justify-between gap-2 text-xs text-emerald-100">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  카드를 내 소지품으로 가져왔습니다!
                </span>
                <button
                  onClick={onSwitchToInventory}
                  className="px-2.5 py-1 rounded bg-emerald-600 text-stone-950 font-bold text-[11px] shrink-0"
                >
                  내 소지품 열기 →
                </button>
              </div>
            )}
          </div>

          {/* 2차 조사 구역(빈 무덤 & 외곽 폐광) 비밀번호 해금 박스 */}
          {!room.gate1Unlocked && (
            <div className="p-4 rounded-2xl bg-amber-950/25 border border-amber-700/60 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                <Lock className="w-4 h-4" /> [🔒 관문 1 잠김] 5단계: 긴급 상황 발생 (새로운 국면) & 2차 조사 구역
              </div>
              <p className="text-[11px] text-stone-300 leading-relaxed">
                1차 조사와 전반전 대화(20분)가 모두 끝난 뒤, 진행자가 알려주는 <b>5단계 해금 암호</b>를 입력하면 신규 조사 구역 2곳(총 7장)이 새롭게 열립니다.
              </p>
              <form onSubmit={handleUnlockGate1} className="flex gap-2 pt-1">
                <div className="relative flex-1">
                  <KeyRound className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={gate1Password}
                    onChange={(e) => setGate1Password(e.target.value)}
                    placeholder="5단계 해금 암호 입력"
                    className="w-full pl-8 pr-3 py-2 rounded-lg bg-stone-950 border border-stone-700 text-amber-200 text-xs font-mono font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-extrabold text-xs shrink-0"
                >
                  2차 구역 해금
                </button>
              </form>
              {unlock1Error && (
                <p className="text-[11px] text-rose-400 font-medium">{unlock1Error}</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
