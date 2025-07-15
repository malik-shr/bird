import bcrypt
from fastapi import Depends, HTTPException, status, APIRouter
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from typing import Annotated
from sqlalchemy.orm import Session
from .record import list_records
from ..database.database import get_db

router = APIRouter(
    prefix="/api/auth",
    tags=["auth"],
    responses={404: {"description": "Auth not found"}},
)

security = HTTPBasic()

def get_current_username(
    credentials: Annotated[HTTPBasicCredentials, Depends(security)],
    db: Session = Depends(get_db)
):
    username = credentials.username
    password = credentials.password.encode("utf-8")

    records = list_records("users", 1, fields = "password", filter = f"username={username}", db = db)
    user = records["records"][0]

    if user is None or not bcrypt.checkpw(password, user["password"].encode("utf-8")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Basic"},
        )

    return username

@router.get("/")
def read_current_user(username: Annotated[str, Depends(get_current_username)]):
    return {"username": username}