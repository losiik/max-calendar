import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";

import { MainLayout } from "../../app/layouts/MainLayout";
import SettingsPage from "../../pages/SettingsPage/ui/SettingsPage";
import CalendarPage from "../../pages/CalendarPage/ui/CalendarPage";
import EventCreatePage from "../../pages/EventCreatePage/ui/EventCreatePage";

const router = createBrowserRouter([
  {
    path: "/max-calendar",
    element: <MainLayout />,
    children: [
      { index: true, element: <Navigate to="settings" replace /> },
      { path: "calendar", element: <CalendarPage /> },
      { path: "settings", element: <SettingsPage /> },
      { path: "events/new", element: <EventCreatePage /> },
    ],
  },

  {
    path: "*",
    element: <Navigate to="/max-calendar/calendar" replace />,
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
