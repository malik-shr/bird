from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, Table, and_
from sqlalchemy.orm import Session
from sqlalchemy.exc import NoSuchTableError

from typing import Optional, Dict, Any
import uuid
import bcrypt

from .schemas.schemas import CreateRecordRequest, UpdateRecordRequest
from ..database.database import Metadata, Engine
from ..utils.utils import validate_columns, parse_filter_expression

def bind_record_api() -> None:
    router = APIRouter(
        prefix="/api/collections/{collection_name}",
        tags=["record"],
        responses={404: {"description": "Record not found"}},
    )
    
    router.get("/records")(list_records)
    router.post("/records", status_code=201)(create_record)
    router.get("/records/{id}")(get_record)
    router.patch("/records/{id}")(update_record)
    router.delete("/records/{id}")(delete_record)

    return router

def list_records(
    collection_name: str, 
    limit: Optional[int] = 100,
    offset: Optional[int] = 0,
    fields: Optional[str] = None,
    filter: Optional[str] = None,
) -> Dict[str, Any]:
    """List records from a collection with optional filtering and field selection."""
    try:
        table = Table(collection_name, Metadata, autoload_with=Engine)
        collections_meta_table = Table("collections_meta", Metadata, autoload_with=Engine)
        field_meta_table = Table("fields_meta", Metadata, autoload_with=Engine)

        with Engine.begin() as conn:
            if fields:
                # Manual field selection
                field_list = [field.strip() for field in fields.split(',')]
                validate_columns(table, field_list)
                selected_columns = [table.c[field] for field in field_list]
            else:
                # Query fieldmeta to find non-hidden fields
                meta_query = (
                    select(field_meta_table.c.name)
                    .select_from(
                        field_meta_table.join(
                            collections_meta_table,
                            field_meta_table.c.collection == collections_meta_table.c.id
                        )
                    )
                    .where(
                        and_(
                            collections_meta_table.c.name == collection_name,
                            field_meta_table.c.hidden == False
                        )
                    )
                )
                
                fields = conn.execute(meta_query)
                visible_fields = [field.name for field in fields]
                
                if not visible_fields:
                    raise HTTPException(status_code=400, detail="No visible fields for this collection.")
                
                selected_columns = [table.c[field] for field in visible_fields if field in table.c]
            
            # Build main SELECT statement
            stmt = select(*selected_columns).select_from(table)
            
            # Filtering
            if filter:
                try:
                    where_condition = parse_filter_expression(filter, table)
                    stmt = stmt.where(where_condition)
                except ValueError as e:
                    raise HTTPException(status_code=400, detail=str(e))
            
            # Apply limit and offset
            stmt = stmt.limit(limit).offset(offset)

            # Execute query
            result = conn.execute(stmt)
            records = [dict(row._mapping) for row in result]

            return {
                "records": records,
                "count": len(records),
                "limit": limit,
                "offset": offset
            }
    
    except HTTPException:
        raise
    except NoSuchTableError:
        raise HTTPException(status_code=404, detail=f"Collection '{collection_name}' does not exist.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get records: {e}")

def create_record(
    collection_name: str, 
    request: CreateRecordRequest,
) -> Dict[str, Any]:
    """Create a new record in a collection."""
    try:
        table = Table(collection_name, Metadata, autoload_with=Engine)

        # Convert request to dict and assign UUID
        values = dict(request.values)
        values['id'] = str(uuid.uuid4())

        # Validate columns
        validate_columns(table, list(values.keys()))

        password = values.get("password")
        if password:
            # bcrypt requires bytes; hashpw returns hashed bytes
            hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
            values["password"] = hashed.decode("utf-8")  # store as string in DB
        
        stmt = table.insert().values(**values)

        with Engine.begin() as conn:
            conn.execute(stmt)
            conn.commit()

            return {
                "message": "Record created successfully",
                "values": {k: v for k, v in values.items() if k != "password"}  # don't return hashed password
            }

    except HTTPException:
        raise

def get_record(
    collection_name: str, 
    id: str, 
) -> Dict[str, Any]:
    """Get a single record by ID."""
    try:
        table = Table(collection_name, Metadata, autoload_with=Engine)
        
        stmt = table.select().where(table.c.id == id)

        with Engine.begin() as conn:
            result = conn.execute(stmt)
            row = result.first()
            
        if not row:
            raise HTTPException(status_code=404, detail=f"Record with id '{id}' not found")
        
        return {"record": dict(row._mapping)}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get record: {e}")


def update_record(
    collection_name: str, 
    id: str, 
    request: UpdateRecordRequest,
) -> Dict[str, Any]:
    """Update an existing record."""
    try:
        table = Table(collection_name, Metadata, autoload_with=Engine)
        
        # Validate columns
        validate_columns(table, list(request.values.keys()))
        
        with Engine.begin() as conn:
            # Check if record exists
            check_stmt = table.select().where(table.c.id == id)
            existing = conn.execute(check_stmt).first()
            if not existing:
                raise HTTPException(status_code=404, detail=f"Record with id '{id}' not found")
            
            # Update the record
            stmt = table.update().where(table.c.id == id).values(**request.values)
            with Engine.begin() as conn:
                conn.execute(stmt)
                conn.commit()
            
                return {
                    "message": "Record updated successfully",
                    "id": id,
                    "updated_values": request.values
                }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update record: {e}")


def delete_record(
    collection_name: str, 
    id: str, 
) -> Dict[str, str]:
    """Delete a record by ID."""
    try:
        table = Table(collection_name, Metadata, autoload_with=Engine)
        with Engine.begin() as conn:
            # Check if record exists
            check_stmt = table.select().where(table.c.id == id)
            existing = conn.execute(check_stmt).first()
            if not existing:
                raise HTTPException(status_code=404, detail=f"Record with id '{id}' not found")
            
            # Delete the record
            stmt = table.delete().where(table.c.id == id)

            conn.execute(stmt)
            conn.commit()
        
        return {"message": f"Record with id '{id}' deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete record: {e}")