import wallet1 from '../assets/images/wallets/wallet_1_cold.svg';
import wallet2 from '../assets/images/wallets/wallet_2_cool.svg';
import wallet3 from '../assets/images/wallets/wallet_3_warm.svg';
import wallet4 from '../assets/images/wallets/wallet_4_hot.svg';
import wallet5 from '../assets/images/wallets/wallet_5_burning.svg';
import wallet6 from '../assets/images/wallets/wallet_6_overheat.svg';

export const WALLET_LEVELS = ['매우 안정', '안정', '보통', '임계', '초과', '과열'];
export const WALLET_IMAGES = [wallet1, wallet2, wallet3, wallet4, wallet5, wallet6];
export const WALLET_STATUS_TEXT = ['꽁꽁 언 지갑', '시원한 지갑', '미지근 지갑', '후끈한 지갑', '불타는 지갑', '폭주한 지갑'];
export const WALLET_GAUGE_COLORS = ['#B8D4F8', '#6A5CE6', '#9589F0', '#FFB347', '#FF7D7D', '#FF4040'];
export const WALLET_BADGE_COLORS = [
  { bg: '#E6F0FD', text: '#222' }, // 매우 안정
  { bg: '#E5E1FB', text: '#222' }, // 안정
  { bg: '#EAE6FC', text: '#222' }, // 보통
  { bg: '#FFEDD5', text: '#222' }, // 임계
  { bg: '#FFE0E0', text: '#222' }, // 초과
  { bg: '#FFD6D6', text: '#222' }, // 과열
];

export function getWalletLevelIndex(level: string) {
  return Math.max(0, WALLET_LEVELS.indexOf(level));
}
