import type {
  IQuiz,
  ICreateQuiz,
  IUpdateQuiz,
  IQuestion,
  ICreateQuestion,
  IAnswer,
  IQuizLookup,
  IQuizWithQuestions,
  IQuizWithUser,
  IQuizResults,
  IUser,
  IAttempt,
} from "./types/resources";
import supabase from "services";

export const getQuizSlugs = (id: string) =>
  supabase
    .from<IQuiz>("quizzes")
    .select("id, slug")
    .then(({ data, error }) =>
      data?.reduce(
        (lookup: IQuizLookup, { id, slug }) => {
          lookup.ids[slug] = id;
          lookup.slugs[id] = slug;

          return lookup;
        },
        {
          slugs: {},
          ids: {},
        }
      )
    ) as Promise<Pick<IQuiz, "id" | "slug">>;

export const getQuizzes = () =>
  supabase
    .from<IQuizWithUser>("quizzes")
    .select("*, user:user_id(*)")
    .then(({ data, error }) => data) as Promise<IQuizWithUser[]>;

export const getQuiz = async (id: string) => {
  const { data: quiz } = await supabase
    .from<IQuizWithQuestions & IQuizWithUser>("quizzes")
    .select("*, user:user_id(*), questions!quiz_id(*)")
    .match({ id })
    .order("created_at", { ascending: true, foreignTable: "questions" })
    .single();

  if (!quiz) throw new Error("No quiz found");

  const answers = (
    await Promise.all(
      quiz?.questions.map((question) =>
        supabase.rpc("get_answers", { question_id: question.id })
      )
    )
  ).map(({ data }) => data);

  return {
    ...quiz,
    questions: quiz.questions.map((question, index) => ({
      ...question,
      answers: answers[index],
    })),
  };
};

export const getResults = (id: string) =>
  Promise.all([
    supabase
      .from("attempts")
      .select("*")
      .match({ id })
      .single()
      .then(({ data, error }) => data),
    supabase
      .rpc("get_attempt_details", { attempt_id: id })
      .then(({ data, error }) => data),
  ]).then(([attempt, details]) => ({
    attempt,
    questions: details?.reduce((a, c) => {
      a[c.id] = c;
      return a;
    }, {}),
  })) as Promise<IQuizResults>;

export const getAttempts = (name: string) =>
  supabase
    .from<IUser>("profiles")
    .select()
    .eq("name", name)
    .single()
    .then(({ data }) =>
      supabase
        .from("attempts")
        .select("*, quiz:quiz_id(*, questions!quiz_id(*))")
        .eq("user_id", data?.id)
        .then(({ data }) => data)
    ) as Promise<IAttempt & { quiz: IQuizWithQuestions }>;

export const createQuiz = (quiz: ICreateQuiz) =>
  supabase
    .from<IQuiz>("quizzes")
    .insert(quiz)
    .single()
    .then(({ data, error }) => data) as Promise<ICreateQuiz>;

export const updateQuiz = (quiz: IUpdateQuiz & { id: string }) =>
  supabase
    .from<IQuiz>("quizzes")
    .update(quiz)
    .match({ id: quiz.id })
    .single()
    .then(({ data, error }) => data) as Promise<IUpdateQuiz>;

export const createQuestion = ({
  quiz_id,
  question,
  answers,
}: ICreateQuestion & { quiz_id: string }) =>
  supabase
    .from<IQuestion>("questions")
    .insert({ content: question, quiz_id })
    .single()
    .then(({ data: question }) => {
      return supabase
        .from<IAnswer>("answers")
        .insert(
          answers.map((answer) => ({
            content: answer,
            question_id: question?.id,
          }))
        )
        .then(({ data: answers }) => {
          if (answers) {
            const [answer] = answers;

            return supabase
              .from<{ answer_id: string }>("correct_answers")
              .insert({ answer_id: answer.id });
          }
        });
    });

export const submitQuiz = ({
  quiz_id,
  answers,
  started,
}: {
  quiz_id: string;
  answers: string[];
  started: number;
}) =>
  supabase
    .rpc("submit_attempt", {
      quiz_id,
      answers: answers.join(","),
      started,
      ended: Math.round(new Date().getTime() / 1000),
    })
    .then(({ data, error }) => data);
