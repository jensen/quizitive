import { Suspense } from "react";
import { Outlet } from "react-router-dom";

export default function UsersIndex() {
  return (
    <Suspense fallback={null}>
      <Outlet />
    </Suspense>
  );
}
