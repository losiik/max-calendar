from pydantic import BaseModel


class TokenResponse(BaseModel):
    token: str


class InputData(BaseModel):
    input_data: str
