from ..database.database import Metadata
from ..core.collection_model import Field, new_collection

user_table = new_collection(
    "users",
    "auth"
)

collection_meta_table = new_collection(
    "collections_meta",
    "base",
    [
        Field("name", "String", required=True, index=True),
        Field("type", "String", required=True, index=True),
        Field("description", "String"),
        Field("require_auth", "Boolean", required=True),
        Field("system", "Boolean", required=True)
    ]
)

field_meta_table = new_collection(
    "fields_meta",
    "base",
    [
        Field("name", "String", required=True, index=True),
        Field("type", "String", required=True, index=True),
        Field("collection", "String", required=True, index=True),
        Field("secure", "Boolean", required=True),
        Field("system", "Boolean", required=True, index=True),
        Field("hidden", "Boolean", required=True, index=True),
        Field("required", "Boolean", required=True, index=True),
        Field("primary_key", "Boolean", required=True, index=True),
        Field("index", "Boolean", required=True, index=True),
    ]
)
    
system_tables = {
    user_table,
    collection_meta_table,
    field_meta_table,
}

