from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import inspect, engine
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from ..schemas.schemas import CollectionCreateRequest
from ..database.database import Metadata, get_db, get_table
from ..core.collection_model import Field, new_collection

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


def create_collection(request: CollectionCreateRequest) -> Dict[str, Any]:
    """Create a new collection."""
    try:
        # Check if table already exists
        inspector = inspect(engine)
        if request.table_name in inspector.get_table_names():
            raise HTTPException(status_code=400, detail=f"Collection '{request.table_name}' already exists")
        
        fields = []
        for column in request.columns:
            fields.append(
                Field(
                    name = column.name, 
                    type = column.type,
                    secure = False,
                    is_system = False,
                    hidden=False,
                    required=column.nullable,
                    primary_key=column.primary_key
                )
            )
        
        collection = new_collection(request.table_name, request.type, fields)
        collection.create()
        
        return {
            "message": f"Collection '{request.table_name}' created successfully",
            "columns": [{"name": col.name, "type": str(col.type)} for col in collection.fields]
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
        if collection_name in Metadata.tables:
            Metadata.remove(Metadata.tables[collection_name])
        
        return {"message": f"Collection '{collection_name}' deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete collection: {e}")


