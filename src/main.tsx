import React, { Suspense } from "react";
import ReactDOM from "react-dom";
import { QueryClient, QueryClientProvider } from "react-query";

import Router from "Router";

import "./index.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Must have a root element to render the application to.");
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      suspense: true,
    },
  },
});

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <Suspense fallback={null}>
      <QueryClientProvider client={queryClient}>
        <Router />
      </QueryClientProvider>
    </Suspense>
  </React.StrictMode>
);
