create schema licenfy;
revoke all on schema licenfy from public;

create role licenfy_app nologin nosuperuser nocreatedb nocreaterole nobypassrls;
grant usage on schema licenfy to licenfy_app;

create table licenfy.workspaces (
  owner_id text primary key check (length(owner_id) between 1 and 128),
  revision integer not null check (revision > 0),
  state jsonb not null check (
    jsonb_typeof(state) = 'object' and octet_length(state::text) <= 524288
  )
);

alter table licenfy.workspaces enable row level security;
alter table licenfy.workspaces force row level security;
revoke all on licenfy.workspaces from public, anon, authenticated, service_role;
grant select, insert, update on licenfy.workspaces to licenfy_app;

create policy workspace_owner on licenfy.workspaces
  to licenfy_app
  using (owner_id = nullif(current_setting('licenfy.owner_id', true), ''))
  with check (owner_id = nullif(current_setting('licenfy.owner_id', true), ''));
