import { CharacterId } from '@/types/game';

export interface DraftTurn {
  pickIndex: number; // 0 ~ 23 (총 24픽)
  characterId: CharacterId;
  round: 1 | 2 | 3 | 4;
  roundLabel: string;
}

// 7인 전용 스네이크 드래프트 24픽 순서
export const DRAFT_TURNS: DraftTurn[] = [
  // 1차 조사 - 1바퀴 (클라이브부터 시계 방향 7명)
  { pickIndex: 0, characterId: 'clive', round: 1, roundLabel: '1차 조사 · 1바퀴 (첫 번째 1장)' },
  { pickIndex: 1, characterId: 'annie', round: 1, roundLabel: '1차 조사 · 1바퀴 (첫 번째 1장)' },
  { pickIndex: 2, characterId: 'benny', round: 1, roundLabel: '1차 조사 · 1바퀴 (첫 번째 1장)' },
  { pickIndex: 3, characterId: 'david', round: 1, roundLabel: '1차 조사 · 1바퀴 (첫 번째 1장)' },
  { pickIndex: 4, characterId: 'ernest', round: 1, roundLabel: '1차 조사 · 1바퀴 (첫 번째 1장)' },
  { pickIndex: 5, characterId: 'florence', round: 1, roundLabel: '1차 조사 · 1바퀴 (첫 번째 1장)' },
  { pickIndex: 6, characterId: 'grace', round: 1, roundLabel: '1차 조사 · 1바퀴 (첫 번째 1장)' },

  // 1차 조사 - 2바퀴 (그레이스부터 역순 7명)
  { pickIndex: 7, characterId: 'grace', round: 2, roundLabel: '1차 조사 · 2바퀴 (두 번째 1장 · 역순)' },
  { pickIndex: 8, characterId: 'florence', round: 2, roundLabel: '1차 조사 · 2바퀴 (두 번째 1장 · 역순)' },
  { pickIndex: 9, characterId: 'ernest', round: 2, roundLabel: '1차 조사 · 2바퀴 (두 번째 1장 · 역순)' },
  { pickIndex: 10, characterId: 'david', round: 2, roundLabel: '1차 조사 · 2바퀴 (두 번째 1장 · 역순)' },
  { pickIndex: 11, characterId: 'benny', round: 2, roundLabel: '1차 조사 · 2바퀴 (두 번째 1장 · 역순)' },
  { pickIndex: 12, characterId: 'annie', round: 2, roundLabel: '1차 조사 · 2바퀴 (두 번째 1장 · 역순)' },
  { pickIndex: 13, characterId: 'clive', round: 2, roundLabel: '1차 조사 · 2바퀴 (두 번째 1장 · 역순)' },

  // 2차 조사 - 1바퀴 (그레이스부터 역순 7명)
  { pickIndex: 14, characterId: 'grace', round: 3, roundLabel: '2차 조사 · 1바퀴 (세 번째 1장 · 역순)' },
  { pickIndex: 15, characterId: 'florence', round: 3, roundLabel: '2차 조사 · 1바퀴 (세 번째 1장 · 역순)' },
  { pickIndex: 16, characterId: 'ernest', round: 3, roundLabel: '2차 조사 · 1바퀴 (세 번째 1장 · 역순)' },
  { pickIndex: 17, characterId: 'david', round: 3, roundLabel: '2차 조사 · 1바퀴 (세 번째 1장 · 역순)' },
  { pickIndex: 18, characterId: 'benny', round: 3, roundLabel: '2차 조사 · 1바퀴 (세 번째 1장 · 역순)' },
  { pickIndex: 19, characterId: 'annie', round: 3, roundLabel: '2차 조사 · 1바퀴 (세 번째 1장 · 역순)' },
  { pickIndex: 20, characterId: 'clive', round: 3, roundLabel: '2차 조사 · 1바퀴 (세 번째 1장 · 역순)' },

  // 2차 조사 - 잔여 3장 (클라이브부터 시계 방향 3명)
  { pickIndex: 21, characterId: 'clive', round: 4, roundLabel: '2차 조사 · 잔여 3장 추가 획득' },
  { pickIndex: 22, characterId: 'annie', round: 4, roundLabel: '2차 조사 · 잔여 3장 추가 획득' },
  { pickIndex: 23, characterId: 'benny', round: 4, roundLabel: '2차 조사 · 잔여 3장 추가 획득' },
];

// 1차 조사 1바퀴 셀프 은폐 방지 (본인 관리 구역 픽 금지)
export const CHARACTER_RESTRICTED_ZONES: Record<CharacterId, number | null> = {
  clive: null, // 클라이브: 관리 구역 없음 (외지 수사관)
  annie: 1,    // 애니: 1구역 (주점)
  benny: 1,    // 베니: 1구역 (주점)
  david: 2,    // 데이비드: 2구역 (보안관 사무소)
  ernest: 3,   // 어니스트: 3구역 (타운 홀 - 시장실)
  florence: 4, // 플로렌스: 4구역 (마을 진료소)
  grace: 5,    // 그레이스: 5구역 (마을 성당)
  gm: null
};

export interface CurrentDraftState {
  acquiredCount: number;
  currentTurn: DraftTurn | null;
  nextTurns: DraftTurn[];
  isAct1Complete: boolean; // 14장 모두 뽑힘
  isAllComplete: boolean;  // 24장 모두 뽑힘
  isWaitingGate1: boolean; // 1차 14장 다 뽑혔는데 2차 구역 아직 미해금
}

export function getCurrentDraftState(
  cardOwners: Record<string, CharacterId | null>,
  gate1Unlocked: boolean
): CurrentDraftState {
  const acquiredCount = Object.values(cardOwners).filter(Boolean).length;
  const isAct1Complete = acquiredCount >= 14;
  const isAllComplete = acquiredCount >= 24;
  const isWaitingGate1 = isAct1Complete && !gate1Unlocked && !isAllComplete;

  const currentTurn = acquiredCount < DRAFT_TURNS.length ? DRAFT_TURNS[acquiredCount] : null;
  const nextTurns = DRAFT_TURNS.slice(acquiredCount + 1, acquiredCount + 4);

  return {
    acquiredCount,
    currentTurn,
    nextTurns,
    isAct1Complete,
    isAllComplete,
    isWaitingGate1
  };
}
