drop table if exists profiles;
create table profiles (
  id uuid references auth.users primary key,
  name text not null,
  avatar text not null
);

create table profiles_private (
  id uuid references profiles(id) primary key,
  email text not null,
  admin boolean default false not null
);

alter table profiles_private
  enable row level security;

create policy "Profiles are only visible by the user who owns it"
  on profiles_private for select using (
    auth.uid() = id
  );
  
drop function if exists handle_new_user();
create function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into profiles (id, name, avatar)
  values (new.id, new.raw_user_meta_data::json->>'full_name', new.raw_user_meta_data::json->>'avatar_url');
  
  insert into profiles_private (id, email)
  values (new.id, new.email);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

create table quizzes (
  id uuid default extensions.uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  name text not null,
  slug text not null,

  user_id uuid default auth.uid() not null,
  constraint user_id foreign key(user_id) references profiles(id) on delete cascade
);

alter table quizzes
  enable row level security;

create policy "Quizzes selected: published for anon"
  on quizzes for select using (
    published = true
    or
    auth.uid() = user_id
  );

create policy "Quizzes inserted: authenticated"
  on quizzes for insert with check (
    auth.role() = 'authenticated'
  );

create policy "Quizzes updated: owner"
  on quizzes for update using (
    auth.uid() = user_id
  );

create or replace function public.slugify()
 returns trigger
 language plpgsql
as $function$
begin
    new.slug := trim(BOTH '-' from regexp_replace(lower(unaccent(trim(new.name))), '[^a-z0-9\-_]+', '-', 'gi'));
    return new;
end;
$function$

drop trigger if exists on_quiz_created_add_slug on public.quizzes;
create trigger on_quiz_created_add_slug
  before insert on public.quizzes
  for each row execute procedure public.slugify();

create table questions (
  id uuid default extensions.uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  content text not null,

  quiz_id uuid not null,
  constraint quiz_id foreign key(quiz_id) references quizzes(id) on delete cascade
);

alter table questions
  enable row level security;

create policy "Questions selected: anon"
  on questions for select using (
    get_is_question_selectable(id)
  );

create policy "Questions inserted: authenticated"
  on questions for insert with check (
    auth.role() = 'authenticated'
  );

create policy "Questions deleted: authenticated"
  on questions for delete using (
    get_is_question_owner(id)
  );


create table answers (
  id uuid default extensions.uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  content text not null,

  question_id uuid not null,
  constraint question_id foreign key(question_id) references questions(id) on delete cascade
);

create table correct_answers (
  answer_id uuid not null,
  constraint answer_id foreign key(answer_id) references answers(id) on delete cascade
);

create table attempts (
  id uuid default extensions.uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  correct int not null,
  started int not null,
  ended int not null,

  user_id uuid default auth.uid() not null,
  constraint user_id foreign key(user_id) references profiles(id) on delete cascade,

  quiz_id uuid not null,
  constraint quiz_id foreign key(quiz_id) references quizzes(id) on delete cascade
);

create or replace
function get_answers(question_id uuid)
returns setof answers
as $$
begin
  return query
  select * from answers where answers.question_id = $1 order by random();
end $$ language plpgsql;

create or replace
function submit_attempt(quiz_id uuid, started int, ended int, answers text)
returns uuid
as $$
declare
  ids uuid[];
  correct int;
  attempt_id uuid;
begin
  ids = string_to_array($4, ',')::uuid[];

  select count(answer_id)
  into correct
  from correct_answers
  where answer_id = any(ids);

  insert into attempts (correct, started, ended, user_id, quiz_id, answers)
  values (correct, $2, $3, auth.uid(), $1, array_to_json(ids)) returning id into attempt_id;

  return attempt_id;
end $$ language plpgsql;


create or replace
function get_attempt_details(attempt_id uuid)
returns table (id uuid, correct uuid, chosen uuid)
as $$
begin
  return query
  select       
    questions.id as id,
    answers.id as correct,
    attempts.answers ->> (row_number() over (order by questions.created_at asc) - 1)::int as chosen
  from attempts
    join quizzes on attempts.quiz_id = quizzes.id
    join questions on questions.quiz_id = quizzes.id
    join answers on answers.question_id = questions.id
    join correct_answers on correct_answers.answer_id = answers.id
  where attempts.id = $1;
end $$ language plpgsql;


create or replace
function get_is_question_published(_question_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select quizzes.id
    from quizzes
    join questions on questions.quiz_id = quizzes.id
    where questions.id = _question_id and published = true
  );
$$;

create or replace
function get_is_answer_selectable(_answer_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select quizzes.id
    from quizzes
    join questions on questions.quiz_id = quizzes.id
    join answers on answers.question_id = questions.id
    where answers.id = _answer_id and published = true
  );
$$;

create or replace
function get_is_question_owner(_question_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select quizzes.id
    from quizzes
    join questions on questions.quiz_id = quizzes.id
    where quizzes.user_id = auth.uid()
  );
$$;

create or replace
function get_is_answer_owner(_answer_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select quizzes.id
    from quizzes
    join questions on questions.quiz_id = quizzes.id
    join answers on answers.question_id = questions.id
    where quizzes.user_id = auth.uid()
  );
$$;
