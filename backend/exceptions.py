class UserAlreadyExistsError(Exception):
    """ User already exists """


class UserDoesNotExistsError(Exception):
    """ User does not exists """


class ShareTokenDoesNotExistsError(Exception):
    """ Token does not exists """
