from fastapi import APIRouter, HTTPException
from sqlalchemy import select, Table
from typing import List, Dict, Any

from .schemas.schemas import CollectionCreateRequest 
from ..database.database import Metadata, Engine
from ..core.collection_model import Field, new_collection

from ..core.store import Collections

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

def list_collections():
    """Get all collections."""
    try:
        with Engine.begin() as conn:
            collections_meta_table = Table("collections_meta", Metadata, autoload_with=Engine)
            result = conn.execute(select(collections_meta_table.c.name))
            # Extract only the name values
            collections = [row["name"] for row in result.mappings()]
            return {"collections": collections}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list collections: {e}")


def create_collection(request: CollectionCreateRequest) -> Dict[str, Any]:
    """Create a new collection."""
    try:
        fields = []
        for field in request.fields:
            fields.append(
                Field(
                    name = field.name, 
                    type = field.type,
                    secure = field.secure,
                    system = False,
                    hidden = field.hidden,
                    required = field.required,
                    primary_key = field.primary_key
                )
            )
        
        collection = new_collection(request.table_name, request.type, fields)
        collection.create_table()
        collection.insert_metadata()
        
        return {
            "message": f"Collection '{request.table_name}' created successfully",
            "columns": [{"name": col.name, "type": str(col.type)} for col in collection.fields]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create collection: {e}")


def collection_columns(collection_name: str) -> Dict[str, List[Dict[str, Any]]]:
    """Get collection schema/columns."""
    try:
        collection = Collections[collection_name]
        for field in collection.fields:
            print(field.name)
        columns = [
            {
                "name": field.name,
                "type": field.type,
                "required": field.required,
                "primary_key": field.primary_key
            }
            for field in collection.fields
        ]
        
        return {"columns": columns}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get columns: {e}")


def delete_collection(collection_name: str) -> Dict[str, str]:
    """Delete a collection."""
    try:
        collection = Collections[collection_name]

        collection.delete()
        
        return {"message": f"Collection '{collection_name}' deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete collection: {e}")


