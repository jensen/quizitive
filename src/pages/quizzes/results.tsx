import { useQuiz, useQuizResults } from "hooks/quizzes";
import { useParams, Link } from "react-router-dom";
import Checkmark from "components/icons/Checkmark";
import Crossmark from "components/icons/Crossmark";
import cx from "classnames";
import { PrimaryLink } from "components/Primary";
import React from "react";
import { IAnswer } from "services/types/resources";

const intro = {
  yikes: "Ouch. ",
  low: "Not bad with ",
  mid: "Pretty good with ",
  high: "Very nice with ",
};

const outro = {
  yikes: "Please try again.",
  low: "Definitely try again.",
  mid: "Could use some improvement.",
  high: "It's time to move onto the next quiz.",
};

const getAnswer = (id: string, answers: IAnswer[]): IAnswer | undefined => {
  return answers.find((answer) => answer.id === id);
};

interface IAnswerProps {
  children: React.ReactNode;
  content: string;
}

const Answer = (props: IAnswerProps) => {
  return (
    <p
      className={cx(
        "flex space-x-2 items-center",
        "bg-white text-gray-900 rounded-full"
      )}
    >
      {props.children}
      <span>{props.content}</span>
    </p>
  );
};

interface IQuizQuestionProps {
  content: string;
  chosen?: IAnswer;
  correct?: IAnswer;
}
const QuizQuestion = (props: IQuizQuestionProps) => {
  if (!props.chosen || !props.correct) throw new Error("Must have answers");
  return (
    <li className="py-2">
      <h3 className="text-lg font-bold mb-2">{props.content}</h3>
      {props.chosen.id === props.correct.id ? (
        <Answer content={props.correct.content}>
          <Checkmark />
        </Answer>
      ) : (
        <div className="flex flex-col space-y-2">
          <Answer content={props.chosen.content}>
            <Crossmark />
          </Answer>
          <Answer content={props.correct.content}>
            <Checkmark />
          </Answer>
        </div>
      )}
    </li>
  );
};

export default function QuizResults() {
  const { id, slug } = useParams();

  if (!id || !slug) throw new Error("Could not find id");

  const quiz = useQuiz(slug);
  const results = useQuizResults(id);

  if (!quiz || !results) throw new Error("Could not find quiz");

  const totalQuestions = quiz.questions.length;
  const percent = Math.round((results.attempt.correct / totalQuestions) * 100);
  const grade =
    percent >= 90
      ? "high"
      : percent <= 10
      ? "yikes"
      : percent <= 50
      ? "low"
      : "mid";

  return (
    <div className="text-white">
      <p className="inline text-lg font-bold">{intro[grade]}</p>
      <h2 className="inline text-6xl font-bold">{percent}</h2>
      <h3 className="inline text-4xl font-light">%</h3>
      <p className="text-2xl font-bold">{outro[grade]}</p>
      <h3 className="text-sm text-pink-800">
        Quiz time was {results.attempt.ended - results.attempt.started} seconds
      </h3>
      <ul className="w-80 mt-4 mb-8">
        {quiz.questions.map((question) => {
          return (
            <QuizQuestion
              key={question.id}
              content={question.content}
              correct={getAnswer(
                results.questions[question.id].correct,
                question.answers
              )}
              chosen={getAnswer(
                results.questions[question.id].chosen,
                question.answers
              )}
            />
          );
        })}
      </ul>
      <PrimaryLink to="/quizzes">Back to Quizzes</PrimaryLink>
    </div>
  );
}
