create table licenfy.password_accounts (
  owner_id text primary key references licenfy.accounts (owner_id),
  email text unique not null,
  name text not null,
  salt text not null,
  password_hash text not null
);

alter table licenfy.password_accounts enable row level security;
alter table licenfy.password_accounts force row level security;
revoke all on licenfy.password_accounts from public, anon, authenticated, service_role;
grant select, insert on licenfy.password_accounts to licenfy_app;

create policy password_account_lookup on licenfy.password_accounts
  for select to licenfy_app
  using (email = nullif(current_setting('licenfy.login_email', true), ''));

create policy password_account_creation on licenfy.password_accounts
  for insert to licenfy_app
  with check (owner_id = nullif(current_setting('licenfy.owner_id', true), ''));

create table licenfy.auth_rate_limits (
  key text primary key,
  window_started timestamptz not null,
  attempts integer not null check (attempts > 0)
);

alter table licenfy.auth_rate_limits enable row level security;
alter table licenfy.auth_rate_limits force row level security;
revoke all on licenfy.auth_rate_limits from public, anon, authenticated, service_role;
grant select, insert, update on licenfy.auth_rate_limits to licenfy_app;

create policy auth_rate_bucket on licenfy.auth_rate_limits
  to licenfy_app
  using (key = nullif(current_setting('licenfy.rate_key', true), ''))
  with check (key = nullif(current_setting('licenfy.rate_key', true), ''));