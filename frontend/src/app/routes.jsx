import { createBrowserRouter } from "react-router";
import LoginPage from "./components/auth/LoginPage";
import SignupPage from "./components/auth/SignupPage";
import MainLayout from "./components/layout/MainLayout";
import Dashboard from "./components/dashboard/Dashboard";
import MySubjects from "./pages/MySubjects";
import TaskListPage from "./pages/TaskListPage";
import StudySessions from "./pages/StudySessions";
import Settings from "./pages/Settings";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: LoginPage
  },
  {
    path: "/signup",
    Component: SignupPage
  },
  {
    path: "/",
    Component: MainLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: "subjects", Component: MySubjects },
      { path: "tasks", Component: TaskListPage },
      { path: "sessions", Component: StudySessions },
      { path: "settings", Component: Settings }]

  }]
);