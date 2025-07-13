from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
from ..database.database import Base
from sqlalchemy_utils import UUIDType
import uuid

class User(Base):
    __tablename__ = 'users'

    id = Column('id', String, primary_key=True)
    username = Column(String, index=True)
    email = Column(String, index=True)
    password = Column(String, index=True)