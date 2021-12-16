import { Outlet } from "react-router-dom";

import Header from "components/Header";

import { useQuizSlugs } from "hooks/quizzes";
import { ReactQueryDevtools } from "react-query/devtools";

export default function Index() {
  useQuizSlugs();

  return (
    <main className="h-full flex flex-col">
      <Header />
      <section className="flex-1 flex justify-center">
        <div className="w-full flex justify-center p-6">
          <Outlet />
        </div>
      </section>
      <ReactQueryDevtools />
    </main>
  );
}
