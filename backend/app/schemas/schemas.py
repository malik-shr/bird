from pydantic import BaseModel
from typing import Dict, Any, List, Optional

class ColumnDefinition(BaseModel):
    name: str
    type: str
    nullable: Optional[bool] = True  # or False, depending on your default preference
    primary_key: bool = False  # default to False

class CollectionCreateRequest(BaseModel):
    table_name: str
    columns: List[ColumnDefinition]
    type: str

class CreateRecordRequest(BaseModel):
    values: Dict[str, Any]

class UpdateRecordRequest(BaseModel):
    values: Dict[str, Any]