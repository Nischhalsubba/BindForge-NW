begin;
create table public.bindforge_workspaces (
 user_id uuid primary key references auth.users(id) on delete cascade,
 revision bigint not null check(revision>0),
 document jsonb not null check(jsonb_typeof(document)='object'),
 updated_at timestamptz not null default now()
);
create table public.bindforge_workspace_history (
 user_id uuid not null references auth.users(id) on delete cascade,
 revision bigint not null,
 document jsonb not null,
 created_at timestamptz not null default now(),
 primary key(user_id,revision)
);
alter table public.bindforge_workspaces enable row level security;
alter table public.bindforge_workspace_history enable row level security;
create policy own_workspace_read on public.bindforge_workspaces for select to authenticated using((select auth.uid())=user_id);
create policy own_history_read on public.bindforge_workspace_history for select to authenticated using((select auth.uid())=user_id);
revoke all on public.bindforge_workspaces,public.bindforge_workspace_history from anon,authenticated;
grant select on public.bindforge_workspaces,public.bindforge_workspace_history to authenticated;

create function public.bindforge_save_workspace(expected_revision bigint, workspace_document jsonb)
returns bigint language plpgsql security definer set search_path='' as $$
declare owner_id uuid:=auth.uid(); next_revision bigint; entry record;
begin
 if owner_id is null then raise exception 'Authentication required' using errcode='42501'; end if;
 if expected_revision is null or expected_revision<0 then raise exception 'Invalid revision' using errcode='22023'; end if;
 if workspace_document is null or jsonb_typeof(workspace_document) is distinct from 'object' or workspace_document->'schemaVersion' is distinct from '1'::jsonb
 or jsonb_typeof(workspace_document->'documents') is distinct from 'object' or workspace_document->>'exportedAt' is null
 or octet_length(workspace_document::text)>2097152 then raise exception 'Invalid workspace' using errcode='22023'; end if;
 perform (workspace_document->>'exportedAt')::timestamptz;
 for entry in select key,value from jsonb_each(workspace_document->'documents') loop
  if entry.key not in ('bindforge-nw:settings:v2','bindforge-nw:library:v1','bindforge-nw:profiles:v1','bindforge-nw:profile-history:v1','bindforge-nw:keyboard-layout:v1','bindforge-nw:builder:v1','bindforge-nw:copy-history:v1') or jsonb_typeof(entry.value)<>'string'
  then raise exception 'Unsupported document' using errcode='22023'; end if;
 end loop;
 update public.bindforge_workspaces set document=workspace_document, revision=revision+1,updated_at=now()
 where user_id=owner_id and revision=expected_revision returning revision into next_revision;
 if next_revision is null and expected_revision=0 then
  insert into public.bindforge_workspaces(user_id,revision,document) values(owner_id,1,workspace_document)
  on conflict(user_id) do nothing returning revision into next_revision;
 end if;
 if next_revision is null then raise exception 'Workspace revision conflict' using errcode='40001'; end if;
 insert into public.bindforge_workspace_history(user_id,revision,document) values(owner_id,next_revision,workspace_document);
 delete from public.bindforge_workspace_history where user_id=owner_id and revision<=next_revision-50;
 return next_revision;
end $$;
revoke all on function public.bindforge_save_workspace(bigint,jsonb) from public,anon;
grant execute on function public.bindforge_save_workspace(bigint,jsonb) to authenticated;

create function public.bindforge_delete_my_account()
returns void language plpgsql security definer set search_path='' as $$
declare owner_id uuid:=auth.uid();
begin
 if owner_id is null then raise exception 'Authentication required' using errcode='42501'; end if;
 delete from auth.users where id=owner_id;
end $$;
revoke all on function public.bindforge_delete_my_account() from public,anon;
grant execute on function public.bindforge_delete_my_account() to authenticated;
commit;
