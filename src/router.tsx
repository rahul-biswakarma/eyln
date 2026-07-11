import { createBrowserRouter } from "react-router-dom";
import { App } from "./App";
import { Dashboard } from "./pages/Dashboard";
import { Curriculum } from "./pages/Curriculum";
import { Playground } from "./pages/Playground";
import { LessonPage } from "./pages/LessonPage";
import { Resources } from "./pages/Resources";
import { Notes } from "./pages/Notes";
import { Profile } from "./pages/Profile";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "curriculum", element: <Curriculum /> },
      { path: "playground", element: <Playground /> },
      { path: "m/:moduleId/:lessonId", element: <LessonPage /> },
      { path: "resources", element: <Resources /> },
      { path: "notes", element: <Notes /> },
      { path: "profile", element: <Profile /> },
    ],
  },
]);
