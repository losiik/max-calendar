import { Button, Panel, Typography } from "@maxhub/max-ui";
import { createPortal } from "react-dom";

import {
  useOnboardingStore,
  markLocalOnboardingComplete,
} from "../model/onboarding.store";
import { useOnboardingMutation } from "../lib/useOnboardingMutation";

export function OnboardingOverlay() {
  const isVisible = useOnboardingStore((s) => s.isVisible);
  const slide = useOnboardingStore((s) => s.slides[s.currentSlide]);
  const total = useOnboardingStore((s) => s.slides.length);
  const index = useOnboardingStore((s) => s.currentSlide);
  const advance = useOnboardingStore((s) => s.advance);
  const skip = useOnboardingStore((s) => s.skip);
  const mutation = useOnboardingMutation();

  if (!isVisible || !slide) return null;

  const portalNode =
    typeof document !== "undefined"
      ? document.getElementById("portal-root")
      : null;
  if (!portalNode) return null;

  const isLast = index === total - 1;
  const completeRemote = () => {
    markLocalOnboardingComplete();
    mutation.mutate();
  };

  const handleNext = () => {
    const finished = advance();
    if (finished) {
      completeRemote();
    }
  };

  const handleSkip = () => {
    skip();
    completeRemote();
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur">
      <Panel className=" flex w-full max-w-xl flex-col items-center gap-6 justify-center bg-neutral-900/90 px-6 py-8 text-center text-neutral-50">
        <Typography.Title variant="large-strong">
          {slide.title}
        </Typography.Title>
        <Typography.Body className="text-neutral-200">
          {slide.description}
        </Typography.Body>

        <div className="flex gap-2">
          {Array.from({ length: total }).map((_, idx) => (
            <span
              key={idx}
              className={`h-2 w-2 rounded-full ${
                idx === index ? "bg-neutral-50" : "bg-neutral-600"
              }`}
            />
          ))}
        </div>

        <div className="flex w-full flex-col gap-3">
          {slide.image_url && (
            <img
              src={slide.image_url}
              alt={slide.title}
              className="w-full rounded-lg"
            />
          )}
        </div>

        <div className="flex w-full flex-col gap-3">
          <Button
            mode="primary"
            appearance="themed"
            onClick={handleNext}
            data-haptic={isLast ? "success" : "light"}
          >
            {isLast ? "Начать пользоваться" : "Далее"}
          </Button>
          {!isLast && (
            <Button
              mode="tertiary"
              appearance="themed"
              onClick={handleSkip}
              data-haptic="light"
            >
              Пропустить
            </Button>
          )}
        </div>
      </Panel>
    </div>,
    portalNode
  );
}
