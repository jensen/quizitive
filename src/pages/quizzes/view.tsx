import type {
  IQuizWithQuestions,
  IQuestionWithAnswers,
  IQuizWithUser,
} from "services/types/resources";
import React, { useContext, useEffect, useState, Suspense } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PrimaryButton } from "components/Primary";

import { useQuiz } from "hooks/quizzes";
import { submitQuiz } from "services/api";

interface IQuizProviderProps {
  children: React.ReactNode;
}

interface IQuizContext {
  currentQuestion: IQuestionWithAnswers | null;
  remainingQuestions: number;
  start: () => void;
  next: () => void;
  choose: (id: string) => void;
  quiz: (IQuizWithQuestions & IQuizWithUser) | null;
}

const QuizContext = React.createContext<IQuizContext>({
  currentQuestion: null,
  remainingQuestions: 0,
  start: () => null,
  next: () => null,
  choose: (id: string) => null,
  quiz: null,
});
const QuizProvider = (props: IQuizProviderProps) => {
  const { slug } = useParams();

  if (!slug) throw new Error("Must have quiz id");

  const quiz = useQuiz(slug);

  if (!quiz) {
    throw new Error("No quiz found");
  }

  const navigate = useNavigate();

  const [currentQuestion, setCurrentQuestion] = useState<number | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [started, setStarted] = useState<number>(0);

  const start = () => {
    setCurrentQuestion(0);
    setStarted(Math.round(new Date().getTime() / 1000));
  };

  const next = () =>
    setCurrentQuestion((prev) => {
      if (prev === null) {
        return 0;
      }

      return prev + 1;
    });
  const choose = (id: string) => {
    setSelectedAnswers((prev) => [...prev, id]);
    next();
  };

  useEffect(() => {
    if (
      currentQuestion !== null &&
      quiz.questions.length === selectedAnswers.length
    ) {
      submitQuiz({
        quiz_id: quiz.id,
        answers: selectedAnswers,
        started,
      }).then((id) => {
        navigate(`results/${id}`);
      });
    }
  }, [
    quiz?.id,
    quiz.questions.length,
    currentQuestion,
    selectedAnswers,
    started,
  ]);

  return (
    <QuizContext.Provider
      value={{
        currentQuestion:
          currentQuestion === null
            ? currentQuestion
            : quiz.questions[currentQuestion],
        remainingQuestions:
          currentQuestion === null
            ? quiz.questions.length
            : quiz.questions.length - currentQuestion,
        start,
        next,
        choose,
        quiz,
      }}
    >
      {props.children}
    </QuizContext.Provider>
  );
};
const useQuizContext = () => useContext(QuizContext);

interface IAnswerProps {
  id: string;
  content: string;
}

const Answer = (props: IAnswerProps) => {
  const { choose } = useQuizContext();

  return (
    <li
      className="text-white hover:cursor-pointer hover:text-pink-300"
      onClick={() => choose(props.id)}
    >
      {props.content}
    </li>
  );
};

const Question = () => {
  const { currentQuestion } = useQuizContext();

  return (
    <section>
      <div className="text-xl font-bold text-pink-900 mb-4">
        {currentQuestion?.content}
      </div>
      <ul className="flex flex-col space-y-2">
        {currentQuestion?.answers.map((answer) => (
          <Answer {...answer} />
        ))}
      </ul>
    </section>
  );
};

interface IIntroProps {
  topic: string;
  total: number;
  creator: string;
}

const Intro = (props: IIntroProps) => {
  return (
    <div className="text-white mb-4">
      <h3 className="text-xl font-light">
        The topic of this quiz is
        <span className="font-bold text-3xl"> {props.topic}</span>.
      </h3>

      <h3 className="text-lg font-light">
        There are <span className="font-bold"> {props.total} </span>
        questions.
      </h3>
      <h3 className="text-sm">
        Credit goes to <span className="font-bold">{props.creator}</span>.
      </h3>
      <h3 className="mt-4 text-md font-bold">
        Press start when you are ready.
      </h3>
    </div>
  );
};

const Quiz = () => {
  const { currentQuestion, remainingQuestions, start, quiz } = useQuizContext();

  if (!quiz) throw new Error("No quiz found");

  if (remainingQuestions === 0) {
    return <div />;
  }

  return (
    <div className="w-full h-full p-4">
      {currentQuestion === null ? (
        <>
          <Intro
            creator={quiz?.user.name}
            topic={quiz?.name}
            total={quiz?.questions.length}
          />
          <PrimaryButton onClick={start}>Start</PrimaryButton>
        </>
      ) : (
        <>
          <div className="flex items-center space-x-2 text-white mb-4">
            <h2 className="text-4xl font-bold">{remainingQuestions}</h2>
            <h3 className="text-xl font-light">
              Question{remainingQuestions > 1 ? "s" : ""} Remaining
            </h3>
          </div>
          <Question />
        </>
      )}
    </div>
  );
};

export default function QuizView() {
  return (
    <div className="w-96">
      <Suspense fallback={null}>
        <QuizProvider>
          <Quiz />
        </QuizProvider>
      </Suspense>
    </div>
  );
}
