import { TimetableStep } from '@/types/game';

export const GATE_PASSWORDS = {
  GATE_0_ACT1_INVESTIGATION: '0301', // 3단계 1차 조사 시작 해금 (자기소개 전 카드 클릭 방지)
  GATE_1_MID_EVENT: '1889', // 5단계 빈 무덤의 반전 & 2차 조사 구역(6, 7) 해금
  GATE_2_CLIMAX: '0607', // 9~12단계 비밀 지목 & 행크 추격전 해금
  GATE_3_ENDING: '9999' // 13단계 멀티 엔딩 & 사건의 전말 해설서 해금
};

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
    description: '클라이브부터 시계 방향으로 1인당 1분씩 기본 신분 및 어젯밤 행적 소개'
  },
  {
    step: 3,
    title: '1차 조사 (전반전)',
    minutes: 8,
    description: '[암호: 0301] 기본 5개 구역(17장) 해금! 클라이브부터 스네이크 순서로 1인당 1장씩 2바퀴(총 2장) 획득',
    isHighlight: true,
    gateNumber: 0
  },
  {
    step: 4,
    title: '전반전 대화 & 1:1 밀담',
    minutes: 20,
    description: '광장 토론 및 1:1 밀담, 단서 공유 및 은폐'
  },
  {
    step: 5,
    title: '★중반 이벤트: 빈 무덤의 반전',
    minutes: 5,
    description: '[암호: 1889] 2차 조사 직전 해금! 행크 생존 폭로 & 히든 미션·신규 구역(빈 무덤·폐광) 오픈',
    isHighlight: true,
    gateNumber: 1
  },
  {
    step: 6,
    title: '2차 조사 (후반전)',
    minutes: 8,
    description: '신규 구역(빈 무덤·폐광 7장) + 1차 잔여 카드(3장) 중 그레이스(또는 애니)부터 돌아가며 획득'
  },
  {
    step: 7,
    title: '후반전 밀담 & 아이템 몰아주기',
    minutes: 25,
    description: '사살·제압 4종 / 생존 2종 파츠(개당 +1) 양도, 배지·장부 거래, 회유서 포섭'
  },
  {
    step: 8,
    title: '★최후 변론 (광장 발언)',
    minutes: 7,
    description: '행동 단계 돌입 전, 1인당 1분씩 최후의 호소 및 의심자 지목 발언',
    isHighlight: true
  },
  {
    step: 9,
    title: '★그레이스·클라이브 비밀 지목',
    minutes: 1,
    description: '[암호: 0607] 최후 변론 직후 1분! 그레이스는 매드독을, 클라이브는 행크의 조력자를 비공개 지목',
    isHighlight: true,
    gateNumber: 2
  },
  {
    step: 10,
    title: '행동 단계 (별도 진행)',
    minutes: 5,
    description: '0~3순위 행동 스킬(그레이스 무적 / 클라이브 리볼버·애니 수면제 / 데이비드 압수 / 플로렌스 도주) 발동'
  },
  {
    step: 11,
    title: '최종 투표 단계',
    minutes: 5,
    description: '어니스트(2표)·베니(대리 희생) 전용 스킬 발동 ➔ 최다 득표자 1명 유치장 수감!'
  },
  {
    step: 12,
    title: '행크 추격전 (주사위 결판)',
    minutes: 5,
    description: '클라이브 수감 시 탈옥 판정(4 이상) ➔ 자유인 전원 주사위(1~6) + 전용 아이템 보너스(개당 +1) 최고 눈금 1위 결판'
  },
  {
    step: 13,
    title: '엔딩 낭독 & 점수 정산',
    minutes: 11,
    description: '[암호: 9999] 멀티 엔딩(A~G) 낭독 + 비밀 지목 채점 + 사건 진상 해설 + 우승자 발표',
    isHighlight: true,
    gateNumber: 3
  }
];
