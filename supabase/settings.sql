create table if not exists public.rvai_room_settings (
  room_id uuid not null references public.rvai_rooms(id) on delete cascade,
  key text not null,
  value text not null,
  updated_at timestamptz not null default now(),
  primary key (room_id, key)
);

alter table public.rvai_room_settings enable row level security;

revoke all on public.rvai_room_settings from anon, authenticated;

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

  if v_key = 'app_font_key' and v_value not in ('system', 'serif', 'rounded', 'mono', 'elegant', 'condensed', 'geometric', 'editorial', 'slab', 'handwritten', 'comic', 'script', 'black', 'marker', 'chalkboard', 'avenir', 'optima', 'didot', 'trebuchet', 'impact') then
    raise exception 'Invalid font key';
  end if;

  if v_key = 'app_font_color' and v_value !~ '^#[0-9A-Fa-f]{6}$' then
    raise exception 'Invalid font color';
  end if;

  if v_key = 'app_theme_key' and v_value not in ('shinobi', 'southpark', 'halloween', 'sakura', 'ocean', 'forest', 'space', 'candy') then
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
     and (char_length(v_value) > 400 or v_value !~ '^https://[^[:space:]]+$') then
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

revoke all on function public.rvai_set_room_setting(text, text, text) from public;
revoke all on function public.rvai_get_room_settings(text) from public;

grant execute on function public.rvai_set_room_setting(text, text, text) to anon;
grant execute on function public.rvai_get_room_settings(text) to anon;
