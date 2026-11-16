create table licenfy.accounts (
  owner_id text primary key check (length(owner_id) between 1 and 128),
  privacy_notice_version text not null,
  registered_at timestamptz not null default now()
);

alter table licenfy.accounts enable row level security;
alter table licenfy.accounts force row level security;
revoke all on licenfy.accounts from public, anon, authenticated, service_role;
grant select, insert on licenfy.accounts to licenfy_app;

create policy account_owner on licenfy.accounts
  to licenfy_app
  using (owner_id = nullif(current_setting('licenfy.owner_id', true), ''))
  with check (owner_id = nullif(current_setting('licenfy.owner_id', true), ''));
