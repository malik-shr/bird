from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import Table, inspect, Column, Integer
from sqlalchemy.orm import Session
from typing import Optional
from ..database import metadata, get_db, SQLALCHEMY_TYPE_MAP, validate_columns, get_table, parse_filter_expression
from ..schemas import CollectionCreateRequest, CreateRecordRequest, UpdateRecordRequest

router = APIRouter(
    prefix="/api/collections",
    tags=["collections"],
    responses={404: {"description": "nothing found in collection service"}},
)
 
@router.get("/")  # List Collections
def list_collections(db: Session = Depends(get_db)):
    try:
        inspector = inspect(db.bind)
        tables = inspector.get_table_names()
        return {"collections": tables}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list collections: {e}")

@router.post("/")  # Create Collection
def create_collection(request: CollectionCreateRequest, db: Session = Depends(get_db)):
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
        
        # Add default id column if no primary key specified
        has_primary_key = any(col.primary_key for col in columns)
        if not has_primary_key:
            id_column = Column('id', Integer, primary_key=True, autoincrement=True)
            columns.insert(0, id_column)
        
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

@router.delete("/{collection_name}")  # Delete Collection
def delete_collection(collection_name: str, db: Session = Depends(get_db)):
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

@router.get("/{collection_name}/records")  # Get Records
def get_records(
    collection_name: str, 
    limit: Optional[int] = 100,
    offset: Optional[int] = 0,
    fields: Optional[str] = None,  # Comma-separated field names
    filter: Optional[str] = None,  # Filter in format: field:operator:value
    db: Session = Depends(get_db)
):
    try:
        table = get_table(collection_name, db)
        
        # Build the base query
        stmt = table.select()
        
        # Field selection
        if fields:
            field_list = [field.strip() for field in fields.split(',')]
            # Validate fields exist
            validate_columns(table, field_list)
            # Select only specified fields
            selected_columns = [table.c[field] for field in field_list]
            stmt = stmt.with_only_columns(*selected_columns)
        
        # Filtering - support complex WHERE clause expressions
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
        records = []
        for row in result:
            records.append(dict(row._mapping))
        
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

@router.post("/{collection_name}/records")  # Create Record
def create_record(
    collection_name: str, 
    request: CreateRecordRequest, 
    db: Session = Depends(get_db)
):
    try:
        table = get_table(collection_name, db)
        
        # Validate columns
        validate_columns(table, list(request.values.keys()))
        
        stmt = table.insert().values(**request.values)
        result = db.execute(stmt)
        db.commit()
        
        return {
            "message": "Record created successfully",
            "id": result.lastrowid,
            "values": request.values
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create record: {e}")

@router.get("/{collection_name}/records/{id}")  # Get record
def get_record(collection_name: str, id: str, db: Session = Depends(get_db)):
    try:
        table = get_table(collection_name, db)
        
        # Assume 'id' column exists - you might want to make this configurable
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

@router.patch("/{collection_name}/records/{id}")  # Update Record
def update_record(
    collection_name: str, 
    id: str, 
    request: UpdateRecordRequest,
    db: Session = Depends(get_db)
):
    """Update a specific record by ID"""
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
        
        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail=f"Record with id '{id}' not found")
        
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

@router.delete("/{collection_name}/records/{id}")  # Delete Record
def delete_record(collection_name: str, id: str, db: Session = Depends(get_db)):
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
        
        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail=f"Record with id '{id}' not found")
        
        return {"message": f"Record with id '{id}' deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete record: {e}")