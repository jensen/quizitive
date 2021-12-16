import { useDashboard } from "hooks/quizzes";
import { useParams, Link } from "react-router-dom";
import { IAttemptWithQuiz } from "services/types/resources";

interface IAttemptProps
  extends Pick<
    IAttemptWithQuiz,
    "id" | "correct" | "started" | "ended" | "quiz"
  > {}

const Attempt = (props: IAttemptProps) => {
  const percent = Math.round(
    (props.correct / props.quiz?.questions.length) * 100
  );

  return (
    <Link
      className="block"
      to={`/quizzes/${props.quiz.slug}/results/${props.id}`}
    >
      <div className="flex justify-between items-end hover:drop-shadow-lg hover:cursor-pointer text-pink-800 hover:text-white">
        <h2 className="text-xl font-light">{props.quiz?.name}</h2>
        <h3 className="text-2xl font-black">
          {percent}% <span className="font-light">in</span>{" "}
          <span className="text-2xl font-black">
            {props.ended - props.started}
          </span>{" "}
          <span className="font-light">seconds.</span>
        </h3>
      </div>
    </Link>
  );
};

export default function UsersView() {
  const { name } = useParams();

  if (!name) throw new Error("No user found");

  const attempts = useDashboard(name);

  if (!attempts) throw new Error("No attempts found");

  return (
    <div className="w-96">
      <h2 className="font-bold text-6xl">{name}</h2>
      <ul className="py-4 space-y-2">
        {attempts.map((attempt) => (
          <Attempt {...attempt} />
        ))}
      </ul>
    </div>
  );
}
