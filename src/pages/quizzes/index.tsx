import { Suspense } from "react";
import { Outlet } from "react-router-dom";

export default function QuizIndex() {
  return (
    <Suspense fallback={null}>
      <Outlet />
    </Suspense>
  );
}
