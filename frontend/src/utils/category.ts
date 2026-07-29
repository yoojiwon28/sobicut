import foodIcon from '../assets/images/category/food.svg';
import fixedExpenseIcon from '../assets/images/category/fixed-expense.svg';
import transportIcon from '../assets/images/category/transport.svg';
import dailyLifeIcon from '../assets/images/category/daily-life.svg';
import shoppingIcon from '../assets/images/category/shopping.svg';
import selfDevelopmentIcon from '../assets/images/category/self-development.svg';
import cultureLeisureIcon from '../assets/images/category/culture-leisure.svg';
import meetingEtcIcon from '../assets/images/category/meeting-etc.svg';

export const CATEGORY_ICONS: Record<string, string> = {
  '식비': foodIcon,
  '고정지출': fixedExpenseIcon,
  '교통': transportIcon,
  '생활': dailyLifeIcon,
  '쇼핑/패션': shoppingIcon,
  '자기계발': selfDevelopmentIcon,
  '문화/여가': cultureLeisureIcon,
  '모임/기타': meetingEtcIcon,
};

export const CATEGORY_OPTIONS = Object.keys(CATEGORY_ICONS);