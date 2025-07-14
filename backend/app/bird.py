from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware

from .models import models
from .database.database import engine
from .routes import collections, records

class Bird(FastAPI):
    def __init__(self):
        super().__init__()  # Initialize FastAPI
        self._setup_database()
        self._setup_cors()
        self._register_routes()
    
    def _setup_database(self):
        models.Base.metadata.create_all(bind=engine)
    
    def _setup_cors(self):
        origins = [
            "http://localhost:80",
            "http://localhost:5173",
            "http://localhost:5174",
            "http://localhost:8080"
        ]

        self.add_middleware(
            CORSMiddleware,
            allow_origins=origins,
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

    def _register_routes(self):
        @self.get("/api")
        def hello_world():
            return {"message": "Hello World"}
        
        self.include_route(collections.router)
        self.include_route(records.router)

    def include_route(self, router: APIRouter):
        self.include_router(router)