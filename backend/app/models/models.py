from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from ..database.database import Base
from sqlalchemy_utils import UUIDType
import uuid

class User(Base):
    __tablename__ = 'users'
    
    id = Column(String(36), primary_key=True)  
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=True, index=True)
    password = Column(String(255), nullable=False)  

class CollectionType(Base):
    __tablename__ = 'collection_types'
    
    id = Column(String(36), primary_key=True)
    type = Column(String(50), unique=True, nullable=False, index=True)

class Collection(Base):
    __tablename__ = 'collections'
    
    id = Column(String(36), primary_key=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    type = Column(String(36), ForeignKey(CollectionType.id), nullable=False)
    
class ColumnType(Base):
    __tablename__ = 'column_types'
    
    id = Column(String(36), primary_key=True)
    type = Column(String(50), unique=True, nullable=False, index=True)

class Column(Base):  
    __tablename__ = 'columns' 
    
    id = Column(String(36), primary_key=True)
    collection = Column(String(36), ForeignKey(Collection.id), nullable=False, index=True)
    column = Column(String(100), nullable=False, index=True)  
    type = Column(String(36), ForeignKey(ColumnType.id), nullable=False)
