import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthProvider from "context/auth";

const Root = React.lazy(() => import("pages/root"));
const Index = React.lazy(() => import("pages/index"));

const QuizIndex = React.lazy(() => import("pages/quizzes"));
const QuizNew = React.lazy(() => import("pages/quizzes/new"));
const QuizEdit = React.lazy(() => import("pages/quizzes/edit"));
const QuizList = React.lazy(() => import("pages/quizzes/list"));
const QuizView = React.lazy(() => import("pages/quizzes/view"));
const QuizResults = React.lazy(() => import("pages/quizzes/results"));

export default function Router() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/*" element={<Root />}>
            <Route index element={<Index />} />
            <Route path="quizzes/*" element={<QuizIndex />}>
              <Route index element={<QuizList />} />
              <Route path="new" element={<QuizNew />} />
              <Route path=":slug/*">
                <Route index element={<QuizView />} />
                <Route path="edit" element={<QuizEdit />} />
                <Route path="results">
                  <Route path=":id" element={<QuizResults />} />
                </Route>
              </Route>
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
