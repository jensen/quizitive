import type { IQuizWithUser } from "services/types/resources";
import { Link } from "react-router-dom";
import { useQuizzes } from "hooks/quizzes";
import { useAuth } from "context/auth";
import { format } from "date-fns";

interface IQuizItemProps extends IQuizWithUser {
  owner: boolean;
  disabled: boolean;
}

const QuizItem = (props: IQuizItemProps) => (
  <li className="w-full px-4 py-1 hover:border-l-4 border-pink-800">
    <Link
      className="hover:grayscale flex justify-between items-center"
      to={props.slug}
    >
      <div>
        <div className="flex space-x-2 items-end">
          <h2 className="text-xl text-white">{props.name}</h2>
          <h3 className="text-md text-pink-800"> by </h3>
          <h2 className="text-xl text-white">{props.user.name}</h2>
        </div>
        <h4 className="text-sm text-pink-900">
          {format(new Date(props.created_at), "MMMM do, yyyy")}
        </h4>
      </div>
      {props.disabled === false && (
        <h1 className="text-4xl font-bold text-pink-800 hover:text-white">
          GO
        </h1>
      )}
    </Link>
    {props.owner && (
      <Link
        to={`${props.slug}/edit`}
        className="text-sm text-pink-900 hover:text-pink-400"
      >
        Edit
      </Link>
    )}
  </li>
);

export default function QuizList() {
  const auth = useAuth();
  const quizzes = useQuizzes();

  if (!quizzes) throw new Error("No quizzes found");

  return (
    <div className="w-96">
      <ul className="flex flex-col space-y-2">
        {quizzes.map((quiz) => (
          <QuizItem
            {...quiz}
            owner={auth.user?.id === quiz.user_id}
            disabled={auth.user === null}
          />
        ))}
      </ul>
    </div>
  );
}
