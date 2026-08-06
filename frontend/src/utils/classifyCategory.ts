import { CATEGORY_OPTIONS } from './category';

// TODO: 백엔드 LLM 분류 API(POST /llm/classify) 연동 전까지 가맹점명 키워드 매칭으로 임시 분류
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  '식비': [
    '커피', '카페', '스타벅스', '컴포즈', '메가커피', '이디야', '투썸', '빽다방',
    '마라탕', '김밥', '식당', '베이크', '버거', '치킨', '피자', '떡볶이', '분식', '국밥',
  ],
  '고정지출': ['통신', 'SKT', 'KT', 'LG유플러스', '관리비', '보험', '월세', '구독', '넷플릭스'],
  '교통': ['택시', '지하철', '버스', '티머니', '카카오T', '주유', 'SRT', 'KTX'],
  '생활': ['다이소', '올리브영', '마트', '편의점', 'GS25', 'CU', '세븐일레븐', '이마트'],
  '쇼핑/패션': ['무신사', '지그재그', '유니클로', '자라', '백화점', '쇼핑몰', '에이블리'],
  '자기계발': ['스터디카페', '학원', '인강', '서점', '교보문고', '클래스'],
  '문화/여가': ['CGV', '메가박스', '롯데시네마', '영화', '전시', '콘서트', '노래방'],
};

export function classifyCategory(merchant: string): string {
  const normalized = merchant.replace(/\s/g, '');
  for (const category of CATEGORY_OPTIONS) {
    const keywords = CATEGORY_KEYWORDS[category] ?? [];
    if (keywords.some((keyword) => normalized.includes(keyword))) {
      return category;
    }
  }
  return '모임/기타';
}
