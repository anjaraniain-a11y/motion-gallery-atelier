create or replace function public.is_admin() returns boolean language sql stable as $$
  select coalesce(lower(auth.jwt()->>'email') = 'anjaraniain@gmail.com', false)
$$;

create table public.site_settings (
  id int primary key default 1,
  background text not null default '#f4f1ec',
  foreground text not null default '#1a1a1a',
  accent text not null default '#c2410c',
  updated_at timestamptz not null default now()
);
grant select on public.site_settings to anon, authenticated;
grant insert, update on public.site_settings to authenticated;
grant all on public.site_settings to service_role;
alter table public.site_settings enable row level security;
create policy "public read settings" on public.site_settings for select using (true);
create policy "admin write settings" on public.site_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());
insert into public.site_settings (id) values (1);

create table public.media (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'image',
  url text not null,
  title text not null default '',
  featured boolean not null default false,
  sort int not null default 0,
  created_at timestamptz not null default now()
);
grant select on public.media to anon, authenticated;
grant insert, update, delete on public.media to authenticated;
grant all on public.media to service_role;
alter table public.media enable row level security;
create policy "public read media" on public.media for select using (true);
create policy "admin write media" on public.media for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "public read files" on storage.objects for select using (bucket_id = 'media');
create policy "admin upload files" on storage.objects for insert to authenticated with check (bucket_id = 'media' and public.is_admin());
create policy "admin delete files" on storage.objects for delete to authenticated using (bucket_id = 'media' and public.is_admin());