CREATE TABLE IF NOT EXISTS public.settings (
    id UUID NOT NULL,
    user_id UUID NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    timezone INTEGER NOT NULL DEFAULT 0,
    work_time_start DOUBLE PRECISION NOT NULL,
    work_time_end DOUBLE PRECISION NOT NULL,
    alert_offset_minutes INTEGER NOT NULL,
    daily_reminder_time TIMESTAMP NOT NULL,
    working_days INTEGER NOT NULL DEFAULT 31,
    CONSTRAINT settings_pkey PRIMARY KEY (id),
    CONSTRAINT settings_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES public."user"(id) ON DELETE CASCADE
);

-- Индекс для быстрого поиска настроек по user_id
CREATE INDEX IF NOT EXISTS idx_settings_user_id ON public.settings(user_id);