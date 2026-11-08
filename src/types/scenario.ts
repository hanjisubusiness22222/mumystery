import { CharacterData, ClueCardData, TimetableStep } from '@/types/game';

export interface ScenarioMetadata {
  id: string;
  title: string;
  englishTitle: string;
  genre: string;
  minPlayers: number;
  maxPlayers: number;
  playtimeMinutes: number;
  posterImage: string;
  synopsis: string;
  themeColor: {
    primary: string;
    accent: string;
    bgClass: string;
  };
}

export interface ScenarioPackage {
  metadata: ScenarioMetadata;
  characters: CharacterData[];
  cards: ClueCardData[];
  timetable: TimetableStep[];
}
