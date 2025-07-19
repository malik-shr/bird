from pydantic import BaseModel
from typing import Dict, Any, List, Optional

class ColumnDefinition(BaseModel):
    name: str
    type: str
    nullable: Optional[bool] = True  
    primary_key: bool = False  

class CollectionCreateRequest(BaseModel):
    table_name: str
    columns: List[ColumnDefinition]
    type: str

class CreateRecordRequest(BaseModel):
    values: Dict[str, Any]

class UpdateRecordRequest(BaseModel):
    values: Dict[str, Any]