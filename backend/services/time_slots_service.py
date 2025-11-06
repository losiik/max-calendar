from backend.repository.time_slots_repository import TimeSlotsRepository


class TimeSlotsService:
    def __init__(self, time_slots_repository: TimeSlotsRepository):
        self._time_slots_repository = time_slots_repository

    async def create_time_slot(self):
        pass

    async def update_time_slot(self):
        pass

    async def get_time_slots(self):
        pass
