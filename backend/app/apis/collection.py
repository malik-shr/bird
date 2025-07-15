from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import Table, inspect, Column
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from ..schemas.schemas import CollectionCreateRequest
from ..database.database import metadata, get_db, SQLALCHEMY_TYPE_MAP, get_table

def bind_collection_api():
    router = APIRouter(
        prefix="/api/collections",
        tags=["collections"],
        responses={404: {"description": "Collection not found"}},
    )
    
    router.get("/", response_model=Dict[str, List[str]])(list_collections)
    router.post("/", status_code=201)(create_collection)
    router.get("/{collection_name}")(collection_columns)
    router.delete("/{collection_name}")(delete_collection)

    return router


def list_collections(db: Session = Depends(get_db)) -> Dict[str, List[str]]:
    """Get all collections."""
    try:
        inspector = inspect(db.bind)
        tables = inspector.get_table_names()
        return {"collections": tables}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list collections: {e}")


def create_collection(request: CollectionCreateRequest, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Create a new collection."""
    try:
        # Check if table already exists
        inspector = inspect(db.bind)
        if request.table_name in inspector.get_table_names():
            raise HTTPException(
                status_code=400, 
                detail=f"Collection '{request.table_name}' already exists"
            )
        
        # Build columns programmatically
        columns = []
        for col_def in request.columns:
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
        new_table.create(db.bind)
        
        return {
            "message": f"Collection '{request.table_name}' created successfully",
            "columns": [{"name": col.name, "type": str(col.type)} for col in columns]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create collection: {e}")


def collection_columns(collection_name: str, db: Session = Depends(get_db)) -> Dict[str, List[Dict[str, Any]]]:
    """Get collection schema/columns."""
    try:
        table = get_table(collection_name, db)
        
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


def delete_collection(collection_name: str, db: Session = Depends(get_db)) -> Dict[str, str]:
    """Delete a collection."""
    try:
        table = get_table(collection_name, db)
        table.drop(db.bind)
        
        # Remove from metadata to avoid conflicts
        if collection_name in metadata.tables:
            metadata.remove(metadata.tables[collection_name])
        
        return {"message": f"Collection '{collection_name}' deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete collection: {e}")


