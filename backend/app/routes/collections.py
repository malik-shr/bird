from fastapi import APIRouter, Depends
from ..schemas.schemas import CollectionCreateRequest
from ..services.collection_service import CollectionService

router = APIRouter(
    prefix="/api/collections",
    tags=["collections"],
    responses={404: {"description": "nothing found in collection service"}},
)
 
@router.get("/") 
def list(collectionService: CollectionService = Depends()):
    result = collectionService.list()

    return result

@router.post("/")  
def create(request: CollectionCreateRequest, collectionService: CollectionService = Depends()):
    result = collectionService.create(request)

    return result    

@router.get("/{collection_name}")
def columns(collection_name: str, collectionService: CollectionService = Depends()):
    result = collectionService.columns(collection_name)

    return result

@router.delete("/{collection_name}")  # Delete Collection
def delete(collection_name: str, collectionService: CollectionService = Depends()):
    result = collectionService.delete(collection_name)

    return result

