import { CharacterData, CharacterId } from '@/types/game';
import { CHARACTERS as ORIGINAL_CHARS } from './characters';

export const GM_CHARACTER: CharacterData = {
  id: 'gm',
  initial: 'G',
  name: '게임 진행자 (GM)',
  roleTitle: '마스터 / 사회자',
  emoji: '🎩',
  colorClass: 'from-amber-950/90 to-stone-900',
  accentBorder: 'border-amber-400',
  faction: 'neutral',
  maxPoints: 0,
  quote: '모든 비밀과 진실을 조율하는 서부극의 마스터입니다.',
  publicIntro: '게임의 흐름과 시간, 전체 진행과 실시간 해금을 총괄하는 공식 진행자입니다.',
  secretStory: [
    '당신은 이 테이블의 게임 마스터(GM)입니다.',
    '플레이어들에게 오프닝을 읽어주고, 시간을 체크하며, 적절한 순간에 다음 단계를 해금하여 게임을 매끄럽게 이끌어 나갑니다.'
  ],
  lastNightActionsTitle: '진행자의 역할',
  lastNightActions: [
    '1. 권장 시간을 체크하고 광장 발언 및 1:1 밀담을 조율합니다.',
    '2. 마스터 전용 버튼으로 1차 조사, 긴급 상황, 결판, 결말을 해금합니다.',
    '3. 최종 투표와 추격전 주사위를 공정하게 진행하고 엔딩을 낭독합니다.'
  ],
  goals: [],
  skills: []
};

export const ALL_SELECTABLE_CHARACTERS = [...ORIGINAL_CHARS, GM_CHARACTER];
