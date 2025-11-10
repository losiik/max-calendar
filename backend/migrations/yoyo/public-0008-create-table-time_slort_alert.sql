CREATE TABLE IF NOT EXISTS public.time_slot_alert (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    time_slot_id UUID NOT NULL,
    sent_at TIMESTAMP NOT NULL,
    CONSTRAINT time_slot_alert_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES public."user"(id) ON DELETE CASCADE,
    CONSTRAINT time_slot_alert_time_slot_id_fkey FOREIGN KEY (time_slot_id)
        REFERENCES public.time_slots(id) ON DELETE CASCADE,
    CONSTRAINT time_slot_alert_unique UNIQUE (user_id, time_slot_id)
);