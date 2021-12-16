import type { ChangeEvent, ChangeEventHandler, SyntheticEvent } from "react";
import { useState } from "react";
import cx from "classnames";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { useCreateQuestion, useQuiz, useUpdateQuiz } from "hooks/quizzes";
import { Input } from "components/common";
import { withPreventDefault } from "util/event";
import { PrimaryButton } from "components/Primary";
import QuestionMark from "components/icons/QuestionMark";

const labelClass = cx("py-2", "flex", "text-white font-bold text-lg");
const labelTextClass = "w-12 flex justify-center items-center rounded-l-lg";

interface IFormElements {
  question: HTMLInputElement;
  a: HTMLInputElement;
  b: HTMLInputElement;
  c: HTMLInputElement;
  d: HTMLInputElement;
}

interface IQuizFormProps {
  quizId: string;
}

export const QuizForm = (props: IQuizFormProps) => {
  const { create, busy } = useCreateQuestion(props.quizId);
  const [validation, setValidation] = useState({
    question: 0,
    a: 0,
    b: 0,
    c: 0,
    d: 0,
  });

  const handleSubmit = async (
    event: SyntheticEvent<HTMLFormElement, SubmitEvent>
  ) => {
    const target = event.target as HTMLFormElement;
    const elements = target.elements as unknown as IFormElements;

    create({
      question: elements.question.value,
      answers: [elements.a, elements.b, elements.c, elements.d].map(
        (e) => e.value
      ),
    });

    target.reset();
  };

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setValidation((prev) => ({
      ...prev,
      [event.target.name]: event.target.value.length,
    }));
  };

  return (
    <form onSubmit={withPreventDefault(handleSubmit)}>
      <label className={labelClass} htmlFor="question">
        <span
          className={cx(
            labelTextClass,
            "flex justify-center items-center w-12 bg-gray-800"
          )}
        >
          <QuestionMark />
        </span>
        <Input
          id="question"
          name="question"
          placeholder="Question"
          onChange={handleChange}
        />
      </label>
      <section className="flex flex-col">
        {["a", "b", "c", "d"].map((answer, index) => {
          return (
            <label
              key={answer}
              className={cx(labelClass, "uppercase")}
              htmlFor={answer}
            >
              <span
                className={cx(labelTextClass, {
                  "bg-rose-400": index > 0,
                  "bg-green-400": index === 0,
                })}
              >
                {index + 1}
              </span>
              <Input
                id={answer}
                name={answer}
                placeholder={
                  index === 0 ? "Correct Answer" : "Incorrect Answer"
                }
                onChange={handleChange}
              />
            </label>
          );
        })}
      </section>
      <section className="py-4">
        <PrimaryButton
          type="submit"
          disabled={Object.values(validation).some((v) => v < 1) || busy}
        >
          Add Question
        </PrimaryButton>
      </section>
    </form>
  );
};

export default function QuizEdit() {
  const { slug } = useParams();

  if (!slug) throw new Error("Could not find slug");

  const quiz = useQuiz(slug);

  if (!quiz) throw new Error("Could not find quiz");

  const navigate = useNavigate();

  const update = useUpdateQuiz(slug);

  const publishQuiz = async () => {
    await update({ published: true });

    navigate("..", { replace: true });
  };

  return (
    <div className="w-96">
      <div className="flex justify-between">
        <h2 className="font-bold text-6xl">{quiz.name}</h2>
        <span className="px-2 h-6 flex items-center text-xs leading-5 font-semibold rounded-full bg-pink-100 text-pink-800">
          {quiz.published ? "Published" : "Unpublished"}
        </span>
      </div>
      <h3 className="text-pink-800">
        Created on {format(new Date(quiz.created_at), "MMMM do, yyyy")} by{" "}
        {quiz.user.name}
      </h3>
      <h3 className="font-bold text-lg">Questions</h3>
      <ul className="text-lg font-light space-y-2">
        {quiz.questions.map((question, index) => (
          <li key={question.id}>
            <span className="text-sm">{index + 1}</span>. {question.content}
          </li>
        ))}
      </ul>
      <QuizForm quizId={quiz.id} />
      {quiz.published === false && (
        <PrimaryButton onClick={publishQuiz}>Publish Quiz</PrimaryButton>
      )}
      {quiz.questions.length < 3 && <h4></h4>}
    </div>
  );
}
