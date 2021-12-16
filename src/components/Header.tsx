import { Link } from "react-router-dom";
import cx from "classnames";
import DiscordButton from "components/DiscordButton";
import { useAuth } from "context/auth";

export default function Header() {
  const auth = useAuth();

  return (
    <header
      className={cx(
        "p-4",
        "flex flex-col justify-center items-center",
        "bg-gray-800"
      )}
    >
      {auth.user === null && <DiscordButton />}
      <h1
        className={cx(
          "text-4xl font-bold",
          "text-transparent bg-clip-text",
          "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500",
          {
            "mt-4": auth.user === null,
          }
        )}
      >
        <Link to="/">Quizitive</Link>
      </h1>
    </header>
  );
}
