from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware

from sqlalchemy import select, Table

from .models.models import system_tables
from .database.database import Metadata, engine
from .apis.collection import bind_collection_api
from .apis.record import bind_record_api
from .apis import auth
from .core.collection_model import new_collection, Field
from .core.store import Fields, Collections

class Bird(FastAPI):
    def __init__(self):
        super().__init__()  # Initialize FastAPI
        self._setup_database()
        self._setup_cors()
        self._register_routes()
        self._setup_metadata()
    
    def _setup_database(self):
        for table in system_tables:
            table.create_table() 

        for table in system_tables:
            table.insert_metadata()           

    def _setup_metadata(self):
        with engine.begin() as conn:
            collections_meta_table = Table("collections_meta", Metadata, autoload_with=engine)
            fields_meta_table = Table("fields_meta", Metadata, autoload_with=engine)

            collections_meta_data = conn.execute(
                select(
                    collections_meta_table.c.id, 
                    collections_meta_table.c.name, 
                    collections_meta_table.c.type, 
                    collections_meta_table.c.require_auth, 
                    collections_meta_table.c.description, 
                    collections_meta_table.c.system
                )
            )
            collections_meta = collections_meta_data.mappings().all()
            import logging
            logging.basicConfig(level=logging.INFO)
            
            for collection_meta in collections_meta:
                collection_fields = []

                field_meta_data = conn.execute(
                    select(
                        fields_meta_table.c.id,
                        fields_meta_table.c.name,
                        fields_meta_table.c.type,
                        fields_meta_table.c.secure,
                        fields_meta_table.c.system,
                        fields_meta_table.c.hidden,
                        fields_meta_table.c.required,
                        fields_meta_table.c.primary_key,
                        fields_meta_table.c.index
                    )
                    .where(fields_meta_table.c.collection == collection_meta.id)
                )

                fields_meta = field_meta_data.mappings().all()

                for field_meta in fields_meta:
                    field =                         Field(
                            id = field_meta.id,
                            name = field_meta.name,
                            type = field_meta.type,
                            collection = collection_meta.id,
                            secure = field_meta.secure,
                            system = field_meta.system,
                            hidden = field_meta.hidden,
                            required = field_meta.required,
                            primary_key = field_meta.primary_key,
                            index = field_meta.index
                        )
                    collection_fields.append(field)
                    Fields[field_meta.name] = field
                
                Collections[collection_meta.name] = new_collection(collection_meta.name, collection_meta.type, collection_fields)
                
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
        
        self.include_route(bind_record_api())
        self.include_route(bind_collection_api())
        self.include_route(auth.router)

    def include_route(self, router: APIRouter):
        self.include_router(router)

    def start(self):
        return "start"

    