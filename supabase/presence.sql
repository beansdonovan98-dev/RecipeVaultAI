create table if not exists public.rvai_presence (
  room_id uuid not null references public.rvai_rooms(id) on delete cascade,
  member text not null,
  last_seen timestamptz not null default now(),
  primary key (room_id, member)
);

alter table public.rvai_presence enable row level security;

revoke all on public.rvai_presence from anon, authenticated;

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

revoke all on function public.rvai_refresh_presence(text, text) from public;

grant execute on function public.rvai_refresh_presence(text, text) to anon;
