'use client';

import React, { useState } from 'react';
import { CLUE_CARDS } from '@/data/cards';
import { CHARACTERS } from '@/data/characters';
import { CharacterData, CharacterId, ClueCardData, RoomState } from '@/types/game';
import {
  Briefcase,
  Send,
  Maximize2,
  Undo2,
  Dices,
  Sparkles,
  PackageOpen
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

  const myCards = CLUE_CARDS.filter(
    (card) => room.cardOwners[card.id] === character.id
  );

  const otherCharacters = CHARACTERS.filter((c) => c.id !== character.id);

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

                {card.effectNote && (
                  hideBonusInfo ? (
                    <div className="p-2.5 rounded-lg bg-stone-950/70 border border-stone-800 text-[11px] text-stone-500 flex items-center gap-1.5">
                      <span>🔒 [아이템 특수 효과는 5단계 긴급 상황 발생 이후 공개됩니다]</span>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-700/50 text-[11px] text-amber-200 font-semibold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{card.effectNote}</span>
                    </div>
                  )
                )}

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

      {/* 전체화면으로 카드 보여주기 모달 (1:1 밀담용) */}
      {fullscreenCard && (() => {
        const isChaseItem =
          fullscreenCard.category === 'kill_item' || fullscreenCard.category === 'survival_item';
        const hideBonusInfo = isChaseItem && !room.gate1Unlocked;

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
            <div className="max-w-sm w-full p-6 rounded-3xl bg-stone-900 border-2 border-amber-500 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
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

              <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 text-sm text-stone-100 whitespace-pre-line leading-relaxed">
                {fullscreenCard.description}
              </div>

              {fullscreenCard.effectNote && (
                hideBonusInfo ? (
                  <div className="p-3 rounded-xl bg-stone-950/80 border border-stone-800 text-xs text-stone-500">
                    🔒 [아이템 특수 효과는 5단계 긴급 상황 발생 이후 공개됩니다]
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-amber-950/50 border border-amber-700/60 text-xs text-amber-200 font-semibold">
                    {fullscreenCard.effectNote}
                  </div>
                )
              )}

              <button
                onClick={() => setFullscreenCard(null)}
                className="w-full py-3 rounded-xl bg-stone-800 text-stone-200 font-bold text-xs"
              >
                닫기
              </button>
            </div>
          </div>
        );
      })()}

      {/* 다른 캐릭터에게 양도하기 모달 */}
      {transferModalCard && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-amber-600/70 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-amber-200">
                🎁 카드 양도하기 (소유권 이전)
              </h3>
              <p className="text-xs text-stone-300 font-semibold">
                대상 카드: {transferModalCard.title}
              </p>
              <p className="text-[11px] text-stone-400">
                선택한 캐릭터의 스마트폰 소지품으로 이 카드가 즉시 이동하며, 내 소지품에서는 사라집니다.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {otherCharacters.map((target) => (
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
                    양도 →
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
      )}
    </div>
  );
}
