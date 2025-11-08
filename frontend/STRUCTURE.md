# Frontend Structure

```
frontend
├── README.md
├── STRUCTURE.md
├── index.html
├── package.json / package-lock.json
├── postcss.config.js / tailwind.config.js / tsconfig*.json / vite.config.ts
├── public
│   └── vite.svg
└── src
    ├── app
    │   ├── App.tsx / App.css
    │   ├── layouts/MainLayout.tsx
    │   ├── main.tsx
    │   └── index.css / vite-env.d.ts
    ├── assets
    │   └── react.svg
    ├── features
    │   ├── calendar-settings
    │       ├── agenda
    │       │   ├── model/agenda.store.ts
    │       │   └── ui/AgendaContent.tsx
    │       ├── meeting-periods
    │       │   ├── model/meeting-periods.store.ts
    │       │   └── ui/MeetingPeriodContent.tsx
    │       ├── notifications
    │       │   ├── model/notification.store.ts
    │       │   └── ui/NotificationContent.tsx
    │       ├── working-days
    │       │   ├── model/working-days.store.ts
    │       │   └── ui/WorkingDaysContent.tsx
    │       └── working-hours
    │           └── ui/WorkingHoursContent.tsx
    │   ├── calendar
    │       ├── book-availability
    │       │   ├── model/book-slot.store.ts
    │       │   └── ui/ExternalBookingForm.tsx
    │       ├── create-event
    │       │   ├── model/event-form.store.ts
    │       │   └── ui/EventForm.tsx
    │       └── manage-availability
    │           ├── model/manage-availability.store.ts
    │           └── ui/DaySlotsDrawer.tsx
    │       └── guest
    │           ├── model/guest-calendar.store.ts
    │           └── ui/GuestCalendarOverlay.tsx
    ├── pages
    │   ├── CalendarPage/ui/CalendarPage.tsx
    │   ├── EventCreatePage/ui/EventCreatePage.tsx
    │   ├── ExternalCalendarPage/ui/ExternalCalendarPage.tsx
    │   └── SettingsPage/ui/SettingsPage.tsx
    ├── providers
    │   ├── query/index.tsx
    │   ├── router/index.tsx
    │   └── store/index.ts
    ├── shared
    │   ├── config/route.ts
    │   ├── modal/index.tsx / store.ts
    │   ├── ui
    │   │   ├── Host.tsx
    │   │   ├── Overlay.tsx
    │   │   └── TimeRangeInput.tsx
    │   └── util/format-time.ts
    └── widgets
        └── MenuTabs
            ├── model/index.ts
            └── ui/MenuTabs.tsx
```

## Directory responsibilities

- `public/`: Static assets copied into the Vite build output without bundling.
- `src/app/`: Application shell — entry point (`main.tsx`), global layout, and app-level styles.
- `src/assets/`: Static assets imported through the bundler (e.g., React logo).
- `src/features/`: Reusable feature slices. `calendar-settings/*` groups each settings panel with its Zustand store and UI (agenda, notifications, working days, working hours, meeting periods).
- `src/features/`: Reusable feature slices. `calendar-settings/*` содержит настройки; `calendar/*` — виджеты взаимодействия с календарём (нижний шит, форма события, бронирование слотов и гостевой режим по startapp).
- `src/pages/`: Route-level screens. Each folder exposes the page UI component; SettingsPage orchestrates the feature slices above.
- `src/widgets/`: Reusable composite UI pieces, e.g., `MenuTabs` with its model and view.
- `src/shared/`: Cross-cutting utilities and UI primitives (modal system, route config, time formatting, inputs).
- `src/providers/`: App-wide providers configuring routing, global store, and TanStack Query.

## Config & Tooling

- `package.json`: Scripts (`dev`, `build`, `preview`) and dependencies (React, Zustand, TanStack Query, Tailwind).
- `tailwind.config.js` + `postcss.config.js`: Styling pipeline.
- `tsconfig*.json`: TypeScript project and Vite tooling configuration.
- `vite.config.ts`: Vite bundler setup (React plugin, aliases, etc.).
