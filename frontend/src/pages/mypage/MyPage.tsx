import { useState } from 'react';
import styled from 'styled-components';
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

const CHARACTER_IMAGES: Record<number, string> = {
  0: cuttyLv0,
  1: cuttyLv1,
  2: cuttyLv2,
  3: cuttyLv3,
  4: cuttyLv4,
  5: cuttyLv5,
  6: cuttyLv6,
};

// TODO: 실제 프로필 API로 교체 (이름/회원코드)
const DUMMY_USER = {
  name: '박영호',
  memberCode: 'PYH1234',
};

// GET /users/me/level 더미데이터
const DUMMY_LEVEL = {
  level: 3,
  level_name: '몬스터 커티',
  current_exp: 420,
  next_level_exp: 600,
  description: '지갑의 뼈대가 잡히고 있어요! 기본적인 소비 관리가 아주 잘 되고 있네요',
};

export default function MyPage() {
  const [showHelp, setShowHelp] = useState(false);
  const characterSrc = CHARACTER_IMAGES[DUMMY_LEVEL.level] ?? cuttyLv0;
  const expRatio = Math.min(
    100,
    Math.round((DUMMY_LEVEL.current_exp / DUMMY_LEVEL.next_level_exp) * 100),
  );

  return (
    <PageWrap>
      <Header>
        <UserName>{DUMMY_USER.name}</UserName>
        <UserCode>{DUMMY_USER.memberCode}</UserCode>
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
          Lv.{DUMMY_LEVEL.level} {DUMMY_LEVEL.level_name}
        </LevelHeading>

        <ExpWrap>
          <ExpBarTrack>
            <ExpBarFill style={{ width: `${expRatio}%` }} />
          </ExpBarTrack>
          <ExpText>
            {DUMMY_LEVEL.current_exp} / {DUMMY_LEVEL.next_level_exp}
          </ExpText>
        </ExpWrap>

        <CharacterBox>
          <CharacterImg src={characterSrc} alt={DUMMY_LEVEL.level_name} />
        </CharacterBox>

        <MentBubble>{DUMMY_LEVEL.description}</MentBubble>
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
  border-top: 1px solid #6a5ce6;
  margin: 16px 0 24px;
`;

const HelpBox = styled.div`
  position: relative;
  margin-left: 4px;
  margin-bottom: 12px;
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
  background: #f4f2fc;
  border-radius: 14px;
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
  margin-bottom: 36px;
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
  background: #ececec;
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

const CharacterBox = styled.div`
  width: 100%;
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
`;

const CharacterImg = styled.img`
  max-width: 180px;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
`;

const MentBubble = styled.div`
  position: relative;
  display: inline-block;
  max-width: 320px;
  background: #efeafc;
  color: #444;
  font-size: 13px;
  line-height: 1.5;
  padding: 12px 18px;
  border-radius: 16px;

  &::before {
    content: '';
    position: absolute;
    top: -6px;
    left: 50%;
    transform: translateX(-50%);
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-bottom: 6px solid #efeafc;
  }
`;

const MenuList = styled.div`
  > *:not(:last-child) {
    border-bottom: 1px solid #eee;
  }
`;