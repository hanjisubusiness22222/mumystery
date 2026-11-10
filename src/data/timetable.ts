import { TimetableStep } from '@/types/game';

// 일반 플레이어 및 마스터 타임테이블
export const TIMETABLE_STEPS: TimetableStep[] = [
  {
    step: 1,
    title: '오프닝 & 설정집 정독',
    minutes: 10,
    description: '공통 도입부 낭독 후 스마트폰으로 개인 비밀 설정집 정독'
  },
  {
    step: 2,
    title: '자기소개 & 1차 발언',
    minutes: 10,
    description: '전체 플레이어가 시계 방향으로 1인당 1분씩 기본 신분 및 어젯밤 행적 소개'
  },
  {
    step: 3,
    title: '1차 조사 (전반전)',
    minutes: 8,
    description: '진행자의 안내에 따라 기본 구역 단서 카드 조사 및 획득',
    isHighlight: true,
    gateNumber: 0
  },
  {
    step: 4,
    title: '전반전 대화 & 1:1 밀담',
    minutes: 20,
    description: '광장 자유 토론 및 1:1 밀담, 단서 공유 및 탐색'
  },
  {
    step: 5,
    title: '긴급 상황 발생 (새로운 국면)',
    minutes: 5,
    description: '진행자의 안내에 따라 새로운 국면 돌입 및 추가 구역 오픈',
    isHighlight: true,
    gateNumber: 1
  },
  {
    step: 6,
    title: '2차 조사 (후반전)',
    minutes: 8,
    description: '신규 구역 및 잔여 단서 카드 조사 및 획득'
  },
  {
    step: 7,
    title: '후반전 밀담 & 협상',
    minutes: 25,
    description: '최종 단서 교환, 1:1 밀담 및 각자의 목표를 위한 전략적 협상'
  },
  {
    step: 8,
    title: '최후 변론 (광장 발언)',
    minutes: 7,
    description: '결정적 국면 돌입 전, 1인당 1분씩 최후의 호소 및 의심자 지목 발언',
    isHighlight: true
  },
  {
    step: 9,
    title: '최후의 비밀 지목',
    minutes: 1,
    description: '진행자의 신호에 따라 특정 인물들의 비밀 선택 진행',
    isHighlight: true,
    gateNumber: 2
  },
  {
    step: 10,
    title: '행동 스킬 발동',
    minutes: 5,
    description: '각자의 특수 시그니처 능력 발동 및 전략 실행'
  },
  {
    step: 11,
    title: '최종 용의자 투표',
    minutes: 5,
    description: '용의자 지목 투표 및 체포자 판정'
  },
  {
    step: 12,
    title: '최종 결판 (주사위 판정)',
    minutes: 5,
    description: '운명을 가르는 최종 주사위 판정'
  },
  {
    step: 13,
    title: '최종 결말 낭독 & 점수 정산',
    minutes: 11,
    description: '최종 엔딩 낭독, 목표 점수 채점 및 사건의 전말 공개',
    isHighlight: true,
    gateNumber: 3
  }
];

// 진행자(GM/마스터) 전용 상세 마스터 가이드
export const GM_TIMETABLE_GUIDE = [
  {
    step: 1,
    title: '오프닝 & 설정집 정독 (10분)',
    actions: '오프닝 나레이션을 소리 내어 낭독하고, 플레이어들이 스마트폰으로 개인 비밀 설정집을 읽도록 안내합니다.'
  },
  {
    step: 2,
    title: '자기소개 & 1차 발언 (10분)',
    actions: '클라이브부터 시계 방향으로 1분씩 자기소개와 어젯밤 대략의 알리바이를 말하도록 진행합니다.'
  },
  {
    step: 3,
    title: '1차 단서 조사 (8분)',
    actions: '마스터 원터치 버튼으로 1차 조사를 해금하고, 플레이어들이 1~5구역 카드를 스네이크 드래프트로 2장씩 뽑도록 지시합니다.'
  },
  {
    step: 4,
    title: '전반전 대화 & 1:1 밀담 (20분)',
    actions: '광장 자유 토론을 유도하고, 원하는 사람끼리 1:1 밀담(3분 제한)을 하도록 시간을 체크합니다.'
  },
  {
    step: 5,
    title: '긴급 상황 발생 (새로운 국면) (5분)',
    actions: '마스터 원터치 버튼으로 긴급 상황을 해금합니다! "행크의 빈 무덤" 사건 대본을 낭독하고, 6~7구역 및 히든 미션을 활성화시킵니다.'
  },
  {
    step: 6,
    title: '2차 추가 단서 조사 (8분)',
    actions: '신규 구역(빈 무덤, 폐광)과 1차 잔여 카드 중 순서대로 1장씩 추가 조사하도록 안내합니다.'
  },
  {
    step: 7,
    title: '후반전 밀담 & 협상 (25분)',
    actions: '추격전 아이템 몰아주기, 배지·비리장부 거래, 클라이브의 사법거래 회유서가 활발히 오가도록 시간을 관리합니다.'
  },
  {
    step: 8,
    title: '최후 변론 (7분)',
    actions: '1인당 1분씩 돌아가며 마지막 광장 호소 발언을 진행합니다.'
  },
  {
    step: 9,
    title: '최후의 비밀 지목 (1분)',
    actions: '마스터 원터치 버튼으로 결판을 해금하여 클라이브(조력자 지목)와 그레이스(매드독 지목)가 앱에서 비밀 지목을 완료하게 합니다.'
  },
  {
    step: 10,
    title: '행동 스킬 발동 (5분)',
    actions: '행동 스킬을 번호 순서대로 진행합니다: 1번(클라이브: 총구 겨누기) -> 2번(애니: 수면제) -> 3번(데이비드: 아이템 압수) -> 4번(플로렌스: 현장 도주). (※ 그레이스는 공격당할 때 즉시 은빛 십자가로 방어 가능)'
  },
  {
    step: 11,
    title: '최종 용의자 투표 (5분)',
    actions: '동시에 손가락으로 용의자 1명을 지목하게 하고, 앱에 수감자를 체크합니다. (클라이브 수감 시 탈옥 주사위 4 이상 판정)'
  },
  {
    step: 12,
    title: '최종 결판 (주사위 판정) (5분)',
    actions: '자유인 전원이 행크 추격전 주사위를 굴려 앱에 입력하고, 아이템 보너스(+1)를 합산하여 최종 승리자를 판정합니다.'
  },
  {
    step: 13,
    title: '최종 결말 낭독 & 점수 정산 (11분)',
    actions: '마스터 원터치 버튼으로 결말을 해금하여 최종 1등 캐릭터의 엔딩을 낭독하고, 진상 해설서를 열어 사건의 전말을 공개합니다.'
  }
];
