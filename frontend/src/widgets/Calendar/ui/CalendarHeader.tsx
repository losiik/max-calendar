import { Button, Flex, Typography } from "@maxhub/max-ui";

type CalendarHeaderProps = {
  monthLabel: string;
  yearLabel: string;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
};

export function CalendarHeader({
  monthLabel,
  yearLabel,
  onPrev,
  onNext,
  onToday,
}: CalendarHeaderProps) {
  return (
    <Flex
      className="mb-4 items-center !justify-between gap-2"
      align="center"
    >
      <div>
        <Typography.Title variant="large-strong" className="capitalize">
          {monthLabel}
        </Typography.Title> {' '}
        <Typography.Title className="text-neutral-500">
          {yearLabel}
        </Typography.Title>
      </div>

      <Flex gap={6} className="!justify-between">
        <Button mode="secondary" appearance="neutral-themed" onClick={onPrev}>
          {'<'}
        </Button>
        <Button mode="secondary" appearance="neutral-themed" onClick={onNext}>
          {'>'}
        </Button>
        <Button mode="primary" appearance="neutral-themed" onClick={onToday}>
          Сегодня
        </Button>
      </Flex>
    </Flex>
  );
}
