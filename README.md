## Purpose

This project was completed as part of a group learning exercise. This project uses the query builder, and authentication provided by [supabase](https://supabase.io).

## Demo

![demo](https://user-images.githubusercontent.com/14803/146342868-d7aaaa7e-921a-4c6e-944f-f6ff207562a9.png)

[https://quizitive.netlify.app/](https://quizitive.netlify.app/)

## Project Features

Mostly matched the requirements. The project was rushed, so some of the polish might be missing.

### User Stories

1. ✅ User can start the quiz by pressing a button
2. ✅ User can see a question with 4 possible answers
3. ✅ After selecting an answer, display the next question to the User. Do this until the quiz is finished
4. ✅ At the end, the User can see the following statistics:

- Time it took to finish the quiz
- How many correct answers did they get
- A message showing if they passed or failed the quiz

### Bonus features

1. ✅ Add multiple quizzes to the application. User can select which one to take
2. ✅ User can create an account and have all the scores saved in their dashboard. User can complete a quiz multiple times
3. ✅ User can create their own quizzes

## Technical Specifications

Still using Supabase for the backend. Took the opportunity to write some more procedures.

### Dependencies

- react@next
- react-query
- supabase/js
- tailwindcss
- postgres

### RPCs

Created a few interesting RPCs. Not sure if the constraints are legit, in this case we combine the use of a JSON array and the `row_number()` method.

The `attempts.answers` column is a JSON array, it is storing the users submitted answers. The attempts table does not know if the answers are correct or not. This rpc will provide results that resemble a table with the `correct` and `chosen` answer id for each `question` in the quiz.

```sql
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
```

Another rpc is used to create the quiz attempt. We can provide the quiz_id, some timestamps and a comma separated list of the answer ids. The string is parsed into an array, and the number of correct answers is calculated.

```sql
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
```

We store the list of submited answers as json. This allows us to get the details of the attempt as described above.

### Triggers

Whenever we create a new quiz we want to have a unique identifier that isn't the uuid for our url. Using a trigger we can add a `slug` value to a quiz row.

```sql
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
```

This uses the `unaccent` extension for Postgres. Unforunately it currently doesn't work with emojis.

## Project Setup

### Local Development

```sh
$ npm run dev
```

### Deployment

```sh
$ npm run build
$ netlify deploy --prod
```
