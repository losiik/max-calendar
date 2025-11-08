CREATE TABLE IF NOT EXISTS public.share (
    id UUID NOT NULL,
    owner_id UUID NOT NULL,
    share_token VARCHAR NOT NULL,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT share_pkey PRIMARY KEY (id),
    CONSTRAINT share_share_token_key UNIQUE (share_token),
    CONSTRAINT share_owner_id_fkey FOREIGN KEY (owner_id)
        REFERENCES public."user"(id) ON DELETE CASCADE
);

-- Индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_share_owner_id ON public.share(owner_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_share_token ON public.share(share_token);