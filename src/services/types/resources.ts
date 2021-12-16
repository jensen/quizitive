import { definitions } from "./supabase";

export type ICreateQuiz = {
  name: string;
};

export type IUser = definitions["profiles"];

export type IUpdateQuiz = { name?: string; published?: boolean };

export type IQuestion = definitions["questions"];
export type IQuestionWithAnswers = IQuestion & { answers: IAnswer[] };

export type IQuiz = definitions["quizzes"];
export type IQuizWithUser = IQuiz & { user: IUser };
export type IQuizWithQuestions = IQuiz & { questions: IQuestionWithAnswers[] };

export type ICreateQuestion = {
  question: string;
  answers: string[];
};

export type IAnswer = definitions["answers"];

export interface IQuizLookup {
  slugs: { [key: string]: string };
  ids: { [key: string]: string };
}

export type IAttempt = definitions["attempts"];

export type IQuizResults = {
  attempt: IAttempt;
  questions: any;
};
