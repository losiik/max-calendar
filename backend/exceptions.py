class UserAlreadyExistsError(Exception):
    """ User already exists """


class UserDoesNotExistsError(Exception):
    """ User does not exists """


class ShareTokenDoesNotExistsError(Exception):
    """ Token does not exists """


class TimeSlotDoesNotExistsError(Exception):
    """ Slot does not exists """


class TimeSlotOverlapError(Exception):
    """ Slot does not exists """
