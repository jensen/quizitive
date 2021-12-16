import type {
  IQuiz,
  ICreateQuiz,
  IUpdateQuiz,
  IQuestion,
  ICreateQuestion,
  IQuizLookup,
  IQuizWithQuestions,
  IQuizWithUser,
  IQuizResults,
} from "services/types/resources";
import { useQuery, useMutation, useQueryClient } from "react-query";
import {
  getQuizSlugs,
  getQuizzes,
  getQuiz,
  getResults,
  createQuiz,
  updateQuiz,
  createQuestion,
} from "services/api";

export function useQuizLookup({ id, slug }: { id?: string; slug?: string }) {
  const lookup = useQueryClient().getQueryCache().find("quizlookup")?.state
    .data as IQuizLookup;

  if (id) {
    return lookup.slugs[id];
  }

  if (slug) {
    return lookup.ids[slug];
  }

  throw new Error("Must convert and id or a slug");
}

export function useQuizSlugs() {
  const { data } = useQuery<IQuiz>("quizlookup", getQuizSlugs as any);

  return data;
}

export function useQuizzes() {
  const { data } = useQuery<IQuizWithUser[]>("quizzes", getQuizzes as any);

  return data;
}

export function useQuiz(slug: string) {
  const id = useQuizLookup({ slug });

  const { data } = useQuery<IQuizWithQuestions & IQuizWithUser>(
    ["quiz", id],
    () => getQuiz(id) as any
  );

  return data;
}

export function useQuizResults(id: string) {
  const { data } = useQuery<IQuizResults>(
    ["results", id],
    () => getResults(id) as any
  );

  return data;
}

export function useCreateQuiz() {
  const queryClient = useQueryClient();
  const mutation = useMutation<IQuiz, Error, ICreateQuiz>(createQuiz as any, {
    onSuccess: () => {
      queryClient.invalidateQueries(["quizlookup"]);
    },
  });

  return {
    create: mutation.mutateAsync,
    busy: mutation.isLoading,
  };
}

export function useUpdateQuiz(slug: string) {
  const id = useQuizLookup({ slug });

  return useMutation<IQuiz, Error, IUpdateQuiz>(
    async (quiz) => updateQuiz({ id, ...quiz }) as any
  ).mutateAsync;
}

export function useCreateQuestion(id: string) {
  const queryClient = useQueryClient();
  const mutation = useMutation<IQuestion, Error, ICreateQuestion>(
    (question) => createQuestion({ quiz_id: id, ...question }) as any,
    {
      onSuccess: async (data) => {
        queryClient.invalidateQueries(["quiz", id]);
      },
    }
  );

  return {
    create: mutation.mutateAsync,
    busy: mutation.isLoading,
  };
}
