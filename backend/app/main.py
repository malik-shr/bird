from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import Annotated
from sqlalchemy.orm import Session

from . import models
from .database import engine

from .routes import collections

app = FastAPI()
models.Base.metadata.create_all(bind=engine)

origins = [
    "http://localhost:80",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:8080"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(collections.router)

@app.get("/api")
def hello_world():
    return {"message:" "Hello World"}
