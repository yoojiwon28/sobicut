import { useState } from 'react';
import styled from 'styled-components';

// 태그 식별자는 백엔드 emotion_tags 의 한글 name 문자열을 그대로 쓴다.
// TODO: GET /emotions 의 type 필드로 계획성/소비특성 그룹을 구분하게 되면 아래 두 배열은 제거한다.
export const PLAN_TAG_NAMES: string[] = ['즉흥성', '충분한숙고'];
export const CONTEXT_TAG_NAMES: string[] = ['스트레스', '비교회피', '장기적가치'];

export const TAG_LABEL: Record<string, string> = {
  즉흥성: '바로 샀어요',
  충분한숙고: '고민하고 샀어요',
  스트레스: '스트레스 받아서',
  비교회피: '비교 안 하고',
  장기적가치: '오래 쓸 소비',
};

const CUSTOM_TAG_MAX_LENGTH = 15;

type TagQuestionsProps = {
  title: string;
  planTag: string | null;
  contextTags: string[];
  customTags: string[];
  planOptionCopy: Record<string, string>;
  onChangePlanTag: (name: string) => void;
  onToggleContextTag: (name: string) => void;
  onChangeCustomTags: (tags: string[]) => void;
};

export default function TagQuestions({
  title,
  planTag,
  contextTags,
  customTags,
  planOptionCopy,
  onChangePlanTag,
  onToggleContextTag,
  onChangeCustomTags,
}: TagQuestionsProps) {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customTagDraft, setCustomTagDraft] = useState('');

  const addCustomTag = () => {
    const value = customTagDraft.trim();
    if (!value || customTags.includes(value)) {
      setCustomTagDraft('');
      return;
    }
    onChangeCustomTags([...customTags, value]);
    setCustomTagDraft('');
  };

  const removeCustomTag = (tag: string) => {
    onChangeCustomTags(customTags.filter((t) => t !== tag));
  };

  return (
    <>
      <TagTitle>{title}</TagTitle>

      <QuestionLabel>이 소비 미리 계획했나요?</QuestionLabel>
      <PlanGrid>
        {PLAN_TAG_NAMES.map((name) => (
          <PlanOption
            key={name}
            type="button"
            $active={planTag === name}
            onClick={() => onChangePlanTag(name)}
          >
            {planOptionCopy[name]}
          </PlanOption>
        ))}
      </PlanGrid>

      <QuestionDivider>
        <QuestionLabelRow>
          <QuestionLabelText>이 소비는…</QuestionLabelText>
          <MultiSelectHint>복수 선택</MultiSelectHint>
        </QuestionLabelRow>
        <ContextChipList>
          {CONTEXT_TAG_NAMES.map((name) => {
            const active = contextTags.includes(name);
            return (
              <ContextChip
                key={name}
                type="button"
                $active={active}
                onClick={() => onToggleContextTag(name)}
              >
                {active && (
                  <CheckIcon viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M2.5 6.5L5 9L9.5 3.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </CheckIcon>
                )}
                {TAG_LABEL[name]}
              </ContextChip>
            );
          })}

          {customTags.map((tag) => (
            <ContextChip
              key={tag}
              type="button"
              $active
              onClick={() => removeCustomTag(tag)}
              aria-label={`${tag} 태그 삭제`}
            >
              {tag}
              <CustomTagRemoveMark>×</CustomTagRemoveMark>
            </ContextChip>
          ))}

          <AddCustomTagButton
            type="button"
            $active={showCustomInput}
            onClick={() => setShowCustomInput((v) => !v)}
            aria-label="나만의 태그 추가"
          >
            +
          </AddCustomTagButton>
        </ContextChipList>

        {showCustomInput && (
          <CustomTagBox>
            <QuestionLabelRow>
              <QuestionLabelText>나만의 태그</QuestionLabelText>
              <MultiSelectHint>기록용 태그를 추가할 수 있어요</MultiSelectHint>
            </QuestionLabelRow>
            <CustomTagInputRow>
              <CustomTagInput
                autoFocus
                value={customTagDraft}
                onChange={(e) => setCustomTagDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomTag();
                  }
                }}
                placeholder="나만의 태그를 입력해주세요"
                maxLength={CUSTOM_TAG_MAX_LENGTH}
              />
              <CustomTagConfirmButton
                type="button"
                onClick={addCustomTag}
                disabled={!customTagDraft.trim()}
              >
                추가
              </CustomTagConfirmButton>
            </CustomTagInputRow>
          </CustomTagBox>
        )}
      </QuestionDivider>
    </>
  );
}

const TagTitle = styled.h2`
  font-size: 15px;
  font-weight: 500;
  text-align: center;
  margin: 0 0 16px;
`;

const QuestionLabel = styled.div`
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 8px;
`;

const QuestionLabelRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const QuestionLabelText = styled.span`
  font-size: 13px;
  font-weight: 500;
`;

const MultiSelectHint = styled.span`
  font-size: 11px;
  font-weight: 400;
  color: #a0a0a0;
`;

const QuestionDivider = styled.div`
  border-top: 1px solid #f0f0f0;
  padding-top: 14px;
  margin-top: 16px;
`;

const PlanGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
`;

const PlanOption = styled.button<{ $active: boolean }>`
  padding: 10px 8px;
  border-radius: 8px;
  font-size: 12px;
  text-align: center;
  line-height: 1.4;
  white-space: pre-line;
  cursor: pointer;
  border: ${({ $active }) => ($active ? '1.5px solid #6A5CE6' : '1px solid #E5E5E5')};
  background: ${({ $active }) => ($active ? '#E2DEFF' : '#FFFFFF')};
  color: ${({ $active }) => ($active ? '#3C3489' : '#767676')};
  font-weight: ${({ $active }) => ($active ? 500 : 400)};
`;

const ContextChipList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const ContextChip = styled.button<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  padding: 7px 12px;
  border-radius: 999px;
  font-size: 12px;
  cursor: pointer;
  border: ${({ $active }) => ($active ? '1.5px solid #6A5CE6' : '1px solid #E5E5E5')};
  background: ${({ $active }) => ($active ? '#E2DEFF' : '#FFFFFF')};
  color: ${({ $active }) => ($active ? '#3C3489' : '#767676')};
  font-weight: ${({ $active }) => ($active ? 500 : 400)};
`;

const CheckIcon = styled.svg`
  width: 12px;
  height: 12px;
  margin-right: 3px;
`;

const CustomTagRemoveMark = styled.span`
  margin-left: 4px;
  font-size: 13px;
  line-height: 1;
`;

const AddCustomTagButton = styled.button<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  padding: 7px 0;
  border-radius: 999px;
  font-size: 13px;
  line-height: 1;
  cursor: pointer;
  border: 1px dashed ${({ $active }) => ($active ? '#6A5CE6' : '#C7C1F5')};
  background: ${({ $active }) => ($active ? '#E2DEFF' : '#FFFFFF')};
  color: #6a5ce6;
`;

const CustomTagBox = styled.div`
  margin-top: 10px;
`;

const CustomTagInputRow = styled.div`
  display: flex;
  gap: 6px;
`;

const CustomTagInput = styled.input`
  flex: 1;
  min-width: 0;
  height: 38px;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  padding: 0 12px;
  font-size: 13px;
  font-family: inherit;
  box-sizing: border-box;
  outline: none;

  &:focus {
    border-color: #6a5ce6;
  }
`;

const CustomTagConfirmButton = styled.button`
  flex-shrink: 0;
  padding: 0 14px;
  height: 38px;
  border: none;
  border-radius: 8px;
  background: #6a5ce6;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;

  &:disabled {
    background: #e0e0e0;
    color: #999;
    cursor: not-allowed;
  }
`;