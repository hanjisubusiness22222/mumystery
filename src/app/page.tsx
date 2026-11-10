'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { CHARACTER_MAP } from '@/data/characters';
import { CLUE_CARDS, calculateChaseDiceBonus } from '@/data/cards';
import { ActionSkillActor, CharacterId, RoomState, SkillStatus } from '@/types/game';
import { supabase } from '@/lib/supabase';
import LobbyView from '@/components/LobbyView';
import HeaderBar from '@/components/HeaderBar';
import TabBooklet from '@/components/TabBooklet';
import TabClueMap from '@/components/TabClueMap';
import TabInventory from '@/components/TabInventory';
import TabStoryEnding from '@/components/TabStoryEnding';
import { BookOpen, Search, Briefcase, Film, Bell, ArrowRight, X } from 'lucide-react';

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
    skillStatus: {},
    jailedCharacter: null,
    cliveEscapeRoll: null,
    chaseDiceRolls: {},
    playerScores: {},
    updatedAt: Date.now()
  };
}

type ActiveTab = 'story' | 'booklet' | 'cluemap' | 'inventory';

interface GateToast {
  id: string;
  badge: string;
  title: string;
  message: string;
  targetTab: ActiveTab;
  ctaLabel: string;
  tone: 'amber' | 'rose' | 'emerald';
}

export default function HomePage() {
  const [roomCode, setRoomCode] = useState<string>('1889');
  const [selectedCharId, setSelectedCharId] = useState<CharacterId | null>(
    null
  );
  const [isCharacterLocked, setIsCharacterLocked] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('story');
  const [gateToast, setGateToast] = useState<GateToast | null>(null);
  const prevSnapshotRef = useRef<{
    charId: CharacterId | null;
    g0: boolean;
    g1: boolean;
    g2: boolean;
    g3: boolean;
    bribed: CharacterId | null;
  } | null>(null);
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

  // 관문 해금 / 사법거래 실시간 감지 시 토스트 배너 표시
  useEffect(() => {
    if (!selectedCharId) {
      prevSnapshotRef.current = null;
      setGateToast(null);
      return;
    }

    const currentSnapshot = {
      charId: selectedCharId,
      g0: room.gate0Unlocked,
      g1: room.gate1Unlocked,
      g2: room.gate2Unlocked,
      g3: room.gate3Unlocked,
      bribed: room.bribedResident
    };

    const prev = prevSnapshotRef.current;
    prevSnapshotRef.current = currentSnapshot;

    // 캐릭터 입장 직후 첫 상태 기록 시에는 토스트 미표시
    if (!prev || prev.charId !== selectedCharId) {
      return;
    }

    let nextToast: GateToast | null = null;
    if (!prev.g3 && room.gate3Unlocked) {
      nextToast = {
        id: `gate3-${Date.now()}`,
        badge: '최종 결말 공개',
        title: '최종 결말 & 진상 해설이 열렸습니다!',
        message: '최종 점수 정산표와 캐릭터별 엔딩 대본을 확인하세요.',
        targetTab: 'story',
        ctaLabel: '결말 확인하기',
        tone: 'emerald'
      };
    } else if (!prev.g2 && room.gate2Unlocked) {
      nextToast = {
        id: `gate2-${Date.now()}`,
        badge: '최종 결판 오픈',
        title: '최종 결판 단계가 해금되었습니다!',
        message: '행동 스킬, 최종 투표 및 결판 판정을 진행하세요.',
        targetTab: 'story',
        ctaLabel: '결판 탭으로 이동',
        tone: 'amber'
      };
    } else if (!prev.g1 && room.gate1Unlocked) {
      nextToast = {
        id: `gate1-${Date.now()}`,
        badge: '긴급 상황 발생',
        title: '새로운 국면이 열렸습니다!',
        message: '긴급 속보 나레이션과 2차 단서 조사 구역을 확인하세요.',
        targetTab: 'story',
        ctaLabel: '긴급 속보 보기',
        tone: 'rose'
      };
    } else if (!prev.g0 && room.gate0Unlocked) {
      nextToast = {
        id: `gate0-${Date.now()}`,
        badge: '1차 조사 시작',
        title: '단서 구역 조사가 해금되었습니다!',
        message: '단서 구역 탭에서 실시간 조사 순번을 확인하세요.',
        targetTab: 'cluemap',
        ctaLabel: '단서 구역 이동',
        tone: 'amber'
      };
    } else if (
      prev.bribed !== room.bribedResident &&
      room.bribedResident === selectedCharId
    ) {
      nextToast = {
        id: `bribe-${Date.now()}`,
        badge: '사법거래 성립',
        title: '클라이브의 회유서가 반영되었습니다!',
        message: '개인 설정집에서 변경된 5점 승리 목표를 확인하세요.',
        targetTab: 'booklet',
        ctaLabel: '내 설정집 보기',
        tone: 'amber'
      };
    }

    if (!nextToast) return;
    // 마스터가 현재 보고 있는 탭에서 직접 해금한 경우 불필요한 중복 알림 생략
    if (selectedCharId === 'gm' && activeTab === nextToast.targetTab) return;

    setGateToast(nextToast);
  }, [
    selectedCharId,
    room.gate0Unlocked,
    room.gate1Unlocked,
    room.gate2Unlocked,
    room.gate3Unlocked,
    room.bribedResident,
    activeTab
  ]);

  // 토스트 자동 닫힘 (10초)
  useEffect(() => {
    if (!gateToast) return;
    const timer = setTimeout(() => setGateToast(null), 10000);
    return () => clearTimeout(timer);
  }, [gateToast]);

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
              const isRemoteReset =
                !remote.gate0Unlocked &&
                !remote.gate1Unlocked &&
                !remote.gate2Unlocked &&
                !remote.gate3Unlocked &&
                Object.values(remote.cardOwners || {}).every((v) => v === null);

              const merged: RoomState = isRemoteReset
                ? remote
                : {
                    ...remote,
                    gate0Unlocked: prev.gate0Unlocked || remote.gate0Unlocked,
                    gate1Unlocked: prev.gate1Unlocked || remote.gate1Unlocked,
                    gate2Unlocked: prev.gate2Unlocked || remote.gate2Unlocked,
                    gate3Unlocked: prev.gate3Unlocked || remote.gate3Unlocked,
                    cardOwners: remote.cardOwners || prev.cardOwners,
                    chaseDiceRolls: remote.chaseDiceRolls || {},
                    skillStatus: remote.skillStatus || {},
                    playerScores: remote.playerScores || {}
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

  // 공통 액션 호출 헬퍼 (모든 액션 낙관적 즉시 반영 + Supabase 실시간 동기화)
  const dispatchRoomAction = async (
    action: string,
    payload: Record<string, unknown> = {}
  ): Promise<{ ok: boolean; error?: string }> => {
    if (action === 'reset_room') {
      const initial = createInitialLocalRoom(roomCode);
      setRoom(initial);
      try {
        localStorage.removeItem(`nf_room_state_${roomCode}`);
        localStorage.removeItem('nf_char_id');
      } catch {}
      setSelectedCharId(null);
      syncToSupabase(initial);
    } else {
      setRoom((prev) => {
        const next: RoomState = {
          ...prev,
          updatedAt: Date.now()
        };

        switch (action) {
          case 'unlock_gate': {
            const gate = Number(payload.gate);
            if (gate === 0 || gate === 1) next.gate0Unlocked = true;
            if (gate === 1) next.gate1Unlocked = true;
            if (gate === 2) next.gate2Unlocked = true;
            if (gate === 3) next.gate3Unlocked = true;
            break;
          }
          case 'acquire_card': {
            const cardId = String(payload.cardId);
            next.cardOwners = {
              ...prev.cardOwners,
              [cardId]: payload.characterId as CharacterId
            };
            break;
          }
          case 'transfer_card': {
            const cardId = String(payload.cardId);
            next.cardOwners = {
              ...prev.cardOwners,
              [cardId]: payload.toCharacterId as CharacterId
            };
            break;
          }
          case 'return_card': {
            const cardId = String(payload.cardId);
            next.cardOwners = {
              ...prev.cardOwners,
              [cardId]: null
            };
            break;
          }
          case 'set_bribe': {
            next.bribedResident = (payload.residentId as CharacterId) || null;
            break;
          }
          case 'submit_secret_pick': {
            const actor = payload.actor as 'clive' | 'grace';
            const targetId = (payload.targetId as CharacterId) || null;
            if (actor === 'clive') next.cliveSecretPick = targetId;
            if (actor === 'grace') next.graceSecretPick = targetId;
            break;
          }
          case 'set_jailed': {
            const charId = (payload.characterId as CharacterId) || null;
            next.jailedCharacter = charId;
            if (charId !== 'clive') next.cliveEscapeRoll = null;
            break;
          }
          case 'roll_clive_escape': {
            next.cliveEscapeRoll =
              typeof payload.value === 'number' ? payload.value : null;
            break;
          }
          case 'set_chase_dice': {
            const charId = payload.characterId as CharacterId;
            const nextRolls = { ...prev.chaseDiceRolls };
            if (payload.value === null || payload.value === undefined) {
              delete nextRolls[charId];
            } else {
              nextRolls[charId] = Number(payload.value);
            }
            next.chaseDiceRolls = nextRolls;
            break;
          }
          case 'set_skill_status': {
            const actor = payload.actor as ActionSkillActor;
            const status = payload.status as SkillStatus;
            next.skillStatus = {
              ...(prev.skillStatus || {}),
              [actor]: status
            };
            break;
          }
          case 'set_player_score': {
            const charId = payload.characterId as CharacterId;
            next.playerScores = {
              ...(prev.playerScores || {}),
              [charId]: Number(payload.score)
            };
            break;
          }
        }

        try {
          localStorage.setItem(`nf_room_state_${roomCode}`, JSON.stringify(next));
        } catch {}
        syncToSupabase(next);
        return next;
      });
    }

    // 백그라운드 API 동기화 (서버 메모리 Fallback용, 낙관적 최신 상태를 덮어쓰지 않음)
    try {
      await fetch('/api/room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomCode,
          action,
          ...payload
        })
      });
    } catch {
      // Supabase Realtime 및 localStorage 동기화 우선이므로 네트워크 오류 무시
    }
    return { ok: true };
  };

  // 캐릭터별 추격전 주사위 보너스 자동 계산 (개당 +1, 클라이브 기본 +1)
  const calculateCharacterBonus = useCallback(
    (charId: CharacterId): number => {
      const charData = CHARACTER_MAP[charId];
      if (!charData) return 0;
      return calculateChaseDiceBonus(charId, charData.faction, room.cardOwners);
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

      {/* 관문 해금 / 이벤트 알림 토스트 배너 */}
      {gateToast && (
        <div className="fixed top-[66px] inset-x-0 z-40 px-3 pointer-events-none">
          <div
            className={`max-w-md mx-auto p-3.5 rounded-2xl border-2 shadow-2xl backdrop-blur-md pointer-events-auto flex items-start justify-between gap-2.5 transition-all ${
              gateToast.tone === 'rose'
                ? 'bg-rose-950/95 border-rose-500 text-rose-100'
                : gateToast.tone === 'emerald'
                ? 'bg-emerald-950/95 border-emerald-500 text-emerald-100'
                : 'bg-amber-950/95 border-amber-500 text-amber-100'
            }`}
          >
            <div className="flex items-start gap-2.5 min-w-0">
              <div
                className={`p-2 rounded-xl shrink-0 ${
                  gateToast.tone === 'rose'
                    ? 'bg-rose-900 text-rose-200'
                    : gateToast.tone === 'emerald'
                    ? 'bg-emerald-900 text-emerald-200'
                    : 'bg-amber-900 text-amber-200'
                }`}
              >
                <Bell className="w-4 h-4 animate-bounce" />
              </div>
              <div className="min-w-0 space-y-0.5">
                <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/40 text-amber-200">
                  {gateToast.badge}
                </span>
                <div className="text-xs font-extrabold leading-snug">
                  {gateToast.title}
                </div>
                <p className="text-[11px] opacity-90 leading-snug">
                  {gateToast.message}
                </p>
                {activeTab !== gateToast.targetTab && (
                  <button
                    onClick={() => {
                      setActiveTab(gateToast.targetTab);
                      setGateToast(null);
                    }}
                    className={`mt-2 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-extrabold shadow transition ${
                      gateToast.tone === 'rose'
                        ? 'bg-rose-500 hover:bg-rose-400 text-stone-950'
                        : gateToast.tone === 'emerald'
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-stone-950'
                        : 'bg-amber-500 hover:bg-amber-400 text-stone-950'
                    }`}
                  >
                    <span>{gateToast.ctaLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <button
              onClick={() => setGateToast(null)}
              className="p-1 rounded-lg hover:bg-black/30 text-stone-300 shrink-0 transition"
              aria-label="알림 닫기"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

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
            onUpdatePlayerScore={(characterId, score) =>
              dispatchRoomAction('set_player_score', { characterId, score })
            }
          />
        )}

        {activeTab === 'cluemap' && (
          <TabClueMap
            character={currentCharacter}
            room={room}
            onAcquireCard={(cardId, targetCharId) =>
              dispatchRoomAction('acquire_card', {
                cardId,
                characterId: targetCharId || currentCharacter.id
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
            onSetSkillStatus={(actor, status) =>
              dispatchRoomAction('set_skill_status', { actor, status })
            }
            onSetPlayerScore={(characterId, score) =>
              dispatchRoomAction('set_player_score', { characterId, score })
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
            <span className="text-[11px]">
              {selectedCharId === 'gm' ? '마스터 설정집' : '내 설정집'}
            </span>
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
              {selectedCharId === 'gm'
                ? '전체 소지품'
                : `내 소지품 ${myInventoryCount > 0 ? `(${myInventoryCount})` : ''}`}
            </span>
          </button>
        </div>
      </nav>
    </div>
  );
}
