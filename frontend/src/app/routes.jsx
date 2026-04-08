import { createBrowserRouter } from "react-router";
import LoginPage from "./components/auth/LoginPage";
import SignupPage from "./components/auth/SignupPage";
import MainLayout from "./components/layout/MainLayout";
import Dashboard from "./components/dashboard/Dashboard";
import MySubjects from "./pages/MySubjects";
import TaskListPage from "./pages/TaskListPage";
import StudySessions from "./pages/StudySessions";
import Settings from "./pages/Settings";
import FocusSpace from "./pages/FocusSpace";
import CalendarPage from "./pages/CalendarPage";

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
      { path: "calendar", Component: CalendarPage },
      { path: "sessions", Component: StudySessions },
      { path: "focus", Component: FocusSpace },
      { path: "settings", Component: Settings }]

  }]
);