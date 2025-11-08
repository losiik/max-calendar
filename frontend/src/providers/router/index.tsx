import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'

import { MainLayout } from '../../app/layouts/MainLayout'
import SettingsPage from '../../pages/SettingsPage/ui/SettingsPage'
import CalendarPage from '../../pages/CalendarPage/ui/CalendarPage'

const router = createBrowserRouter([
  {
    path: '/max-calendar',
    element: <MainLayout />,
    children: [
      { index: true, element: <Navigate to="settings" replace /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'calendar', element: <CalendarPage /> },
    ],
  },
],

)

export function AppRouter() {
  return <RouterProvider router={router} ></RouterProvider>
}