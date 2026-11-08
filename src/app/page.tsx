'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { CHARACTER_MAP } from '@/data/characters';
import { CLUE_CARDS } from '@/data/cards';
import { GATE_PASSWORDS } from '@/data/timetable';
import { CharacterId, RoomState } from '@/types/game';
import LobbyView from '@/components/LobbyView';
import HeaderBar from '@/components/HeaderBar';
import TabBooklet from '@/components/TabBooklet';
import TabClueMap from '@/components/TabClueMap';
import TabInventory from '@/components/TabInventory';
import TabStoryEnding from '@/components/TabStoryEnding';
import { BookOpen, Search, Briefcase, Film } from 'lucide-react';

function createInitialLocalRoom(roomCode: string): RoomState {
  const cardOwners: Record<string, CharacterId | null> = {};
  for (const c of CLUE_CARDS) {
    cardOwners[c.id] = null;
  }
  return {
    roomCode,
    playerCount: 7,
    gate0Unlocked: false,
    gate1Unlocked: false,
    gate2Unlocked: false,
    gate3Unlocked: false,
    cardOwners,
    bribedResident: null,
    cliveSecretPick: null,
    graceSecretPick: null,
    jailedCharacter: null,
    cliveEscapeRoll: null,
    chaseDiceRolls: {},
    updatedAt: Date.now()
  };
}

type ActiveTab = 'booklet' | 'cluemap' | 'inventory' | 'story';

export default function HomePage() {
  const [roomCode, setRoomCode] = useState<string>('1889');
  const [selectedCharId, setSelectedCharId] = useState<CharacterId | null>(
    null
  );
  const [isCharacterLocked, setIsCharacterLocked] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('booklet');
  const [room, setRoom] = useState<RoomState>(() =>
    createInitialLocalRoom('1889')
  );

  // 저장된 캐릭터 & 방 코드 복원
  useEffect(() => {
    try {
      const savedCode = localStorage.getItem('nf_room_code');
      const savedChar = localStorage.getItem('nf_char_id') as CharacterId | null;
      if (savedCode) setRoomCode(savedCode);
      if (savedChar && CHARACTER_MAP[savedChar]) {
        setSelectedCharId(savedChar);
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  // 서버에서 방 상태 폴링 (1.5초 주기)
  const fetchRoomState = useCallback(async (code: string) => {
    try {
      const res = await fetch(`/api/room?code=${encodeURIComponent(code)}`, {
        cache: 'no-store'
      });
      if (res.ok) {
        const data: RoomState = await res.json();
        setRoom(data);
      }
    } catch {
      // 오프라인/로컬 폴백 유지
    }
  }, []);

  useEffect(() => {
    fetchRoomState(roomCode);
    const timer = setInterval(() => {
      fetchRoomState(roomCode);
    }, 1500);
    return () => clearInterval(timer);
  }, [roomCode, fetchRoomState]);

  // 공통 액션 호출 헬퍼
  const dispatchRoomAction = async (
    action: string,
    payload: Record<string, unknown> = {}
  ): Promise<{ ok: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomCode,
          action,
          ...payload
        })
      });
      const data = await res.json();
      if (!res.ok) {
        return { ok: false, error: data.error || '요청 실패' };
      }
      setRoom(data);
      return { ok: true };
    } catch {
      // 서버 연결 불가 시 로컬 상태 즉시 반영 폴백
      return { ok: false, error: '네트워크 오류' };
    }
  };

  // 캐릭터별 추격전 주사위 보너스 자동 계산 (개당 +1, 클라이브 기본 +1)
  const calculateCharacterBonus = useCallback(
    (charId: CharacterId): number => {
      const charData = CHARACTER_MAP[charId];
      if (!charData) return 0;

      let bonus = charId === 'clive' ? 1 : 0;
      for (const card of CLUE_CARDS) {
        if (room.cardOwners[card.id] === charId) {
          if (
            charData.faction === 'kill_subdue' &&
            card.category === 'kill_item'
          ) {
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
    },
    [room.cardOwners]
  );

  const handleSelectCharacter = (charId: CharacterId) => {
    setSelectedCharId(charId);
    setIsCharacterLocked(true);
    setActiveTab('booklet');
    try {
      localStorage.setItem('nf_char_id', charId);
    } catch {
      // ignore
    }
  };

  const handleLeaveCharacter = () => {
    setSelectedCharId(null);
    try {
      localStorage.removeItem('nf_char_id');
    } catch {
      // ignore
    }
  };

  const handleChangeRoomCode = (newCode: string) => {
    const clean = newCode.trim().toUpperCase() || '1889';
    setRoomCode(clean);
    try {
      localStorage.setItem('nf_room_code', clean);
    } catch {
      // ignore
    }
    fetchRoomState(clean);
  };

  const handleUnlockGate = async (
    gate: 0 | 1 | 2 | 3,
    password: string
  ): Promise<boolean> => {
    const trimmed = password.trim();
    const result = await dispatchRoomAction('unlock_gate', {
      gate,
      password: trimmed
    });
    if (result.ok) return true;

    // 로컬 폴백 검증
    if (
      (gate === 0 && trimmed === GATE_PASSWORDS.GATE_0_ACT1_INVESTIGATION) ||
      (gate === 1 && trimmed === GATE_PASSWORDS.GATE_1_MID_EVENT) ||
      (gate === 2 && trimmed === GATE_PASSWORDS.GATE_2_CLIMAX) ||
      (gate === 3 && trimmed === GATE_PASSWORDS.GATE_3_ENDING)
    ) {
      setRoom((prev) => ({
        ...prev,
        gate0Unlocked: gate === 0 || gate === 1 ? true : prev.gate0Unlocked,
        gate1Unlocked: gate === 1 ? true : prev.gate1Unlocked,
        gate2Unlocked: gate === 2 ? true : prev.gate2Unlocked,
        gate3Unlocked: gate === 3 ? true : prev.gate3Unlocked
      }));
      return true;
    }
    return false;
  };

  if (!selectedCharId) {
    return (
      <LobbyView
        roomCode={roomCode}
        playerCount={room.playerCount}
        onChangeRoomCode={handleChangeRoomCode}
        onChangePlayerCount={(count) =>
          dispatchRoomAction('set_player_count', { playerCount: count })
        }
        onSelectCharacter={handleSelectCharacter}
      />
    );
  }

  const currentCharacter = CHARACTER_MAP[selectedCharId];
  const myDiceBonus = calculateCharacterBonus(selectedCharId);
  const myInventoryCount = Object.values(room.cardOwners).filter(
    (owner) => owner === selectedCharId
  ).length;

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col">
      {/* 상단 고정 헤더 바 */}
      <HeaderBar
        character={currentCharacter}
        room={room}
        myDiceBonus={myDiceBonus}
        isCharacterLocked={isCharacterLocked}
        onToggleCharacterLock={() => setIsCharacterLocked((prev) => !prev)}
        onLeaveCharacter={handleLeaveCharacter}
        onResetRoom={() => dispatchRoomAction('reset_room')}
      />

      {/* 중앙 탭 콘텐츠 영역 */}
      <main className="flex-1 max-w-md w-full mx-auto px-3.5 pt-4 pb-24">
        {activeTab === 'booklet' && (
          <TabBooklet
            character={currentCharacter}
            room={room}
            onSetBribe={(residentId) =>
              dispatchRoomAction('set_bribe', { residentId })
            }
          />
        )}

        {activeTab === 'cluemap' && (
          <TabClueMap
            character={currentCharacter}
            room={room}
            onAcquireCard={(cardId) =>
              dispatchRoomAction('acquire_card', {
                cardId,
                characterId: currentCharacter.id
              })
            }
            onUnlockGate={handleUnlockGate}
            onSwitchToInventory={() => setActiveTab('inventory')}
          />
        )}

        {activeTab === 'inventory' && (
          <TabInventory
            character={currentCharacter}
            room={room}
            myDiceBonus={myDiceBonus}
            onTransferCard={(cardId, toCharacterId) =>
              dispatchRoomAction('transfer_card', { cardId, toCharacterId })
            }
            onReturnCard={(cardId) =>
              dispatchRoomAction('return_card', { cardId })
            }
            onSwitchToClueMap={() => setActiveTab('cluemap')}
          />
        )}

        {activeTab === 'story' && (
          <TabStoryEnding
            character={currentCharacter}
            room={room}
            calculateCharacterBonus={calculateCharacterBonus}
            onUnlockGate={handleUnlockGate}
            onSubmitSecretPick={(actor, targetId) =>
              dispatchRoomAction('submit_secret_pick', { actor, targetId })
            }
            onSetJailed={(characterId) =>
              dispatchRoomAction('set_jailed', { characterId })
            }
            onRollCliveEscape={(value) =>
              dispatchRoomAction('roll_clive_escape', { value })
            }
            onSetChaseDice={(characterId, value) =>
              dispatchRoomAction('set_chase_dice', { characterId, value })
            }
          />
        )}
      </main>

      {/* 하단 4대 핵심 탭 네비게이션 */}
      <nav className="fixed bottom-0 inset-x-0 z-30 bg-stone-950/95 backdrop-blur border-t border-amber-900/50 px-2 py-1.5">
        <div className="max-w-md mx-auto grid grid-cols-4 gap-1">
          <button
            onClick={() => setActiveTab('booklet')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition ${
              activeTab === 'booklet'
                ? 'bg-amber-950/80 text-amber-300 font-bold border border-amber-700/60'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <BookOpen className="w-4 h-4 mb-0.5" />
            <span className="text-[11px]">내 설정집</span>
          </button>

          <button
            onClick={() => setActiveTab('cluemap')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition relative ${
              activeTab === 'cluemap'
                ? 'bg-amber-950/80 text-amber-300 font-bold border border-amber-700/60'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Search className="w-4 h-4 mb-0.5" />
            <span className="text-[11px]">단서 구역</span>
            {room.gate1Unlocked && (
              <span className="absolute top-1 right-3 w-2 h-2 rounded-full bg-amber-400" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition relative ${
              activeTab === 'inventory'
                ? 'bg-amber-950/80 text-amber-300 font-bold border border-amber-700/60'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Briefcase className="w-4 h-4 mb-0.5" />
            <span className="text-[11px]">
              내 소지품 {myInventoryCount > 0 ? `(${myInventoryCount})` : ''}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('story')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition relative ${
              activeTab === 'story'
                ? 'bg-amber-950/80 text-amber-300 font-bold border border-amber-700/60'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Film className="w-4 h-4 mb-0.5" />
            <span className="text-[11px]">오프닝·결말</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
