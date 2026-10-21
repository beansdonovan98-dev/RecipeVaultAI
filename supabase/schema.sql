-- Recipe Vault AI shared-room backend.
-- Run this in the Supabase SQL editor. It is safe to rerun after app updates.
-- Then create the public storage bucket named "recipe-photos" if the storage
-- statements below are denied.
--
-- The anon key is safe to ship in the app as long as all table access goes
-- through the security-definer functions below. The room code is the shared
-- secret between the two phones.
--
-- Photo files are stored in a public bucket so the app can display them with
-- plain URLs. Public buckets serve object URLs without a SELECT policy, but
-- uploads still need SELECT to return the stored object metadata. The policy
-- below allows every storage operation except object listing, so the anon key
-- cannot enumerate every photo. Do not replace it with a broad SELECT policy.
-- Uploads are allowed for the anon role because this app has no user accounts;
-- room and recipe IDs in the object path are unguessable but are not an
-- authentication boundary.

create extension if not exists pgcrypto;

create table if not exists public.rvai_rooms (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.rvai_recipes (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rvai_rooms(id) on delete cascade,
  title text not null,
  description text not null default '',
  category text not null,
  tags jsonb not null default '[]'::jsonb,
  prep_time integer not null default 0,
  cook_time integer not null default 0,
  servings integer not null default 1,
  ingredients jsonb not null default '[]'::jsonb,
  instructions jsonb not null default '[]'::jsonb,
  image_url text,
  is_favorite boolean not null default false,
  author text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.rvai_recipes add column if not exists author text not null default '';
alter table public.rvai_recipes add column if not exists tags jsonb not null default '[]'::jsonb;

create index if not exists rvai_recipes_room_id_idx on public.rvai_recipes(room_id);

create table if not exists public.rvai_presence (
  room_id uuid not null references public.rvai_rooms(id) on delete cascade,
  member text not null,
  last_seen timestamptz not null default now(),
  primary key (room_id, member)
);

create table if not exists public.rvai_room_settings (
  room_id uuid not null references public.rvai_rooms(id) on delete cascade,
  key text not null,
  value text not null,
  updated_at timestamptz not null default now(),
  primary key (room_id, key)
);

alter table public.rvai_rooms enable row level security;
alter table public.rvai_recipes enable row level security;
alter table public.rvai_presence enable row level security;
alter table public.rvai_room_settings enable row level security;

revoke all on public.rvai_rooms from anon, authenticated;
revoke all on public.rvai_recipes from anon, authenticated;
revoke all on public.rvai_presence from anon, authenticated;
revoke all on public.rvai_room_settings from anon, authenticated;

create or replace function public.rvai_create_room(p_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text := upper(regexp_replace(trim(p_code), '[^A-Za-z0-9]', '', 'g'));
  v_id uuid;
begin
  if v_code is null or length(v_code) < 6 then
    raise exception 'Room code must be at least 6 characters';
  end if;
  if length(v_code) > 20 then
    raise exception 'Room code must be 20 characters or fewer';
  end if;

  insert into public.rvai_rooms (code)
  values (v_code)
  on conflict (code) do nothing;

  select id into v_id from public.rvai_rooms where code = v_code;
  return v_id;
end;
$$;

create or replace function public.rvai_list_recipes(p_code text)
returns setof public.rvai_recipes
language plpgsql
security definer
set search_path = public
as $$
declare
  v_room_id uuid;
begin
  select id into v_room_id
  from public.rvai_rooms
  where code = upper(regexp_replace(trim(p_code), '[^A-Za-z0-9]', '', 'g'));

  if v_room_id is null then
    raise exception 'Room not found';
  end if;

  return query
    select r.*
    from public.rvai_recipes r
    where r.room_id = v_room_id
    order by r.created_at desc;
end;
$$;

create or replace function public.rvai_upsert_recipe(p_code text, p_recipe jsonb)
returns public.rvai_recipes
language plpgsql
security definer
set search_path = public
as $$
declare
  v_room_id uuid;
  v_id uuid;
  v_recipe public.rvai_recipes;
begin
  select id into v_room_id
  from public.rvai_rooms
  where code = upper(regexp_replace(trim(p_code), '[^A-Za-z0-9]', '', 'g'));

  if v_room_id is null then
    raise exception 'Room not found';
  end if;

  v_id := nullif(p_recipe->>'id', '')::uuid;
  if v_id is null then
    v_id := gen_random_uuid();
  end if;

  if exists (
    select 1
    from public.rvai_recipes
    where id = v_id and room_id <> v_room_id
  ) then
    raise exception 'Recipe belongs to another room';
  end if;

  insert into public.rvai_recipes (
    id, room_id, title, description, category, tags, prep_time, cook_time, servings,
    ingredients, instructions, image_url, is_favorite, author, updated_at
  ) values (
    v_id,
    v_room_id,
    coalesce(nullif(trim(p_recipe->>'title'), ''), 'Untitled'),
    coalesce(p_recipe->>'description', ''),
    coalesce(nullif(trim(p_recipe->>'category'), ''), 'Dinner'),
    coalesce(p_recipe->'tags', '[]'::jsonb),
    coalesce((p_recipe->>'prepTime')::integer, 0),
    coalesce((p_recipe->>'cookTime')::integer, 0),
    coalesce((p_recipe->>'servings')::integer, 1),
    coalesce(p_recipe->'ingredients', '[]'::jsonb),
    coalesce(p_recipe->'instructions', '[]'::jsonb),
    nullif(p_recipe->>'imageUrl', ''),
    coalesce((p_recipe->>'isFavorite')::boolean, false),
    coalesce(nullif(trim(p_recipe->>'author'), ''), ''),
    now()
  )
  on conflict (id) do update set
    title = excluded.title,
    description = excluded.description,
    category = excluded.category,
    tags = excluded.tags,
    prep_time = excluded.prep_time,
    cook_time = excluded.cook_time,
    servings = excluded.servings,
    ingredients = excluded.ingredients,
    instructions = excluded.instructions,
    image_url = excluded.image_url,
    is_favorite = excluded.is_favorite,
    author = case when rvai_recipes.author = '' then excluded.author else rvai_recipes.author end,
    updated_at = now()
  returning * into v_recipe;

  return v_recipe;
end;
$$;

create or replace function public.rvai_delete_recipe(p_code text, p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_room_id uuid;
begin
  select id into v_room_id
  from public.rvai_rooms
  where code = upper(regexp_replace(trim(p_code), '[^A-Za-z0-9]', '', 'g'));

  if v_room_id is null then
    raise exception 'Room not found';
  end if;

  delete from public.rvai_recipes
  where id = p_id and room_id = v_room_id;
end;
$$;

create or replace function public.rvai_refresh_presence(p_code text, p_member text)
returns text[]
language plpgsql
security definer
set search_path = public
as $$
declare
  v_room_id uuid;
  v_member text := lower(trim(p_member));
  v_members text[];
begin
  if v_member not in ('daddy', 'princess') then
    raise exception 'Unknown member';
  end if;

  select id into v_room_id
  from public.rvai_rooms
  where code = upper(regexp_replace(trim(p_code), '[^A-Za-z0-9]', '', 'g'));

  if v_room_id is null then
    raise exception 'Room not found';
  end if;

  insert into public.rvai_presence (room_id, member, last_seen)
  values (v_room_id, v_member, now())
  on conflict (room_id, member) do update set last_seen = now();

  delete from public.rvai_presence
  where room_id = v_room_id and last_seen < now() - interval '1 day';

  select coalesce(array_agg(member), '{}'::text[])
  into v_members
  from public.rvai_presence
  where room_id = v_room_id
    and member <> v_member
    and last_seen > now() - interval '90 seconds';

  return v_members;
end;
$$;

create or replace function public.rvai_set_room_setting(p_code text, p_key text, p_value text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_room_id uuid;
  v_key text := lower(trim(p_key));
  v_value text := trim(p_value);
begin
  if v_key not in (
    'app_font_key',
    'app_font_color',
    'app_theme_key',
    'app_assistant_name',
    'app_assistant_persona',
    'app_assistant_background'
  ) then
    raise exception 'Unknown setting';
  end if;

  if v_key = 'app_font_key' and v_value not in ('system', 'serif', 'rounded', 'mono', 'elegant') then
    raise exception 'Invalid font key';
  end if;

  if v_key = 'app_font_color' and v_value !~ '^#[0-9A-Fa-f]{6}$' then
    raise exception 'Invalid font color';
  end if;

  if v_key = 'app_theme_key' and v_value not in ('taverna', 'riso', 'diner', 'midnight', 'seaglass', 'butter') then
    raise exception 'Invalid theme key';
  end if;

  if v_key = 'app_assistant_name' and (char_length(v_value) < 1 or char_length(v_value) > 24) then
    raise exception 'Invalid assistant name';
  end if;

  if v_key = 'app_assistant_persona' and v_value not in ('bmo', 'sous-chef', 'nana') then
    raise exception 'Invalid assistant persona';
  end if;

  if v_key = 'app_assistant_background'
     and v_value <> ''
     and v_value !~ '^https://[^[:space:]]{1,400}$' then
    raise exception 'Invalid assistant background';
  end if;

  select id into v_room_id
  from public.rvai_rooms
  where code = upper(regexp_replace(trim(p_code), '[^A-Za-z0-9]', '', 'g'));

  if v_room_id is null then
    raise exception 'Room not found';
  end if;

  insert into public.rvai_room_settings (room_id, key, value, updated_at)
  values (v_room_id, v_key, v_value, now())
  on conflict (room_id, key) do update set value = excluded.value, updated_at = now();
end;
$$;

create or replace function public.rvai_get_room_settings(p_code text)
returns table(key text, value text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_room_id uuid;
begin
  select id into v_room_id
  from public.rvai_rooms
  where code = upper(regexp_replace(trim(p_code), '[^A-Za-z0-9]', '', 'g'));

  if v_room_id is null then
    raise exception 'Room not found';
  end if;

  return query
    select s.key, s.value
    from public.rvai_room_settings s
    where s.room_id = v_room_id
    order by s.key;
end;
$$;

revoke all on function public.rvai_create_room(text) from public;
revoke all on function public.rvai_list_recipes(text) from public;
revoke all on function public.rvai_upsert_recipe(text, jsonb) from public;
revoke all on function public.rvai_delete_recipe(text, uuid) from public;
revoke all on function public.rvai_refresh_presence(text, text) from public;
revoke all on function public.rvai_set_room_setting(text, text, text) from public;
revoke all on function public.rvai_get_room_settings(text) from public;

grant execute on function public.rvai_create_room(text) to anon;
grant execute on function public.rvai_list_recipes(text) to anon;
grant execute on function public.rvai_upsert_recipe(text, jsonb) to anon;
grant execute on function public.rvai_delete_recipe(text, uuid) to anon;
grant execute on function public.rvai_refresh_presence(text, text) to anon;
grant execute on function public.rvai_set_room_setting(text, text, text) to anon;
grant execute on function public.rvai_get_room_settings(text) to anon;

insert into storage.buckets (id, name, public)
values ('recipe-photos', 'recipe-photos', true)
on conflict (id) do update set public = true;

drop policy if exists "rvai_recipe_photos_read" on storage.objects;
create policy "rvai_recipe_photos_read"
on storage.objects for select
to anon
using (
  bucket_id = 'recipe-photos'
  and not storage.allow_any_operation(array['object.list', 'object.list_v2'])
);

drop policy if exists "rvai_recipe_photos_insert" on storage.objects;
create policy "rvai_recipe_photos_insert"
on storage.objects for insert
to anon
with check (bucket_id = 'recipe-photos');

drop policy if exists "rvai_recipe_photos_update" on storage.objects;
create policy "rvai_recipe_photos_update"
on storage.objects for update
to anon
using (bucket_id = 'recipe-photos')
with check (bucket_id = 'recipe-photos');
