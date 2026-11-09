'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { CHARACTER_MAP } from '@/data/characters';
import { CLUE_CARDS } from '@/data/cards';
import { GATE_PASSWORDS } from '@/data/timetable';
import { CharacterId, RoomState } from '@/types/game';
import { supabase } from '@/lib/supabase';
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

type ActiveTab = 'story' | 'booklet' | 'cluemap' | 'inventory';

export default function HomePage() {
  const [roomCode, setRoomCode] = useState<string>('1889');
  const [selectedCharId, setSelectedCharId] = useState<CharacterId | null>(
    null
  );
  const [isCharacterLocked, setIsCharacterLocked] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('story');
  const [room, setRoom] = useState<RoomState>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('nf_room_state_1889');
        if (cached) return JSON.parse(cached);
      } catch {}
    }
    return createInitialLocalRoom('1889');
  });

  // 저장된 캐릭터 & 방 코드 & 로컬 방 상태 복원
  useEffect(() => {
    try {
      const savedCode = localStorage.getItem('nf_room_code');
      const savedChar = localStorage.getItem('nf_char_id') as CharacterId | null;
      if (savedCode) {
        setRoomCode(savedCode);
        const cached = localStorage.getItem(`nf_room_state_${savedCode}`);
        if (cached) {
          const parsed = JSON.parse(cached);
          setRoom((prev) => ({ ...prev, ...parsed }));
        }
      }
      if (savedChar && CHARACTER_MAP[savedChar]) {
        setSelectedCharId(savedChar);
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  // 서버에서 방 상태 폴링 (로컬 해금 상태 보호 병합)
  const fetchRoomState = useCallback(async (code: string) => {
    try {
      const res = await fetch(`/api/room?code=${encodeURIComponent(code)}`, {
        cache: 'no-store'
      });
      if (res.ok) {
        const data: RoomState = await res.json();
        setRoom((prev) => {
          // 로컬에서 이미 열린 관문이나 획득한 카드가 서버의 빈 초기값 때문에 리셋되지 않도록 병합
          const merged: RoomState = {
            ...data,
            gate0Unlocked: prev.gate0Unlocked || data.gate0Unlocked,
            gate1Unlocked: prev.gate1Unlocked || data.gate1Unlocked,
            gate2Unlocked: prev.gate2Unlocked || data.gate2Unlocked,
            gate3Unlocked: prev.gate3Unlocked || data.gate3Unlocked,
            cardOwners: {
              ...data.cardOwners,
              ...Object.fromEntries(
                Object.entries(prev.cardOwners).filter(([_, owner]) => owner !== null)
              )
            },
            bribedResident: data.bribedResident || prev.bribedResident,
            cliveSecretPick: data.cliveSecretPick || prev.cliveSecretPick,
            graceSecretPick: data.graceSecretPick || prev.graceSecretPick,
            jailedCharacter: data.jailedCharacter || prev.jailedCharacter,
            cliveEscapeRoll: data.cliveEscapeRoll || prev.cliveEscapeRoll,
            chaseDiceRolls: {
              ...prev.chaseDiceRolls,
              ...data.chaseDiceRolls
            }
          };
          try {
            localStorage.setItem(`nf_room_state_${code}`, JSON.stringify(merged));
          } catch {}
          return merged;
        });
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

  // 탭 변경 또는 캐릭터 진입 시 화면 스크롤을 맨 위로 이동
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  }, [activeTab, selectedCharId]);

  // Supabase 실시간 동기화 전송 헬퍼
  const syncToSupabase = useCallback(async (stateToSync: RoomState) => {
    try {
      await supabase.from('rooms').upsert({
        room_code: stateToSync.roomCode,
        state: stateToSync,
        updated_at: new Date().toISOString()
      });
    } catch {
      // Supabase 테이블이 아직 없거나 네트워크 단절 시 조용히 무시 (로컬 & API 폴백 자동 작동)
    }
  }, []);

  // Supabase Realtime 구독 (카카오톡처럼 0.05초 전원 동기화)
  useEffect(() => {
    if (!roomCode) return;

    // 1. 방 진입 시 Supabase 최신 상태 로드
    const loadSupabase = async () => {
      try {
        const { data } = await supabase
          .from('rooms')
          .select('state')
          .eq('room_code', roomCode)
          .maybeSingle();

        if (data && data.state) {
          const s = data.state as RoomState;
          setRoom((prev) => {
            const merged: RoomState = {
              ...s,
              gate0Unlocked: prev.gate0Unlocked || s.gate0Unlocked,
              gate1Unlocked: prev.gate1Unlocked || s.gate1Unlocked,
              gate2Unlocked: prev.gate2Unlocked || s.gate2Unlocked,
              gate3Unlocked: prev.gate3Unlocked || s.gate3Unlocked,
              cardOwners: { ...prev.cardOwners, ...s.cardOwners },
              chaseDiceRolls: { ...prev.chaseDiceRolls, ...s.chaseDiceRolls }
            };
            try {
              localStorage.setItem(`nf_room_state_${roomCode}`, JSON.stringify(merged));
            } catch {}
            return merged;
          });
        }
      } catch {
        // ignore
      }
    };
    loadSupabase();

    // 2. 실시간 웹소켓 채널 구독
    const channel = supabase
      .channel(`room_${roomCode}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rooms',
          filter: `room_code=eq.${roomCode}`
        },
        (payload) => {
          if (payload.new && (payload.new as { state?: RoomState }).state) {
            const remote = (payload.new as { state: RoomState }).state;
            setRoom((prev) => {
              const merged: RoomState = {
                ...remote,
                gate0Unlocked: prev.gate0Unlocked || remote.gate0Unlocked,
                gate1Unlocked: prev.gate1Unlocked || remote.gate1Unlocked,
                gate2Unlocked: prev.gate2Unlocked || remote.gate2Unlocked,
                gate3Unlocked: prev.gate3Unlocked || remote.gate3Unlocked,
                cardOwners: { ...prev.cardOwners, ...remote.cardOwners },
                chaseDiceRolls: { ...prev.chaseDiceRolls, ...remote.chaseDiceRolls }
              };
              try {
                localStorage.setItem(`nf_room_state_${roomCode}`, JSON.stringify(merged));
              } catch {}
              return merged;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomCode]);

  // 공통 액션 호출 헬퍼 (낙관적 즉시 업데이트 + 영구 보존)
  const dispatchRoomAction = async (
    action: string,
    payload: Record<string, unknown> = {}
  ): Promise<{ ok: boolean; error?: string }> => {
    // 1. 관문 해금인 경우 로컬 및 Supabase에 즉시 반영
    if (action === 'unlock_gate') {
      const gate = Number(payload.gate);
      setRoom((prev) => {
        const next: RoomState = {
          ...prev,
          gate0Unlocked: gate === 0 || gate === 1 ? true : prev.gate0Unlocked,
          gate1Unlocked: gate === 1 ? true : prev.gate1Unlocked,
          gate2Unlocked: gate === 2 ? true : prev.gate2Unlocked,
          gate3Unlocked: gate === 3 ? true : prev.gate3Unlocked
        };
        try {
          localStorage.setItem(`nf_room_state_${roomCode}`, JSON.stringify(next));
        } catch {}
        syncToSupabase(next);
        return next;
      });
      return { ok: true };
    }

    // 2. 방 초기화인 경우 로컬스토리지 삭제 및 초기 상태로 즉시 리셋
    if (action === 'reset_room') {
      const initial = createInitialLocalRoom(roomCode);
      setRoom(initial);
      try {
        localStorage.removeItem(`nf_room_state_${roomCode}`);
        localStorage.removeItem('nf_char_id');
      } catch {}
      setSelectedCharId(null);
      syncToSupabase(initial);
    }

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
      if (res.ok) {
        if (action === 'reset_room') {
          return { ok: true };
        }
        const data: RoomState = await res.json();
        setRoom((prev) => {
          const merged: RoomState = {
            ...data,
            gate0Unlocked: prev.gate0Unlocked || data.gate0Unlocked,
            gate1Unlocked: prev.gate1Unlocked || data.gate1Unlocked,
            gate2Unlocked: prev.gate2Unlocked || data.gate2Unlocked,
            gate3Unlocked: prev.gate3Unlocked || data.gate3Unlocked,
            cardOwners: {
              ...data.cardOwners,
              ...Object.fromEntries(
                Object.entries(prev.cardOwners).filter(([_, owner]) => owner !== null)
              )
            }
          };
          try {
            localStorage.setItem(`nf_room_state_${roomCode}`, JSON.stringify(merged));
          } catch {}
          syncToSupabase(merged);
          return merged;
        });
        return { ok: true };
      } else {
        const data = await res.json().catch(() => ({}));
        if (action === 'unlock_gate') {
          return { ok: true };
        }
        return { ok: false, error: data.error || '요청 실패' };
      }
    } catch {
      if (action === 'unlock_gate') {
        return { ok: true };
      }
      return { ok: false, error: '네트워크 연결 상태를 확인해주세요.' };
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
    setActiveTab('story');
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
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
    gate: 0 | 1 | 2 | 3
  ): Promise<boolean> => {
    const result = await dispatchRoomAction('unlock_gate', { gate });
    return result.ok;
  };

  if (!selectedCharId) {
    return (
      <LobbyView
        roomCode={roomCode}
        onChangeRoomCode={handleChangeRoomCode}
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
        onUnlockGate={handleUnlockGate}
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
            onUnlockGate={handleUnlockGate}
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
            onResetRoom={() => dispatchRoomAction('reset_room')}
          />
        )}
      </main>

      {/* 하단 4대 핵심 탭 네비게이션: 오프닝·결말 ➔ 내 설정집 ➔ 단서 구역 ➔ 내 소지품 */}
      <nav className="fixed bottom-0 inset-x-0 z-30 bg-stone-950/95 backdrop-blur border-t border-amber-900/50 px-2 py-1.5">
        <div className="max-w-md mx-auto grid grid-cols-4 gap-1">
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
        </div>
      </nav>
    </div>
  );
}
