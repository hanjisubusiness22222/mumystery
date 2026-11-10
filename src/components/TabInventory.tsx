'use client';

import React, { useState } from 'react';
import { CLUE_CARDS } from '@/data/cards';
import { CHARACTERS, CHARACTER_MAP } from '@/data/characters';
import { CharacterData, CharacterId, ClueCardData, RoomState } from '@/types/game';
import {
  Briefcase,
  Send,
  Maximize2,
  Undo2,
  Dices,
  Sparkles,
  PackageOpen,
  Eye,
  Filter,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface TabInventoryProps {
  character: CharacterData;
  room: RoomState;
  myDiceBonus: number;
  onTransferCard: (cardId: string, toCharacterId: CharacterId) => void;
  onReturnCard: (cardId: string) => void;
  onSwitchToClueMap: () => void;
}

export default function TabInventory({
  character,
  room,
  myDiceBonus,
  onTransferCard,
  onReturnCard,
  onSwitchToClueMap
}: TabInventoryProps) {
  const [fullscreenCard, setFullscreenCard] = useState<ClueCardData | null>(
    null
  );
  const [transferModalCard, setTransferModalCard] =
    useState<ClueCardData | null>(null);
  const [gmFilter, setGmFilter] = useState<'all' | 'items_only'>('all');
  const [showUnownedInGm, setShowUnownedInGm] = useState<boolean>(false);

  const isGM = character.id === 'gm';

  const myCards = CLUE_CARDS.filter(
    (card) => room.cardOwners[card.id] === character.id
  );

  const getBadgeStyle = (category: ClueCardData['category']) => {
    switch (category) {
      case 'kill_item':
        return 'bg-rose-950/90 text-rose-200 border-rose-600/70';
      case 'survival_item':
        return 'bg-teal-950/90 text-teal-200 border-teal-600/70';
      case 'quest_item':
        return 'bg-amber-950/90 text-amber-200 border-amber-500';
      default:
        return 'bg-stone-800 text-stone-300 border-stone-700';
    }
  };

  const calculateCharBonus = (charId: CharacterId) => {
    const charData = CHARACTER_MAP[charId];
    if (!charData) return 0;
    let bonus = charId === 'clive' ? 1 : 0;
    for (const card of CLUE_CARDS) {
      if (room.cardOwners[card.id] === charId) {
        if (charData.faction === 'kill_subdue' && card.category === 'kill_item') {
          bonus += card.diceBonus ?? 1;
        } else if (
          charData.faction === 'survival' &&
          card.category === 'survival_item'
        ) {
          bonus += card.diceBonus ?? 1;
        }
      }
    }
    return bonus;
  };

  // 공용 모달: 전체화면 카드 상세 보기 & 양도 모달
  const renderModals = () => (
    <>
      {fullscreenCard && (() => {
        const isChaseItem =
          fullscreenCard.category === 'kill_item' ||
          fullscreenCard.category === 'survival_item';
        const hideBonusInfo = !isGM && isChaseItem && !room.gate1Unlocked;

        const badgeText = hideBonusInfo
          ? fullscreenCard.category === 'kill_item'
            ? '💥 굉장히 위험해 보이는 물품이다'
            : '🛡️ 생존에 유용해 보이는 물품이다.'
          : fullscreenCard.badgeText;

        return (
          <div
            className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-5"
            onClick={() => setFullscreenCard(null)}
          >
            <div
              className="max-w-sm w-full p-6 rounded-3xl bg-stone-900 border-2 border-amber-500 shadow-2xl space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getBadgeStyle(
                    fullscreenCard.category
                  )}`}
                >
                  {badgeText}
                </span>
                <span className="text-xs text-stone-400">
                  {fullscreenCard.zoneName}
                </span>
              </div>

              <h3 className="text-lg font-extrabold text-amber-100">
                {fullscreenCard.title}
              </h3>

              <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 text-sm text-stone-100 whitespace-pre-line leading-relaxed max-h-[45vh] overflow-y-auto">
                {fullscreenCard.description}
              </div>

              {fullscreenCard.effectNote &&
                (hideBonusInfo ? (
                  <div className="p-3 rounded-xl bg-stone-950/80 border border-stone-800 text-xs text-stone-500">
                    🔒 [아이템 특수 효과는 긴급 상황 발생 이후 공개됩니다]
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-amber-950/50 border border-amber-700/60 text-xs text-amber-200 font-semibold">
                    {fullscreenCard.effectNote}
                  </div>
                ))}

              <button
                onClick={() => setFullscreenCard(null)}
                className="w-full py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs"
              >
                닫기
              </button>
            </div>
          </div>
        );
      })()}

      {transferModalCard && (() => {
        const currentOwnerId = room.cardOwners[transferModalCard.id];
        const targetCharacters = CHARACTERS.filter(
          (c) => c.id !== currentOwnerId
        );

        return (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-stone-900 border border-amber-600/70 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-amber-200">
                  {isGM ? '🎩 [마스터 권한] 카드 소유권 이전' : '🎁 카드 양도하기 (소유권 이전)'}
                </h3>
                <p className="text-xs text-stone-300 font-semibold">
                  대상 카드: {transferModalCard.title}
                </p>
                <p className="text-[11px] text-stone-400">
                  선택한 캐릭터의 스마트폰 소지품으로 이 카드가 즉시 이동됩니다.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2 max-h-[52vh] overflow-y-auto pr-1">
                {targetCharacters.map((target) => (
                  <button
                    key={target.id}
                    onClick={() => {
                      onTransferCard(transferModalCard.id, target.id);
                      setTransferModalCard(null);
                    }}
                    className="w-full p-3 rounded-xl bg-stone-950 hover:bg-amber-950/50 border border-stone-800 hover:border-amber-500 text-left flex items-center justify-between transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{target.emoji}</span>
                      <div>
                        <div className="text-xs font-bold text-amber-100">
                          [{target.initial}] {target.name}
                        </div>
                        <div className="text-[10px] text-stone-400">
                          {target.roleTitle}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-amber-400">
                      {currentOwnerId ? '이동 →' : '지급 →'}
                    </span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setTransferModalCard(null)}
                className="w-full py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold"
              >
                취소
              </button>
            </div>
          </div>
        );
      })()}
    </>
  );

  // =========================================================================
  // 🎩 진행자(GM) 전용: 전체 플레이어 소지품 관제 대시보드
  // =========================================================================
  if (isGM) {
    const ownedCount = CLUE_CARDS.filter((c) => Boolean(room.cardOwners[c.id])).length;
    const unownedCards = CLUE_CARDS.filter((c) => !room.cardOwners[c.id]);

    const isItemCategory = (category: ClueCardData['category']) =>
      category === 'kill_item' ||
      category === 'survival_item' ||
      category === 'quest_item';

    return (
      <div className="space-y-4 pb-8">
        {/* 마스터 대시보드 상단 헤더 */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/60 via-stone-900 to-stone-950 border border-amber-600/60 shadow-xl space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-extrabold text-amber-200 flex items-center gap-1.5">
                🎩 마스터 전용: 전체 소지품 관제판
              </h2>
              <p className="text-[11px] text-stone-300 mt-0.5">
                모든 플레이어가 보유한 단서·아이템과 추격전 보너스를 실시간으로 확인합니다.
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-stone-950 border border-amber-600/50 text-amber-300 shrink-0">
              {ownedCount} / {CLUE_CARDS.length}장
            </span>
          </div>

          {/* 필터 버튼 */}
          <div className="flex items-center gap-2 pt-1">
            <Filter className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <button
              onClick={() => setGmFilter('all')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold border transition ${
                gmFilter === 'all'
                  ? 'bg-amber-600 text-stone-950 border-amber-400'
                  : 'bg-stone-950 text-stone-400 border-stone-800 hover:text-stone-200'
              }`}
            >
              전체 카드 보기
            </button>
            <button
              onClick={() => setGmFilter('items_only')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold border transition ${
                gmFilter === 'items_only'
                  ? 'bg-amber-600 text-stone-950 border-amber-400'
                  : 'bg-stone-950 text-stone-400 border-stone-800 hover:text-stone-200'
              }`}
            >
              핵심 아이템·증거품만
            </button>
          </div>
        </div>

        {/* 7명 캐릭터별 소지품 현황 리스트 */}
        <div className="space-y-3">
          {CHARACTERS.map((c) => {
            const allOwned = CLUE_CARDS.filter(
              (card) => room.cardOwners[card.id] === c.id
            );
            const displayedCards =
              gmFilter === 'items_only'
                ? allOwned.filter((card) => isItemCategory(card.category))
                : allOwned;
            const bonus = calculateCharBonus(c.id);

            return (
              <div
                key={c.id}
                className="p-3.5 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-2.5 shadow"
              >
                {/* 캐릭터 헤더 */}
                <div className="flex items-center justify-between gap-2 border-b border-stone-800/80 pb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xl shrink-0">{c.emoji}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-extrabold text-amber-100 truncate">
                          [{c.initial}] {c.name}
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-semibold shrink-0 ${
                            c.faction === 'kill_subdue'
                              ? 'bg-rose-950 text-rose-300 border border-rose-800/60'
                              : c.faction === 'survival'
                              ? 'bg-teal-950 text-teal-300 border border-teal-800/60'
                              : 'bg-stone-800 text-stone-300 border border-stone-700'
                          }`}
                        >
                          {c.faction === 'kill_subdue'
                            ? '💥 사살·제압파'
                            : c.faction === 'survival'
                            ? '🛡️ 생존파'
                            : '⚖️ 중립'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-stone-950 border border-stone-700 text-stone-300">
                      {allOwned.length}장
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950/80 border border-amber-700/60 text-amber-300">
                      🎲 +{bonus}
                    </span>
                  </div>
                </div>

                {/* 캐릭터가 보유한 카드들 */}
                {displayedCards.length === 0 ? (
                  <p className="text-[11px] text-stone-500 py-1 text-center">
                    {allOwned.length === 0
                      ? '보유 중인 카드가 없습니다.'
                      : '해당 필터 조건에 맞는 아이템이 없습니다.'}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {displayedCards.map((card) => (
                      <div
                        key={card.id}
                        className="p-2.5 rounded-xl bg-stone-950 border border-stone-800/90 flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getBadgeStyle(
                                card.category
                              )}`}
                            >
                              {card.badgeText}
                            </span>
                            <span className="text-[10px] text-stone-500">
                              {card.zoneName}
                            </span>
                          </div>
                          <div className="text-xs font-bold text-amber-100 truncate">
                            {card.title}
                          </div>
                          {card.effectNote && (
                            <div className="text-[10px] text-amber-300/90 leading-snug">
                              ✨ {card.effectNote}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => setFullscreenCard(card)}
                            className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 transition"
                            title="카드 상세 보기"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setTransferModalCard(card)}
                            className="p-1.5 rounded-lg bg-amber-700/80 hover:bg-amber-600 text-stone-950 transition"
                            title="다른 캐릭터로 소유권 이동"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (
                                window.confirm(
                                  `[${card.title}] 카드를 [${c.name}] 소지품에서 회수하여 구역 바닥으로 돌려놓으시겠습니까?`
                                )
                              ) {
                                onReturnCard(card.id);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-stone-900 hover:bg-rose-950 text-stone-400 hover:text-rose-300 border border-stone-800 transition"
                            title="구역으로 회수하기"
                          >
                            <Undo2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 미획득 카드 확인 아코디언 */}
        <div className="p-3.5 rounded-2xl bg-stone-900/70 border border-stone-800 space-y-2">
          <button
            onClick={() => setShowUnownedInGm(!showUnownedInGm)}
            className="w-full flex items-center justify-between text-xs font-bold text-stone-300"
          >
            <span>
              📦 아직 구역에 남아있는 미획득 카드 ({unownedCards.length}장)
            </span>
            {showUnownedInGm ? (
              <ChevronUp className="w-4 h-4 text-stone-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-stone-400" />
            )}
          </button>

          {showUnownedInGm && (
            <div className="pt-2 border-t border-stone-800 space-y-2">
              {unownedCards.length === 0 ? (
                <p className="text-xs text-emerald-400 text-center py-2">
                  모든 24장의 카드가 플레이어들에게 분배되었습니다.
                </p>
              ) : (
                unownedCards.map((card) => (
                  <div
                    key={card.id}
                    className="p-2.5 rounded-xl bg-stone-950/70 border border-stone-800 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getBadgeStyle(
                            card.category
                          )}`}
                        >
                          {card.badgeText}
                        </span>
                        <span className="text-[10px] text-stone-500">
                          {card.zoneName}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-stone-200 truncate">
                        {card.title}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => setFullscreenCard(card)}
                        className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition"
                        title="내용 보기"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setTransferModalCard(card)}
                        className="px-2 py-1 rounded-lg bg-amber-700/70 hover:bg-amber-600 text-stone-950 text-[10px] font-bold transition"
                        title="특정 캐릭터에게 직접 지급"
                      >
                        지급
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {renderModals()}
      </div>
    );
  }

  // =========================================================================
  // 일반 플레이어 소지품 화면
  // =========================================================================
  return (
    <div className="space-y-4 pb-8">
      {/* 상단 내 결판 보너스 요약 박스 (중반 반전 해금 후에만 표시) */}
      {room.gate1Unlocked && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/50 via-stone-900 to-stone-900 border border-amber-700/60 flex items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
              <Dices className="w-4 h-4" /> 내 후반전 [최종 결판] 주사위 보너스
            </div>
            <p className="text-[11px] text-stone-300 leading-relaxed">
              {character.faction === 'kill_subdue'
                ? '결판 판정 아이템(콜트 리볼버·특수 탄약·올가미 밧줄·폐광 지도) 소지 시 개당 +1'
                : '결판 판정 아이템(응급 외과 봉합 키트·강철 방탄 조끼) 소지 시 개당 +1'}
              {character.id === 'clive' && ' (클라이브 기본 패시브 +1 포함)'}
            </p>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-stone-950 border border-amber-500/70 text-center shrink-0">
            <div className="text-[10px] text-stone-400">최종 보너스</div>
            <div className="text-lg font-extrabold text-amber-300">
              +{myDiceBonus}
            </div>
          </div>
        </div>
      )}

      {/* 보유 카드 목록 */}
      {myCards.length === 0 ? (
        <div className="p-8 rounded-2xl bg-stone-900/70 border border-stone-800 text-center space-y-3">
          <PackageOpen className="w-10 h-10 text-stone-600 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-stone-300">
              아직 보유한 단서나 아이템이 없습니다
            </h3>
            <p className="text-xs text-stone-500">
              [🔍 단서 구역] 탭에서 내 조사 차례에 카드를 획득하거나, 다른 플레이어에게 양도받으세요.
            </p>
          </div>
          <button
            onClick={onSwitchToClueMap}
            className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-600 text-stone-950 font-bold text-xs transition"
          >
            🔍 단서 구역으로 이동
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-amber-200 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-amber-400" /> 내 소지품 목록 ({myCards.length}장)
            </span>
            <span className="text-[11px] text-stone-400">
              밀담 거래 시 [양도하기] 사용
            </span>
          </div>

          {myCards.map((card) => {
            const isChaseItem =
              card.category === 'kill_item' || card.category === 'survival_item';
            const hideBonusInfo = isChaseItem && !room.gate1Unlocked;

            const badgeText = hideBonusInfo
              ? card.category === 'kill_item'
                ? '💥 굉장히 위험해 보이는 물품이다'
                : '🛡️ 생존에 유용해 보이는 물품이다.'
              : card.badgeText;

            return (
              <div
                key={card.id}
                className="p-4 rounded-2xl bg-stone-900 border border-stone-700/80 space-y-3 shadow-md"
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getBadgeStyle(
                      card.category
                    )}`}
                  >
                    {badgeText}
                  </span>
                  <span className="text-[11px] text-stone-400 font-mono">
                    출처: {card.zoneName}
                  </span>
                </div>

                <h3 className="text-sm font-extrabold text-amber-100">
                  {card.title}
                </h3>

                <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-200 whitespace-pre-line leading-relaxed">
                  {card.description}
                </div>

                {card.effectNote &&
                  (hideBonusInfo ? (
                    <div className="p-2.5 rounded-lg bg-stone-950/70 border border-stone-800 text-[11px] text-stone-500 flex items-center gap-1.5">
                      <span>🔒 [아이템 특수 효과는 긴급 상황 발생 이후 공개됩니다]</span>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-700/50 text-[11px] text-amber-200 font-semibold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{card.effectNote}</span>
                    </div>
                  ))}

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => setFullscreenCard(card)}
                    className="flex-1 py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <Maximize2 className="w-3.5 h-3.5" /> 상대에게 보여주기
                  </button>
                  <button
                    onClick={() => setTransferModalCard(card)}
                    className="flex-1 py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-extrabold text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <Send className="w-3.5 h-3.5" /> 다른 캐릭터에게 양도
                  </button>
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          `[${card.title}] 카드를 다시 조사 구역 바닥에 내려놓으시겠습니까? (실수로 획득했을 때만 사용)`
                        )
                      ) {
                        onReturnCard(card.id);
                      }
                    }}
                    className="p-2 rounded-xl bg-stone-950 hover:bg-rose-950 text-stone-400 hover:text-rose-300 border border-stone-800 transition"
                    title="실수로 뽑은 카드 바닥에 돌려놓기"
                  >
                    <Undo2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {renderModals()}
    </div>
  );
}
