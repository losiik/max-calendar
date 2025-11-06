CREATE TABLE IF NOT EXISTS public."user" (
    id UUID NOT NULL,
    max_id BIGINT NOT NULL,
    name VARCHAR NULL,
    username VARCHAR NULL,
    created_at TIMESTAMP NULL,
    CONSTRAINT user_pkey PRIMARY KEY (id),
    CONSTRAINT user_max_id_key UNIQUE (max_id)
);