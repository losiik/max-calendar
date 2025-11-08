from maxapi.filters.callback_payload import CallbackPayload


class MyPayload(CallbackPayload, prefix='mypayload'):
    foo: str
    action: str
