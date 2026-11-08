import { ScenarioPackage } from '@/types/scenario';
import { CHARACTERS } from './characters';
import { CLUE_CARDS } from './cards';
import { TIMETABLE_STEPS } from './timetable';

export const newFrontierScenario: ScenarioPackage = {
  metadata: {
    id: 'new-frontier',
    title: '옛날 옛적 뉴프론티어에서',
    englishTitle: 'Once Upon a Time in New Frontier',
    genre: '서부극 누아르 / 심리 추리 & 서바이벌',
    minPlayers: 6,
    maxPlayers: 7,
    playtimeMinutes: 120,
    posterImage: '/teaser-poster.jpg',
    synopsis:
      '모래폭풍이 몰아치는 서부 개척 마을 뉴프론티어. 사라진 악덕 보안관 행크와 바닥에 떨어진 피 묻은 배지, 그리고 마을을 찾아온 낯선 수사관 클라이브.',
    themeColor: {
      primary: 'amber',
      accent: 'amber-600',
      bgClass: 'bg-stone-950',
    },
  },
  characters: CHARACTERS,
  cards: CLUE_CARDS,
  timetable: TIMETABLE_STEPS,
};
