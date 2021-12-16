import { PrimaryLink } from "components/Primary";
import { useAuth } from "context/auth";

export default function Index() {
  const auth = useAuth();
  return (
    <div className="h-full flex flex-col justify-center items-center space-y-4">
      <PrimaryLink
        to="quizzes"
        className="text-white font-light text-xl border-2 px-4 py-2 rounded-full hover:shadow-lg hover:bg-rose-900"
      >
        Quizzes
      </PrimaryLink>
      <PrimaryLink to="quizzes/new" disabled={auth.user === null}>
        Create Quiz
      </PrimaryLink>
    </div>
  );
}
