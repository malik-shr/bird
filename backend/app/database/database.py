from sqlalchemy import create_engine, MetaData
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

URL_DATABASE = "sqlite:///./data.db"

Engine = create_engine(URL_DATABASE)

Base = declarative_base()
Metadata = MetaData()



