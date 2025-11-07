import { useParams } from 'react-router-dom'

export function ExternalCalendarPage() {
  const { userId } = useParams()
  return <div>Календарь пользователя {userId}</div>
}