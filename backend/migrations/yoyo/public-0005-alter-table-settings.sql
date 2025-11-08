ALTER TABLE public.settings
    ALTER COLUMN created_at DROP NOT NULL,
    ALTER COLUMN created_at SET DEFAULT now(),
    ALTER COLUMN updated_at DROP NOT NULL,
    ALTER COLUMN updated_at SET DEFAULT now(),
    ALTER COLUMN timezone DROP NOT NULL,
    ALTER COLUMN work_time_start DROP NOT NULL,
    ALTER COLUMN work_time_end DROP NOT NULL,
    ALTER COLUMN working_days DROP NOT NULL;