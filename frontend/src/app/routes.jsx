import { createBrowserRouter } from "react-router";
import LoginPage from "./components/auth/LoginPage";
import RegisterPage from "./components/auth/RegisterPage";
import ForgotPasswordPage from "./components/auth/ForgotPasswordPage";
import ResetPasswordPage from "./components/auth/ResetPasswordPage";
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
    path: "/register",
    Component: RegisterPage
  },
  {
    path: "/forgot-password",
    Component: ForgotPasswordPage
  },
  {
    path: "/reset-password",
    Component: ResetPasswordPage
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
      { path: "settings", Component: Settings }
    ]
  }
]);