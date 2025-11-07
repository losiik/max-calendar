export type TabValue = 'calendar' | 'settings'

export const ROUTES = {
  calendar: 'calendar',
  settings: 'settings',
  eventCreate: 'events/new',
  externalCalendar: 'user/:userId/calendar'
} as const

export const TABS: { label: string; value: TabValue; pattern: string }[] = [
  { label: 'Календарь', value: 'calendar', pattern: '/calendar/*' },
  { label: 'Настройки', value: 'settings', pattern: '/settings/*' }
]

export const ROUTE_BY_TAB: Record<TabValue, string> = {
  calendar: ROUTES.calendar,
  settings: ROUTES.settings
}