import { CharacterId, ClueCardData, FactionType, ZoneInfo } from '@/types/game';

export const ZONES: ZoneInfo[] = [
  {
    id: 1,
    name: "주점 '원스 어폰 어 타임'",
    backLabel: "[주점 '원스 어폰 어 타임']",
    emoji: '🍷',
    manager: '애니 (사장), 베니 (피아니스트)',
    act: 1,
    cardCount: 3
  },
  {
    id: 2,
    name: '보안관 사무소',
    backLabel: '[보안관 사무소]',
    emoji: '⭐',
    manager: '데이비드 (부보안관)',
    act: 1,
    cardCount: 3
  },
  {
    id: 3,
    name: '타운 홀 - 시장 집무실',
    backLabel: '[타운 홀 - 시장 집무실]',
    emoji: '🏛️',
    manager: '어니스트 (시장)',
    act: 1,
    cardCount: 3
  },
  {
    id: 4,
    name: '마을 진료소',
    backLabel: '[마을 진료소]',
    emoji: '💉',
    manager: '플로렌스 (여의사)',
    act: 1,
    cardCount: 4
  },
  {
    id: 5,
    name: '마을 성당',
    backLabel: '[마을 성당]',
    emoji: '⛪',
    manager: '그레이스 (수녀)',
    act: 1,
    cardCount: 4
  },
  {
    id: 6,
    name: '외곽 마른 나무 (사건 현장)',
    backLabel: '[외곽 마른 나무 (사건 현장)]',
    emoji: '🪦',
    manager: '2차 조사 신규 오픈 구역',
    act: 2,
    cardCount: 3
  },
  {
    id: 7,
    name: '외곽 폐광 - 은신처',
    backLabel: '[외곽 폐광 - 은신처]',
    emoji: '⛏️',
    manager: '2차 조사 신규 오픈 구역',
    act: 2,
    cardCount: 4
  }
];

export const CLUE_CARDS: ClueCardData[] = [
  // 구역 1: 주점 '원스 어폰 어 타임'
  {
    id: '1-1',
    zoneId: 1,
    zoneName: "[주점 '원스 어폰 어 타임']",
    act: 1,
    category: 'quest_item',
    badgeText: '📜 비밀 증거품',
    title: '[증거품] 철도 부지 매각 이중 장부',
    description:
      '행크가 부관 데이비드의 감시를 피해, 주점 2층 자신이 묵던 내실 침대 밑 비밀 나무상자에 숨겨두었던 장부다. 마을 철도 부지 매각 대금 수천 달러를 개인 명의로 횡령한 내역이 빼곡히 적혀 있다.',
    effectNote: '★특징: 누군가의 치명적인 약점이자, 진실 규명과 협상의 핵심 증거물입니다.'
  },
  {
    id: '1-2',
    zoneId: 1,
    zoneName: "[주점 '원스 어폰 어 타임']",
    act: 1,
    category: 'clue',
    badgeText: '🔎 사건 단서',
    title: '[단서] 피 묻은 손수건과 깨진 위스키 병 파편',
    description:
      "피아니스트 베니의 피아노 의자 밑에서 발견된 린넨 손수건이다. 바닥에 흥건했던 다량의 피와 독한 버번 위스키를 급하게 닦아낸 흔적이 남아 있으며, 손수건 모서리에는 이니셜 'B'가 수놓아져 있다."
  },
  {
    id: '1-3',
    zoneId: 1,
    zoneName: "[주점 '원스 어폰 어 타임']",
    act: 1,
    category: 'clue',
    badgeText: '🔎 사건 단서',
    title: '[단서] 애니의 비밀 일기장과 빈 약병',
    description:
      '서랍 안쪽에서 발견된 일기장과 라벨이 뜯긴 작은 갈색 유리병이다.\n"그의 폭력을 견디는 것도 오늘 밤이 마지막이다. 이 약을 위스키에 타면, 그 악마도 영원히 잠들겠지."'
  },

  // 구역 2: 보안관 사무소
  {
    id: '2-1',
    zoneId: 2,
    zoneName: '[보안관 사무소]',
    act: 1,
    category: 'kill_item',
    badgeText: '💥 고위력 호신 무기 (주사위 +1)',
    title: '[무기] 대구경 콜트 리볼버',
    description:
      '보안관 집무실 책상 밑 비밀 금고 안쪽에 보관되어 있던 행크 소유의 묵직한 대구경 리볼버 권총이다. 총열이 길고 파괴력이 뛰어나 단 한 발로도 치명상을 입힐 수 있다.',
    effectNote: '★효과: 후반전 최종 결판 주사위 판정 시 기본 눈금 +1 보너스 획득 (긴급 상황 발생 후 활성화)',
    diceBonus: 1
  },
  {
    id: '2-2',
    zoneId: 2,
    zoneName: '[보안관 사무소]',
    act: 1,
    category: 'clue',
    badgeText: '🔎 사건 단서',
    title: '[단서] 흠집 난 윈체스터 라이플 개머리판',
    description:
      '부관 데이비드의 총기함에 세워져 있던 라이플이다. 나무 개머리판 모서리가 최근 무언가 단단한 것(사람의 머리 등)을 무자비하게 내려친 듯 깊게 패여 있고, 갈라진 틈새에 검붉은 핏자국과 머리카락이 끼어 있다.'
  },
  {
    id: '2-3',
    zoneId: 2,
    zoneName: '[보안관 사무소]',
    act: 1,
    category: 'clue',
    badgeText: '🔎 사건 단서',
    title: '[단서] 3년 전 선대 보안관 의문사 부검 초안',
    description:
      '데이비드가 몰래 수집하고 있던 3년 전 아버지(선대 보안관)의 사망 기록이다. 공식 사인은 \'사막 순찰 중 낙마 사고\'로 처리되었으나, 초안에는 "후두부 둔기 타격에 의한 타살 후 연방 배지를 강탈당한 정황이 뚜렷함"이라고 적혀 있다.'
  },

  // 구역 3: 타운 홀 - 시장 집무실
  {
    id: '3-1',
    zoneId: 3,
    zoneName: '[타운 홀 - 시장 집무실]',
    act: 1,
    category: 'kill_item',
    badgeText: '💥 고위력 특수 탄약 (주사위 +1)',
    title: '[탄환] 할로우 포인트 특수 탄약',
    description:
      '어니스트 시장이 호신용으로 비밀리에 구비해 둔 고위력 특수 탄환 상자다. 표적에 적중하는 순간 탄두가 팽창하여, 어떤 질긴 생명력을 가진 자라도 단번에 숨통을 끊어놓을 수 있다.',
    effectNote: '★효과: 후반전 최종 결판 주사위 판정 시 기본 눈금 +1 보너스 획득 (긴급 상황 발생 후 활성화)',
    diceBonus: 1
  },
  {
    id: '3-2',
    zoneId: 3,
    zoneName: '[타운 홀 - 시장 집무실]',
    act: 1,
    category: 'clue',
    badgeText: '🔎 사건 단서',
    title: '[단서] 피와 진흙이 묻은 가죽 장갑 및 폐광 권리증',
    description:
      '어니스트 시장의 양복 코트 주머니에서 나온 최고급 가죽 장갑이다. 주먹 관절(너클) 부분이 해져 피가 묻어 있으며, 함께 들어있는 서류에는 마을 북쪽 외곽(마른 나무와 폐광 일대)의 토지 소유권이 어니스트 시장 명의로 되어 있다.'
  },
  {
    id: '3-3',
    zoneId: 3,
    zoneName: '[타운 홀 - 시장 집무실]',
    act: 1,
    category: 'clue',
    badgeText: '🔎 사건 단서',
    title: '[단서] 털린 시장실 금고와 협박 편지',
    description:
      '누군가 금고를 털어간 뒤 남겨둔 협박 편지다.\n"시장 영감, 네놈의 철도 부지 이중 장부는 내가 잘 모셔놓았다. 감옥에 가기 싫으면 매달 상납금을 두 배로 준비해라."'
  },

  // 구역 4: 마을 진료소
  {
    id: '4-1',
    zoneId: 4,
    zoneName: '[마을 진료소]',
    act: 1,
    category: 'survival_item',
    badgeText: '🛡️ 전문 외과 의료 키트 (주사위 +1)',
    title: '[의술] 응급 외과 봉합 키트',
    description:
      '플로렌스 원장이 가장 아끼는 최고급 외과 수술 도구와 지혈제, 강심제가 완비된 의료 키트다. 치명상을 입은 환자라도 현장에서 즉시 응급 처치하여 목숨을 살려낼 수 있다.',
    effectNote: '★효과: 후반전 최종 결판 주사위 판정 시 기본 눈금 +1 보너스 획득 (긴급 상황 발생 후 활성화)',
    diceBonus: 1
  },
  {
    id: '4-2',
    zoneId: 4,
    zoneName: '[마을 진료소]',
    act: 1,
    category: 'clue',
    badgeText: '🔎 사건 단서',
    title: '[단서] 피 묻은 수술 도구',
    description:
      '쓰레기통 깊숙한 곳에 버려진 외과용 메스와 피에 젖은 봉합사, 거즈 뭉치다. 놀랍게도 거즈에 묻은 피가 아직 완전히 마르지 않은 선홍빛이다!'
  },
  {
    id: '4-3',
    zoneId: 4,
    zoneName: '[마을 진료소]',
    act: 1,
    category: 'clue',
    badgeText: '🔎 사건 단서',
    title: '[단서] 모르핀 과잉 처방 내역 및 수면 마취제 반출 기록',
    description:
      '플로렌스가 지난 수년간 마을 환자들에게 모르핀을 과잉 처방해 불법 폭리를 취한 비밀 장부다. 마지막 페이지에는 어젯밤 치사량에 달하는 고농축 수면 마취제 1병이 반출된 기록이 적혀 있다.'
  },
  {
    id: '4-4',
    zoneId: 4,
    zoneName: '[마을 진료소]',
    act: 1,
    category: 'clue',
    badgeText: '🔎 사건 단서',
    title: '[단서] 행크의 특이 체질(약물 내성) 진료 기록',
    description:
      '전임 보안관 행크의 차트다. "환자는 수년간 상납받은 모르핀을 매일 과다 투약한 결과, 마취성 진통제에 대해 일반인의 4배가 넘는 극도의 약물 내성을 지님."'
  },

  // 구역 5: 마을 성당
  {
    id: '5-1',
    zoneId: 5,
    zoneName: '[마을 성당]',
    act: 1,
    category: 'quest_item',
    badgeText: '🌟 상징적 유품',
    title: '[유품] 피 묻은 연방 보안관 배지',
    description:
      '고해성사실에서 제단 뒤로 이어진 진흙 발자국 끝, 성모상 밑바닥 비밀 공간에 숨겨져 있던 진짜 연방 보안관 배지다.',
    effectNote: '★특징: 법 집행관의 정통성과 권위를 상징하는 귀중한 유품입니다.'
  },
  {
    id: '5-2',
    zoneId: 5,
    zoneName: '[마을 성당]',
    act: 1,
    category: 'survival_item',
    badgeText: '🛡️ 특수 제작 방탄 조끼 (주사위 +1)',
    title: '[방어] 강철 방탄 조끼',
    description:
      '두꺼운 가죽 옷 안쪽에 강철판을 덧대어 만든 특수 방탄 조끼다. 누군가 급하게 성당에 들러 숨겨둔 것으로 보이며, 총잡이의 치명적인 총탄을 막아낼 수 있는 견고한 방어구다.',
    effectNote: '★효과: 후반전 최종 결판 주사위 판정 시 기본 눈금 +1 보너스 획득 (긴급 상황 발생 후 활성화)',
    diceBonus: 1
  },
  {
    id: '5-3',
    zoneId: 5,
    zoneName: '[마을 성당]',
    act: 1,
    category: 'clue',
    badgeText: '🔎 사건 단서',
    title: '[단서] 그레이스가 아버지와 같이 찍은 사진',
    description:
      '성경책 갈피에 소중히 끼워져 있던 빛바랜 흑백 사진이다. 어린 시절의 그레이스 수녀가 거칠고 험상궂은 인상의 중년 사내 품에 안겨 환하게 웃고 있다. 사내의 얼굴을 자세히 보니... 어디서 많이 본 듯한 모습이다.'
  },
  {
    id: '5-4',
    zoneId: 5,
    zoneName: '[마을 성당]',
    act: 1,
    category: 'clue',
    badgeText: '🔎 사건 단서',
    title: "[단서] 10년 전 '매드독 갱단' 몰살 사건 기사 및 수배지",
    description:
      '"서부 최악의 무법자 조직 \'매드독 갱단\'의 두목 일명 \'매드독\'이 현상금을 독차지하기 위해 부하들을 제 손으로 몰살하고 자취를 감췄다."'
  },

  // 구역 6: 외곽 마른 나무 (사건 현장) (2차 조사 오픈)
  {
    id: '6-1',
    zoneId: 6,
    zoneName: '[외곽 마른 나무 (사건 현장)]',
    act: 2,
    category: 'kill_item',
    badgeText: '💥 포박용 가죽 올가미 (주사위 +1)',
    title: '[포박] 올가미 밧줄',
    description:
      '무덤 근처 마른 나뭇가지에 걸려 있던 단단한 황소 가죽 올가미 밧줄이다. 도망치는 표적의 목이나 발목을 낚아채어 단숨에 쓰러뜨리고 제압할 수 있다.',
    effectNote: '★효과: 후반전 최종 결판 주사위 판정 시 기본 눈금 +1 보너스 획득', 
    diceBonus: 1
  },
  {
    id: '6-2',
    zoneId: 6,
    zoneName: '[외곽 마른 나무 (사건 현장)]',
    act: 2,
    category: 'clue',
    badgeText: '🔎 사건 단서',
    title: '[단서] 안에서부터 찢겨 나간 마대 자루와 칼자국',
    description:
      '어젯밤 시신을 감쌌던 거친 마대 자루다. 자루의 가슴팍 부위에는 날카로운 단검에 찔린 구멍이 나 있고, 매듭은 안쪽에서 누군가 손톱과 이빨로 미친 듯이 물어뜯고 기어 나온 듯 피투성이로 해져 있다.'
  },
  {
    id: '6-3',
    zoneId: 6,
    zoneName: '[외곽 마른 나무 (사건 현장)]',
    act: 2,
    category: 'clue',
    badgeText: '🔎 사건 단서',
    title: '[단서] 흙 묻은 삽과 마차 바퀴 자국',
    description:
      '마차의 바퀴 자국이고 구덩이 주변에 어지럽게 찍힌 발자국들이 보인다.'
  },

  // 구역 7: 외곽 폐광 - 은신처 (2차 조사 오픈)
  {
    id: '7-1',
    zoneId: 7,
    zoneName: '[외곽 폐광 - 은신처]',
    act: 2,
    category: 'kill_item',
    badgeText: '💥 폐광 갱도 상세 설계도 (주사위 +1)',
    title: '[추적] 폐광 갱도 비밀 지도',
    description:
      '거미줄처럼 얽힌 폐광 지하의 환기구와 비밀 지름길이 상세히 그려진 광산 설계도다. 이 지도가 있으면 은신처에 숨어 저항하는 표적의 등 뒤(사각지대)로 소리 없이 기습할 수 있다.',
    effectNote: '★효과: 후반전 최종 결판 주사위 판정 시 기본 눈금 +1 보너스 획득', 
    diceBonus: 1
  },
  {
    id: '7-2',
    zoneId: 7,
    zoneName: '[외곽 폐광 - 은신처]',
    act: 2,
    category: 'clue',
    badgeText: '🔎 사건 단서',
    title: '[단서] 플로렌스 진료소 라벨이 붙은 소독약과 진통제',
    description:
      '폐광 입구에서 발견된 플로렌스 진료소 라벨이 붙은 새 소독약 병과 진통제 주사기다.'
  },
  {
    id: '7-3',
    zoneId: 7,
    zoneName: '[외곽 폐광 - 은신처]',
    act: 2,
    category: 'clue',
    badgeText: '🔎 사건 단서',
    title: '[단서] 피 묻은 지혈대와 장전된 산탄총 탄피',
    description:
      '제3갱도 깊숙한 곳으로 이어지는 핏자국과 방금 떨어진 탄피다.'
  },
  {
    id: '7-4',
    zoneId: 7,
    zoneName: '[외곽 폐광 - 은신처]',
    act: 2,
    category: 'clue',
    badgeText: '🔎 사건 단서',
    title: '[단서] 암벽에 피로 적힌 글귀',
    description:
      '바위 벽에 피로 갈겨쓴 글귀다.\n"이것이 나의 업보일까. 하지만 이렇게는 죽을 수 없다. 반드시 나는 살아야 한다."'
  }
];

/**
 * 캐릭터 진영 및 역할에 따라 후반전 추격전 주사위 보너스를 계산한다.
 * 플로렌스는 중립(neutral) 표기이지만 행크를 살려야 하는 생존 루트이므로 survival_item 보너스를 적용한다.
 */
export function calculateChaseDiceBonus(
  charId: CharacterId,
  faction: FactionType,
  cardOwners: Record<string, CharacterId | null>
): number {
  let bonus = charId === 'clive' ? 1 : 0;
  const usesSurvivalItems = faction === 'survival' || charId === 'florence';

  for (const card of CLUE_CARDS) {
    if (cardOwners[card.id] !== charId) continue;

    if (faction === 'kill_subdue' && card.category === 'kill_item') {
      bonus += card.diceBonus ?? 1;
    } else if (usesSurvivalItems && card.category === 'survival_item') {
      bonus += card.diceBonus ?? 1;
    }
  }
  return bonus;
}
