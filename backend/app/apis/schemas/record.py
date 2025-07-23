from pydantic import BaseModel
from typing import Dict, Any

class CreateRecordRequest(BaseModel):
    values: Dict[str, Any]

class UpdateRecordRequest(BaseModel):
    values: Dict[str, Any]