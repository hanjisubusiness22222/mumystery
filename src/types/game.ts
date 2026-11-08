export type CharacterId =
  | 'clive'
  | 'annie'
  | 'benny'
  | 'david'
  | 'ernest'
  | 'florence'
  | 'grace';

export type FactionType = 'kill_subdue' | 'survival';

export interface CharacterGoal {
  id: string;
  label: string;
  points: number;
  title: string;
  description: string;
  isHiddenUntilMidEvent?: boolean;
  canBeReplacedByBribe?: boolean;
}

export interface CharacterSkill {
  id: string;
  quote: string;
  itemName: string;
  timing: string;
  priorityBadge: string;
  description: string;
  warning?: string;
}

export interface CharacterData {
  id: CharacterId;
  initial: 'C' | 'A' | 'B' | 'D' | 'E' | 'F' | 'G';
  name: string;
  roleTitle: string;
  emoji: string;
  colorClass: string;
  accentBorder: string;
  faction: FactionType;
  maxPoints: number;
  quote: string;
  publicIntro: string;
  secretStory: string[];
  lastNightActionsTitle: string;
  lastNightActions: string[];
  goals: CharacterGoal[];
  skills: CharacterSkill[];
  passives?: {
    title: string;
    items: string[];
  };
  onlySevenPlayer?: boolean;
}

export type CardCategory =
  | 'kill_item'
  | 'survival_item'
  | 'quest_item'
  | 'clue';

export interface ClueCardData {
  id: string; // e.g., '1-1'
  zoneId: number; // 1 to 7
  zoneName: string; // 뒷면 표시 지역명 (예: "[주점 '원스 어폰 어 타임']")
  act: 1 | 2; // 1차 조사(1~5구역) vs 2차 조사(6~7구역)
  category: CardCategory;
  badgeText: string;
  title: string;
  description: string;
  effectNote?: string;
  diceBonus?: number; // +1 for kill_item / survival_item
}

export interface ZoneInfo {
  id: number;
  name: string;
  backLabel: string;
  emoji: string;
  manager: string;
  act: 1 | 2;
  cardCount: number;
}

export interface TimetableStep {
  step: number;
  title: string;
  minutes: number;
  description: string;
  isHighlight?: boolean;
  gateNumber?: 0 | 1 | 2 | 3;
}

export interface RoomState {
  roomCode: string;
  scenarioId?: string; // 확장형 멀티 시나리오 식별자 (기본값: 'new-frontier')
  playerCount: 6 | 7;
  // 4대 진행/스포일러 관문 해금 여부
  gate0Unlocked: boolean; // 암호: 0301 (3단계 1차 조사 시작 해금 — 자기소개 전 카드 선점 방지)
  gate1Unlocked: boolean; // 암호: 1889 (5단계 빈 무덤의 반전 & 2차 조사 구역 6,7 오픈)
  gate2Unlocked: boolean; // 암호: 0607 (9~12단계 비밀 지목 & 행크 추격전 오픈)
  gate3Unlocked: boolean; // 암호: 9999 (13단계 멀티 엔딩 & 사건의 전말 오픈)
  // 카드 소유 상태: cardId -> CharacterId | null
  cardOwners: Record<string, CharacterId | null>;
  // 클라이브의 사법거래 회유서 수락 주민
  bribedResident: CharacterId | null;
  // 9단계 1분 비밀 지목 (최후 변론 직후)
  cliveSecretPick: CharacterId | null; // 행크의 조력자 지목 (플로렌스 or 그레이스 정답)
  graceSecretPick: CharacterId | null; // 매드독 지목 (클라이브 정답)
  // 11단계 최종 투표 유치장 수감자
  jailedCharacter: CharacterId | null;
  cliveEscapeRoll: number | null; // 클라이브 수감 시 탈옥 주사위 (4 이상 탈옥 성공)
  // 12단계 행크 추격전 주사위 눈금 (1~6)
  chaseDiceRolls: Partial<Record<CharacterId, number>>;
  updatedAt: number;
}
