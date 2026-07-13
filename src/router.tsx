import { createBrowserRouter, Navigate } from "react-router-dom";
import { App } from "./App";
import { Dashboard } from "./pages/dashboard";
import { Curriculum } from "./pages/curriculum";
import { LessonPage } from "./pages/lesson-page";
import { Questionary } from "./pages/questionary";
import { Knowledge } from "./pages/knowledge";
import { Profile } from "./pages/profile";
import { Practice } from "./pages/practice";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "curriculum", element: <Curriculum /> },

      { path: "m/:moduleId/questionary", element: <Questionary /> },
      { path: "m/:moduleId/:lessonId", element: <LessonPage /> },
      { path: "notes", element: <Navigate to="/knowledge" replace /> },
      { path: "knowledge", element: <Knowledge /> },
      { path: "profile", element: <Profile /> },
      { path: "practice", element: <Practice /> },
    ],
  },
]);
