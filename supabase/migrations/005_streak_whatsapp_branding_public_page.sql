-- Migração para as novas funcionalidades: streak, WhatsApp, marca própria e página
-- pública. Rode este script inteiro no SQL Editor do seu projeto Supabase.

alter table profiles add column if not exists phone text;
alter table profiles add column if not exists bio text;
alter table profiles add column if not exists brand_color text;
alter table profiles add column if not exists brand_logo_url text;
alter table profiles add column if not exists public_slug text unique;
alter table profiles add column if not exists is_public_page_enabled boolean not null default false;

create or replace view public_personal_profiles as
  select id, full_name, avatar_url, bio, phone, brand_color, brand_logo_url, public_slug
  from profiles
  where is_public_page_enabled = true and public_slug is not null;

grant select on public_personal_profiles to anon, authenticated;

insert into storage.buckets (id, name, public)
values ('brand-logos', 'brand-logos', true)
on conflict (id) do nothing;

drop policy if exists "brand_logos_public_select" on storage.objects;
create policy "brand_logos_public_select"
  on storage.objects for select
  using (bucket_id = 'brand-logos');

drop policy if exists "brand_logos_insert_own" on storage.objects;
create policy "brand_logos_insert_own"
  on storage.objects for insert
  with check (bucket_id = 'brand-logos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "brand_logos_update_own" on storage.objects;
create policy "brand_logos_update_own"
  on storage.objects for update
  using (bucket_id = 'brand-logos' and (storage.foldername(name))[1] = auth.uid()::text);
