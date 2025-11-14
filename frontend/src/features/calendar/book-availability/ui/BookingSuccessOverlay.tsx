import { Button, Panel, Typography } from "@maxhub/max-ui";
import { MdCheckCircle } from "react-icons/md";

import { Overlay } from "@/shared/ui/Overlay";
import { useBookSlotStore } from "../model/book-slot.store";

export function BookingSuccessOverlay() {
  const isOpen = useBookSlotStore((state) => state.isSuccessOverlayOpen);
  const close = useBookSlotStore((state) => state.closeSuccessOverlay);

  if (!isOpen) return null;

  return (
    <Overlay open={isOpen} onClose={close}>
      <Panel className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6 text-center shadow-neutral-900/20 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mb-3 flex justify-center text-4xl text-emerald-500">
          <MdCheckCircle aria-hidden />
        </div>
        <Typography.Title variant="medium-strong" className="mb-2">
          Слот забронирован
        </Typography.Title>
        <Typography.Body className="mb-5 text-base text-neutral-500 dark:text-neutral-300">
          Слот забронирован! Владелец календаря ещё подтвердит встречу. Как
          только он согласится, время исчезнет из расписания.
        </Typography.Body>
        <Button
          mode="primary"
          appearance="themed"
          stretched
          onClick={close}
        >
          Понятно
        </Button>
      </Panel>
    </Overlay>
  );
}
