export const formatIncomeLevel = (range: string) => {
  const [min, max] = range.split('-');
  if (!min || !max) return range;
  return `${min}만원 - ${max}만원`;
};