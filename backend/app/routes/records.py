from fastapi import APIRouter, Depends
from typing import Optional
from ..schemas.schemas import CreateRecordRequest, UpdateRecordRequest
from ..services.record_service import RecordService

router = APIRouter(
    prefix="/api/collections",
    tags=["collections"],
    responses={404: {"description": "nothing found in collection service"}},
)

@router.get("/{collection_name}/records")
def list(
    collection_name: str, 
    limit: Optional[int] = 100,
    offset: Optional[int] = 0,
    fields: Optional[str] = None,
    filter: Optional[str] = None,
    recordService: RecordService = Depends()
):
    result = recordService.list(
        collection_name, 
        limit, 
        offset, 
        fields, 
        filter
    )

    return result
    
@router.post("/{collection_name}/records")
def create(
    collection_name: str, 
    request: CreateRecordRequest, 
    recordService: RecordService = Depends()
):
    result = recordService.create(collection_name, request)

    return result


@router.get("/{collection_name}/records/{id}")  # Get record
def getOne(collection_name: str, id: str, recordService: RecordService = Depends()):
    result = recordService.getOne(collection_name, id)

    return result

@router.patch("/{collection_name}/records/{id}")  # Update Record
def update(
    collection_name: str, 
    id: str, 
    request: UpdateRecordRequest,
    recordService: RecordService = Depends(),
):
    result = recordService.update(collection_name, id, request)

    return result
    
    

@router.delete("/{collection_name}/records/{id}")  # Delete Record
def delete(collection_name: str, id: str, recordService: RecordService = Depends()):
    result = recordService.delete(collection_name, id)

    return result