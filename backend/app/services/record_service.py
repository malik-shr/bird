from fastapi import Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session
from typing import Optional
from ..database.database import get_db, validate_columns, get_table, parse_filter_expression
from ..schemas.schemas import CreateRecordRequest, UpdateRecordRequest
import uuid

class RecordService:
    def __init__(self, db: Session = Depends(get_db)):
        self.db = db
    
    def list(    
        self,
        collection_name: str, 
        limit: Optional[int] = 100,
        offset: Optional[int] = 0,
        fields: Optional[str] = None,
        filter: Optional[str] = None,
    ):
        try:
            table = get_table(collection_name, self.db)
            
            # Debug: print table info
            print(f"Table: {table}")
            print(f"Table columns: {[col.name for col in table.columns]}")
            
            # Field selection
            if fields:
                field_list = [field.strip() for field in fields.split(',')]
                validate_columns(table, field_list)
                selected_columns = [table.c[field] for field in field_list]
                stmt = select(*selected_columns).select_from(table)
            else:
                # Explicitly select all columns
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
            
            # Debug: print the SQL
            print(f"SQL: {stmt}")
            
            # Execute query
            result = self.db.execute(stmt)
            
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

    def getOne(self, collection_name: str, id: str):
        try:
            table = get_table(collection_name, self.db)
            
            # Assume 'id' column exists - you might want to make this configurable
            stmt = table.select().where(table.c.id == id)
            result = self.db.execute(stmt)
            row = result.first()
            
            if not row:
                raise HTTPException(status_code=404, detail=f"Record with id '{id}' not found")
            
            return {"record": dict(row._mapping)}
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to get record: {e}")

    def create(self, collection_name: str, request: CreateRecordRequest):
        try:
            table = get_table(collection_name, self.db)
            
            # Auto-generate UUID for ID columns if not provided
            values = dict(request.values)

            values['id'] = str(uuid.uuid4())
                
            # Validate columns
            validate_columns(table, list(values.keys()))
            
            stmt = table.insert().values(**values)
            result = self.db.execute(stmt)
            self.db.commit()
            
            return {
                "message": "Record created successfully",
                "values": values
            }
        except HTTPException:
            raise
        except Exception as e:
            self.db.rollback()
            raise HTTPException(status_code=500, detail=f"Failed to create record: {e}")

    def update(self, collection_name: str, id: str, request: UpdateRecordRequest):
        try:
            table = get_table(collection_name, self.db)
            
            # Validate columns
            validate_columns(table, list(request.values.keys()))
            
            # Check if record exists
            check_stmt = table.select().where(table.c.id == id)
            existing = self.db.execute(check_stmt).first()
            if not existing:
                raise HTTPException(status_code=404, detail=f"Record with id '{id}' not found")
            
            # Update the record
            stmt = table.update().where(table.c.id == id).values(**request.values)
            result = self.db.execute(stmt)
            self.db.commit()
            
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
            self.db.rollback()
            raise HTTPException(status_code=500, detail=f"Failed to update record: {e}")

    def delete(self, collection_name: str, id: str):
        try:
            table = get_table(collection_name, self.db)
            
            # Check if record exists
            check_stmt = table.select().where(table.c.id == id)
            existing = self.db.execute(check_stmt).first()
            if not existing:
                raise HTTPException(status_code=404, detail=f"Record with id '{id}' not found")
            
            # Delete the record
            stmt = table.delete().where(table.c.id == id)
            result = self.db.execute(stmt)
            self.db.commit()
            
            if result.rowcount == 0:
                raise HTTPException(status_code=404, detail=f"Record with id '{id}' not found")
            
            return {"message": f"Record with id '{id}' deleted successfully"}
        except HTTPException:
            raise
        except Exception as e:
            self.db.rollback()
            raise HTTPException(status_code=500, detail=f"Failed to delete record: {e}")