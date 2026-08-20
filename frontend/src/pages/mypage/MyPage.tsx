import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import styled, { keyframes } from 'styled-components';
import ArrowRow from '../../components/ArrowRow';
import { PageWrap } from '../../styles/auth.styles';
import stashQuestionIcon from '../../assets/images/stash_question_icon.svg';
import walletIcon from '../../assets/images/wallet_icon.svg';
import settingIcon from '../../assets/images/setting_icon.svg';
import cuttyLv0 from '../../assets/images/character/cutty_lv0_slime.svg';
import cuttyLv1 from '../../assets/images/character/cutty_lv1_seed.svg';
import cuttyLv2 from '../../assets/images/character/cutty_lv2_box.svg';
import cuttyLv3 from '../../assets/images/character/cutty_lv3_shield.svg';
import cuttyLv4 from '../../assets/images/character/cutty_lv4_wizard.svg';
import cuttyLv5 from '../../assets/images/character/cutty_lv5_knight.svg';
import cuttyLv6 from '../../assets/images/character/cutty_lv6_god.svg';
import { getLevel, getSettings } from '../../api/users';

const CHARACTER_IMAGES: Record<number, string> = {
  0: cuttyLv0,
  1: cuttyLv1,
  2: cuttyLv2,
  3: cuttyLv3,
  4: cuttyLv4,
  5: cuttyLv5,
  6: cuttyLv6,
};

export default function MyPage() {
  const [showHelp, setShowHelp] = useState(false);
  const { data: level } = useQuery({
    queryKey: ['users', 'me', 'level'],
    queryFn: getLevel,
  });
  const { data: settings } = useQuery({
    queryKey: ['users', 'me', 'settings'],
    queryFn: getSettings,
  });

  if (!level || !settings) {
    return (
      <PageWrap>
        <LoadingText>불러오는 중...</LoadingText>
      </PageWrap>
    );
  }

  const characterSrc = CHARACTER_IMAGES[level.level] ?? cuttyLv0;
  const expRatio = Math.min(100, Math.round((level.current_exp / level.next_level_exp) * 100));
  const remainingExp = Math.max(0, level.next_level_exp - level.current_exp);

  return (
    <PageWrap>
      <Header>
        <UserName>{settings.nickname}</UserName>
        <UserCode>{settings.email}</UserCode>
      </Header>
      <Divider />

      <HelpBox>
        <HelpIconButton
          type="button"
          aria-label="도움말"
          onClick={() => setShowHelp((v) => !v)}
        >
          <img src={stashQuestionIcon} alt="" width={20} height={20} />
        </HelpIconButton>
        {showHelp && (
          <HelpBubble>
            건강한 소비 습관으로
            <br />
            나의 지갑 지킴이 소비 정령 <HelpHighlight>커티</HelpHighlight>를 성장시켜보세요!
          </HelpBubble>
        )}
      </HelpBox>

      <LevelSection>
        <LevelHeading>
          Lv.{level.level} {level.level_name}
        </LevelHeading>

        <ExpWrap>
          <ExpBarTrack>
            <ExpBarFill style={{ width: `${expRatio}%` }} />
          </ExpBarTrack>
          <ExpText>
            {level.current_exp} / {level.next_level_exp}
          </ExpText>
          <ExpRemainingText>다음 레벨까지 {remainingExp} EXP</ExpRemainingText>
        </ExpWrap>

        <CharacterBox>
          <CharacterImg src={characterSrc} alt={level.level_name} />
        </CharacterBox>

        <MentBubble>{level.description}</MentBubble>
      </LevelSection>

      <MenuList>
        <ArrowRow to="/budget" icon={walletIcon} label="예산 설정" />
        <ArrowRow to="/mypage/settings" icon={settingIcon} label="환경 설정" />
      </MenuList>
    </PageWrap>
  );
}

const Header = styled.div`
  text-align: center;
`;

const UserName = styled.div`
  font-size: 20px;
  font-weight: 700;
`;

const UserCode = styled.div`
  font-size: 13px;
  color: #888;
  margin-top: 4px;
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid #EDE9F9;
  margin: 16px 0 8px;
`;

const HelpBox = styled.div`
  position: relative;
  margin-left: 4px;
  margin-bottom: 8px;
`;

const HelpIconButton = styled.button`
  width: 30px;
  height: 30px;
  border: none;
  background: none;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  cursor: pointer;
`;

const HelpBubble = styled.div`
  position: absolute;
  top: 0;
  left: 38px;
  right: 0;
  z-index: 10;
  background: #ffffff;
  border-left: 3px solid #6a5ce6;
  border-radius: 10px;
  padding: 14px 16px;
  font-size: 13px;
  line-height: 1.6;
  color: #333;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
`;

const HelpHighlight = styled.span`
  color: #6a5ce6;
  font-weight: 700;
`;

const LevelSection = styled.div`
  text-align: center;
  margin-bottom: 24px;
  background: #f8f6fe;
  border-radius: 20px;
  padding: 24px 16px;
`;

const LevelHeading = styled.div`
  color: #6a5ce6;
  font-size: 20px;
  font-weight: 800;
  margin-bottom: 12px;
`;

const ExpWrap = styled.div`
  width: 100%;
  max-width: 240px;
  margin: 0 auto 16px;
`;

const ExpBarTrack = styled.div`
  width: 100%;
  height: 8px;
  border-radius: 999px;
  background: #ffffff;
  overflow: hidden;
`;

const ExpBarFill = styled.div`
  height: 100%;
  border-radius: 999px;
  background: #6a5ce6;
`;

const ExpText = styled.div`
  margin-top: 6px;
  font-size: 12px;
  color: #888;
`;

const ExpRemainingText = styled.div`
  margin-top: 4px;
  font-size: 12px;
  font-weight: 700;
  color: #6a5ce6;
`;

const CharacterBox = styled.div`
  width: 100%;
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
`;

const CharacterImg = styled.img`
  max-width: 180px;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  animation: ${float} 2.4s ease-in-out infinite;
`;

const MentBubble = styled.div`
  position: relative;
  display: inline-block;
  max-width: 320px;
  background: #ffffff;
  color: #444;
  font-size: 13px;
  line-height: 1.5;
  padding: 12px 18px;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  &::before {
    content: '';
    position: absolute;
    top: -6px;
    left: 50%;
    transform: translateX(-50%);
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-bottom: 6px solid #ffffff;
  }
`;

const MenuList = styled.div`
  background: #fff;
  border-radius: 16px;
  padding: 4px 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);

  > *:not(:last-child) {
    border-bottom: 1px solid #eee;
  }
`;

const LoadingText = styled.p`
  text-align: center;
  color: #999;
  font-size: 13px;
  padding: 60px 0;
`;