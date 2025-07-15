from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any
import uuid
import bcrypt

from ..schemas.schemas import CreateRecordRequest, UpdateRecordRequest
from ..database.database import get_db, validate_columns, get_table, parse_filter_expression

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
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """List records from a collection with optional filtering and field selection."""
    try:
        table = get_table(collection_name, db)
        
        # Field selection
        if fields:
            field_list = [field.strip() for field in fields.split(',')]
            validate_columns(table, field_list)
            selected_columns = [table.c[field] for field in field_list]
            stmt = select(*selected_columns).select_from(table)
        else:
            stmt = select(*table.columns).select_from(table)
        
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
        result = db.execute(stmt)
        
        # Convert rows to dictionaries
        records = [dict(row._mapping) for row in result]
        
        return {
            "records": records,
            "count": len(records),
            "limit": limit,
            "offset": offset
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get records: {e}")

def create_record(
    collection_name: str, 
    request: CreateRecordRequest,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Create a new record in a collection."""
    try:
        table = get_table(collection_name, db)

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
        db.execute(stmt)
        db.commit()

        return {
            "message": "Record created successfully",
            "values": {k: v for k, v in values.items() if k != "password"}  # don't return hashed password
        }

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create record: {e}")


def get_record(
    collection_name: str, 
    id: str, 
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Get a single record by ID."""
    try:
        table = get_table(collection_name, db)
        
        stmt = table.select().where(table.c.id == id)
        result = db.execute(stmt)
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
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Update an existing record."""
    try:
        table = get_table(collection_name, db)
        
        # Validate columns
        validate_columns(table, list(request.values.keys()))
        
        # Check if record exists
        check_stmt = table.select().where(table.c.id == id)
        existing = db.execute(check_stmt).first()
        if not existing:
            raise HTTPException(status_code=404, detail=f"Record with id '{id}' not found")
        
        # Update the record
        stmt = table.update().where(table.c.id == id).values(**request.values)
        result = db.execute(stmt)
        db.commit()
        
        return {
            "message": "Record updated successfully",
            "id": id,
            "updated_values": request.values
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update record: {e}")


def delete_record(
    collection_name: str, 
    id: str, 
    db: Session = Depends(get_db)
) -> Dict[str, str]:
    """Delete a record by ID."""
    try:
        table = get_table(collection_name, db)
        
        # Check if record exists
        check_stmt = table.select().where(table.c.id == id)
        existing = db.execute(check_stmt).first()
        if not existing:
            raise HTTPException(status_code=404, detail=f"Record with id '{id}' not found")
        
        # Delete the record
        stmt = table.delete().where(table.c.id == id)
        result = db.execute(stmt)
        db.commit()
        
        return {"message": f"Record with id '{id}' deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete record: {e}")