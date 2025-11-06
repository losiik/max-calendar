CREATE TABLE IF NOT EXISTS public.time_slots (
    id UUID NOT NULL,
    owner_id UUID NOT NULL,
    invited_id UUID NOT NULL,
    meet_start_at TIMESTAMP NULL,
    meet_end_at TIMESTAMP NULL,
    confirm BOOLEAN NOT NULL DEFAULT FALSE,
    title VARCHAR NOT NULL,
    description VARCHAR NULL,
    meeting_url VARCHAR NULL,
    CONSTRAINT time_slots_pkey PRIMARY KEY (id),
    CONSTRAINT time_slots_owner_id_fkey FOREIGN KEY (owner_id)
        REFERENCES public."user"(id) ON DELETE CASCADE,
    CONSTRAINT time_slots_invited_id_fkey FOREIGN KEY (invited_id)
        REFERENCES public."user"(id) ON DELETE CASCADE
);


CREATE INDEX IF NOT EXISTS idx_time_slots_owner_id ON public.time_slots(owner_id);
CREATE INDEX IF NOT EXISTS idx_time_slots_invited_id ON public.time_slots(invited_id);
CREATE INDEX IF NOT EXISTS idx_time_slots_meet_start_at ON public.time_slots(meet_start_at);
CREATE INDEX IF NOT EXISTS idx_time_slots_confirm ON public.time_slots(confirm);


CREATE INDEX IF NOT EXISTS idx_time_slots_owner_dates ON public.time_slots(owner_id, meet_start_at, meet_end_at);
CREATE INDEX IF NOT EXISTS idx_time_slots_invited_dates ON public.time_slots(invited_id, meet_start_at, meet_end_at);