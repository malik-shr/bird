from typing import List

from typing import List
from sqlalchemy import Table, Column, insert, select

from ..database.database import SQLALCHEMY_TYPE_MAP, Metadata, engine
import uuid
from .store import Collections, Fields

class Field:
    def __init__(self, name: str, type: str, secure: bool = False, system: bool = False, hidden: bool = False, required: bool = False, primary_key: bool = False, index: bool = False, id = None):
        self.name = name
        self.type = type

        self.secure = secure
        self.system = system
        self.hidden = hidden

        self.required = required
        self.primary_key = primary_key

        self.index = index

        self.id = id

        if(id == None):
            self.id = str(uuid.uuid4())

    def column(self):
        sqlalchemy_type = SQLALCHEMY_TYPE_MAP[self.type]

        return Column(
            self.name,
            sqlalchemy_type,
            nullable=not self.required,
            primary_key=self.primary_key,
            index=self.index
        )
    
    def insert_metadata(self, collection_id):
        fields_meta_table = Table("fields_meta", Metadata, autoload_with=engine)
        
        with engine.begin() as conn:
            existing_field = conn.execute(
                select(fields_meta_table.c.id)
                .where(fields_meta_table.c.name == self.name)
                .where(fields_meta_table.c.collection == collection_id)
            ).first()
                            
            if not existing_field:
                conn.execute(
                    insert(fields_meta_table).values(
                        id=self.id,
                        name = self.name,
                        type = self.type,
                        collection = collection_id,
                        secure = self.secure,
                        system = self.system,
                        hidden = self.hidden,
                        required = self.required,
                        primary_key = self.primary_key,
                        index = self.index
                    )
                )
                Fields[self.name] = self

class Collection:
    def __init__(self, name: str, type_: str, fields: List[Field], system = False, id: str = None):
        self.name = name
        self.collection_type = type_
        self.fields = list(fields)
        self.fields.append(
            Field("id", "String", secure=True, system=True, hidden=False, required=True, primary_key=True, index=True)
        )
        self.system = system
        self.id = id
        if id == None:
            self.id = str(uuid.uuid4())

    def columns(self):
        return [field.column() for field in self.fields]

    def create_table(self):
        new_table = Table(self.name, Metadata, *self.columns())
        new_table.create(bind=engine, checkfirst=True)

    def insert_metadata(self):
        collections_meta_table = Table("collections_meta", Metadata, autoload_with=engine)
        
        with engine.begin() as conn:
            # Check if collection already exists in metadata
            existing = conn.execute(
                select(collections_meta_table.c.name)
                .where(collections_meta_table.c.name == self.name)
            ).first()

            if not existing:
                conn.execute(
                    insert(collections_meta_table).values(
                        id=self.id,
                        name=self.name,
                        type=self.collection_type,
                        description="",
                        require_auth=False,
                        system=self.system,
                    )
                )
                Collections[self.name] = self
     
            for field in self.fields:
                field.insert_metadata(self.id)

    def delete(self):
        if getattr(self, 'system', False):
            raise PermissionError(f"Cannot delete system collection: {self.name}")

        # Drop the actual collection table
        table_to_drop = Table(self.name, Metadata, autoload_with=engine)
        table_to_drop.drop(bind=engine, checkfirst=True)

        # Delete from collections_meta
        collections_table = Table("collections_meta", Metadata, autoload_with=engine)
        fields_table = Table("fields_meta", Metadata, autoload_with=engine)
        with engine.begin() as conn:
            delete_stmt = (
                collections_table.delete()
                .where(collections_table.c.name == self.name)
            )
            conn.execute(delete_stmt)

            conn.execute(
                fields_table.delete()
                .where(fields_table.c.collection == self.id)
            )

class AuthCollection(Collection):
    def __init__(self, name, type_, fields):
        super().__init__(name, type_, fields)
        self.fields += [
            Field("username", "String"),
            Field("email", "String"),
            Field("password", "String", secure=True, hidden=True, required=True)
        ]

class BaseCollection(Collection):
    pass

class ViewCollection(Collection):
    pass

# Factory
def new_collection(name, type_, fields = []):
    return {
        "base": BaseCollection,
        "auth": AuthCollection,
        "view": ViewCollection
    }.get(type_, Collection)(name, type_, fields)
