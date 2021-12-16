import type { ChangeEventHandler, SyntheticEvent } from "react";
import { useState } from "react";
import cx from "classnames";
import { Input } from "components/common";
import { useCreateQuiz } from "hooks/quizzes";
import { useNavigate } from "react-router";
import { withPreventDefault } from "util/event";
import { PrimaryButton } from "components/Primary";

interface IFormElements {
  name: HTMLInputElement;
}

export default function QuizNew() {
  const { create, busy } = useCreateQuiz();
  const navigate = useNavigate();

  const [valid, setValid] = useState(false);

  const handleSubmit = async (
    event: SyntheticEvent<HTMLFormElement, SubmitEvent>
  ) => {
    const elements = (event.target as HTMLFormElement)
      .elements as unknown as IFormElements;

    const quiz = await create({
      name: elements.name.value,
    });

    navigate(`../${quiz.slug}/edit`);
  };

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setValid(event.target.value.length > 3 && event.target.value.length < 24);
  };

  return (
    <div className="w-96">
      <form onSubmit={withPreventDefault(handleSubmit)}>
        <label className={cx("text-white font-bold text-xl")} htmlFor="name">
          <span className="block mb-2">What is the quiz about?</span>
          <Input
            id="name"
            name="name"
            className="rounded-lg"
            onChange={handleChange}
          />
        </label>
        <h5
          className={cx("text-sm mt-1", {
            "text-pink-800": valid,
            "text-pink-200": !valid,
          })}
        >
          Between 3 and 24 characters.
        </h5>
        <section className="pt-6">
          <PrimaryButton type="submit" disabled={valid === false || busy}>
            Create
          </PrimaryButton>
        </section>
      </form>
    </div>
  );
}
