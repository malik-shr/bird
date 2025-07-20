from pydantic import BaseModel
from typing import Dict, Any, List, Optional

class FieldDefinition(BaseModel):
    name: str
    type: str
    required: Optional[bool] = False  
    primary_key: bool = False  
    secure: bool = False
    hidden: bool = False

class CollectionCreateRequest(BaseModel):
    table_name: str
    fields: List[FieldDefinition]
    type: str

class CreateRecordRequest(BaseModel):
    values: Dict[str, Any]

class UpdateRecordRequest(BaseModel):
    values: Dict[str, Any]