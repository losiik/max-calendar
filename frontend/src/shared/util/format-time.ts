export const formatTime = (mins: number) => {
  if (mins === 0) return 'Не уведомлять';
  if (mins < 60) return `${mins} мин`;
  const h = Math.floor(mins / 60);
  const r = mins % 60;
  return r === 0 ? `${h} ч` : `${h} ч ${r} мин`;
};
