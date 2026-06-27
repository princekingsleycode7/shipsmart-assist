
-- Roles
create type public.app_role as enum ('admin', 'user');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

-- Auto-create profile + default role on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email));
  insert into public.user_roles (user_id, role) values (new.id, 'user');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Parcels
create type public.parcel_status as enum ('pending','picked_up','in_transit','out_for_delivery','delivered','cancelled');

create table public.parcels (
  id uuid primary key default gen_random_uuid(),
  tracking_code text not null unique,
  sender text not null,
  recipient text not null,
  origin text not null,
  destination text not null,
  status parcel_status not null default 'pending',
  current_location text,
  eta timestamptz,
  driver_name text,
  driver_phone text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index parcels_tracking_code_idx on public.parcels (tracking_code);

create table public.parcel_events (
  id uuid primary key default gen_random_uuid(),
  parcel_id uuid not null references public.parcels(id) on delete cascade,
  status parcel_status not null,
  location text,
  note text,
  occurred_at timestamptz not null default now()
);

create index parcel_events_parcel_idx on public.parcel_events (parcel_id, occurred_at desc);

-- Chat (AI support, threaded per user)
create table public.chat_threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'New chat',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index chat_threads_user_idx on public.chat_threads (user_id, updated_at desc);

create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.chat_threads(id) on delete cascade,
  role text not null check (role in ('user','assistant','system')),
  parts jsonb not null,
  created_at timestamptz not null default now()
);

create index chat_messages_thread_idx on public.chat_messages (thread_id, created_at);

-- Live support chat
create table public.support_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text,
  status text not null default 'open' check (status in ('open','closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index support_conversations_user_idx on public.support_conversations (user_id, updated_at desc);

create table public.support_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.support_conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index support_messages_conv_idx on public.support_messages (conversation_id, created_at);

-- App settings (single row)
create table public.app_settings (
  id int primary key default 1 check (id = 1),
  whatsapp_number text,
  support_email text,
  updated_at timestamptz not null default now()
);

insert into public.app_settings (id, whatsapp_number, support_email)
values (1, '15551234567', 'support@delflow.app');

-- Updated_at trigger helper
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger parcels_touch before update on public.parcels for each row execute function public.touch_updated_at();
create trigger chat_threads_touch before update on public.chat_threads for each row execute function public.touch_updated_at();
create trigger support_conv_touch before update on public.support_conversations for each row execute function public.touch_updated_at();

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.parcels enable row level security;
alter table public.parcel_events enable row level security;
alter table public.chat_threads enable row level security;
alter table public.chat_messages enable row level security;
alter table public.support_conversations enable row level security;
alter table public.support_messages enable row level security;
alter table public.app_settings enable row level security;

-- Policies: profiles
create policy "Users view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);

-- Policies: user_roles
create policy "Users view own roles" on public.user_roles for select using (auth.uid() = user_id);
create policy "Admins view all roles" on public.user_roles for select using (public.has_role(auth.uid(),'admin'));
create policy "Admins manage roles" on public.user_roles for all using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- Policies: parcels — public read, admin write
create policy "Anyone can read parcels" on public.parcels for select using (true);
create policy "Admins manage parcels" on public.parcels for all using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create policy "Anyone can read parcel events" on public.parcel_events for select using (true);
create policy "Admins manage parcel events" on public.parcel_events for all using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- Policies: chat (user-owned)
create policy "Users view own threads" on public.chat_threads for select using (auth.uid() = user_id);
create policy "Users manage own threads" on public.chat_threads for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users view own messages" on public.chat_messages for select using (
  exists (select 1 from public.chat_threads t where t.id = thread_id and t.user_id = auth.uid())
);
create policy "Users manage own messages" on public.chat_messages for all using (
  exists (select 1 from public.chat_threads t where t.id = thread_id and t.user_id = auth.uid())
) with check (
  exists (select 1 from public.chat_threads t where t.id = thread_id and t.user_id = auth.uid())
);

-- Policies: live support
create policy "Users view own support conv" on public.support_conversations for select using (auth.uid() = user_id);
create policy "Users create own support conv" on public.support_conversations for insert with check (auth.uid() = user_id);
create policy "Users update own support conv" on public.support_conversations for update using (auth.uid() = user_id);
create policy "Admins view all support conv" on public.support_conversations for select using (public.has_role(auth.uid(),'admin'));
create policy "Admins update all support conv" on public.support_conversations for update using (public.has_role(auth.uid(),'admin'));

create policy "Users view own support msgs" on public.support_messages for select using (
  exists (select 1 from public.support_conversations c where c.id = conversation_id and c.user_id = auth.uid())
);
create policy "Admins view all support msgs" on public.support_messages for select using (public.has_role(auth.uid(),'admin'));
create policy "Users send own support msgs" on public.support_messages for insert with check (
  auth.uid() = sender_id and exists (
    select 1 from public.support_conversations c where c.id = conversation_id and (c.user_id = auth.uid() or public.has_role(auth.uid(),'admin'))
  )
);

-- App settings
create policy "Anyone read settings" on public.app_settings for select using (true);
create policy "Admins update settings" on public.app_settings for update using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- Enable realtime on support_messages
alter publication supabase_realtime add table public.support_messages;
alter table public.support_messages replica identity full;
