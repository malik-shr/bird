import os
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
import logging

logging.getLogger('passlib').setLevel(logging.ERROR)

SECRET_KEY = os.environ["SECRET_KEY"]
ALGORITHM = os.environ["ALGORITHM"]
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ["ACCESS_TOKEN_EXPIRE_MINUTES"])

PwdContext = CryptContext(schemes=["bcrypt"], deprecated="auto")
OAuth2Scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")

def verify_password(plain_password, hashed_password):
    return PwdContext.verify(plain_password, hashed_password)

def get_password_hash(password):
    return PwdContext.hash(password)