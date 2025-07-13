from fastapi import Depends, HTTPException

from sqlalchemy import Table, inspect, Column
from sqlalchemy.orm import Session
from ..database.database import metadata, get_db, SQLALCHEMY_TYPE_MAP, get_table, Session
from ..schemas.schemas import CollectionCreateRequest

class CollectionService:
    def __init__(self, db: Session = Depends(get_db)):
        self.db = db

    def list(self):
        try:
            inspector = inspect(self.db.bind)
            tables = inspector.get_table_names()
            return {"collections": tables}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to list collections: {e}")
        
    def create(self, request: CollectionCreateRequest):
        try:
            # Check if table already exists
            inspector = inspect(self.db.bind)
            if request.table_name in inspector.get_table_names():
                raise HTTPException(
                    status_code=400, 
                    detail=f"Collection '{self.request.table_name}' already exists"
                )
            
            # Build columns programmatically
            columns = []

            for col_def in self.request.columns:
                if col_def.type not in SQLALCHEMY_TYPE_MAP:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Unsupported column type: {col_def.type}"
                    )
                
                sqlalchemy_type = SQLALCHEMY_TYPE_MAP[col_def.type]
                
                column = Column(
                    col_def.name,
                    sqlalchemy_type,
                    nullable=col_def.nullable,
                    primary_key=col_def.primary_key
                )
                columns.append(column)
            
                
            # Create table using SQLAlchemy
            new_table = Table(request.table_name, metadata, *columns)
            new_table.create(self.db.bind)
            
            return {
                "message": f"Collection '{request.table_name}' created successfully",
                "columns": [{"name": col.name, "type": str(col.type)} for col in columns]
            }
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to create collection: {e}")
        
    def columns(self, collection_name: str):
        try:
            table = get_table(collection_name, self.db)

            columns = [
                {
                    "name": col.name,
                    "type": str(col.type),
                    "nullable": col.nullable,
                    "primary_key": col.primary_key
                }
                for col in table.columns
            ]

            return {"columns": columns}
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to get columns: {e}")
        
    def delete(self, collection_name: str):
        try:
            table = get_table(collection_name, self.db)
            table.drop(self.db.bind)
            
            # Remove from metadata to avoid conflicts
            if collection_name in metadata.tables:
                metadata.remove(metadata.tables[collection_name])
            
            return {"message": f"Collection '{collection_name}' deleted successfully"}
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to delete collection: {e}")