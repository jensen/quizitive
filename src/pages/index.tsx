import { PrimaryLink } from "components/Primary";
import { useAuth } from "context/auth";
import UsersView from "./users/view";

export default function Index() {
  const auth = useAuth();
  return (
    <div className="h-full flex flex-col justify-center items-center space-y-4">
      <PrimaryLink to="quizzes">Quizzes</PrimaryLink>
      <PrimaryLink to="quizzes/new" disabled={auth.user === null}>
        Create Quiz
      </PrimaryLink>
      <PrimaryLink
        to={`users/${auth.user?.user_metadata.name}`}
        disabled={auth.user === null}
      >
        Dashboard
      </PrimaryLink>
    </div>
  );
}
