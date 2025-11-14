from pydantic import BaseModel


class TokenResponse(BaseModel):
    token: str


class InputData(BaseModel):
    init_data: str
