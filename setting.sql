create table articles (
    id bigint generated always as identity primary key,
    article_title text not null,
    article_content text not null,
    article_hash_tag jsonb not null default '[]'::jsonb,
    created_at timestamptz default now()
);

create table comments (
    id bigint generated always as identity primary key,
    article_id bigint not null references articles(id) on delete cascade,
    user_name text not null,
    user_id text not null,
    content text not null,
    likes integer not null default 0,
    created_at timestamptz default now()
);

create table gemini_cache (
    id bigint generated always as identity primary key,
    image_hash text unique not null,
    result jsonb not null,
    created_at timestamptz default now()
);
