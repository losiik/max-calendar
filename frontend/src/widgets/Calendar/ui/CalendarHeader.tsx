import { Button, Flex, Typography } from "@maxhub/max-ui";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

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
      <Flex align="center" gap={12}>
        <Button mode="secondary" appearance="neutral-themed" onClick={onPrev}>
          {<FaArrowLeft />}
        </Button>
        <Typography.Title variant="large-strong" className="capitalize">
          {monthLabel}
        </Typography.Title> {' '}
        <Typography.Title className="text-neutral-500">
          {yearLabel}
        </Typography.Title>
        <Button mode="secondary" appearance="neutral-themed" onClick={onNext}>
          {<FaArrowRight />}
        </Button>
      </Flex>

      <Flex gap={6} className="!justify-between">
        
        
        <Button mode="primary" appearance="neutral-themed" onClick={onToday}>
          Сегодня
        </Button>
      </Flex>
    </Flex>
  );
}
