from pydantic import BaseModel

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str | None = None

class User(BaseModel):
    id: str
    username: str
    email: str
    disabled: bool
    role: int

class UserInDB(User):
    password: str