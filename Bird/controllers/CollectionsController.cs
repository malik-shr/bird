using System.Text.Json;
using Bird.Shared;
using Microsoft.AspNetCore.Mvc;
using SqlKata.Execution;

namespace Bird.Controllers
{


    public record RuleData
    (
        string viewRule,
        string createRule,
        string deleteRule,
        string updateRule
    );

    public record CreateCollectionBody (
        string tableName,
        FieldProps[] fields,
        string type,
        RuleData ruleData
    );

    [ApiController]
    [Route("api/[controller]")]
    public class CollectionsController : ControllerBase
    {
        private readonly QueryFactory _db;

        public CollectionsController(QueryFactory db)
        {
            this._db = db;
        }

        [HttpGet]
        public object ListCollections()
        {
            var collections =  _db
                .Query("collections_meta")
                .Select("id", "name", "type", "is_system")
                .Get<CollectionMeta>();

            return new { collections };
        }

        [HttpGet("{collectionName}")]
        public object ViewCollection(string collectionName)
        {
            var collection = _db
                .Query("collections_meta")
                .Select()
                .Where("name", collectionName)
                .First<CollectionMeta>();

            var fieldResponse = _db
                .Query("fields_meta")
                .Select()
                .Where("collection", collection.id)
                .Get<FieldMeta>();

            var authRules = _db
                .Query("auth_rules")
                .Select()
                .Where("collection", collection.id)
                .Get();

            var fields = new List<Field>();

            foreach (var field in fieldResponse)
            {
                var optionsResponse = _db
                    .Query("select_options")
                    .Select("value", "text") // fixed select syntax
                    .Where("collection", collection.id) // fixed variable usage
                    .Where("field", field.id)
                    .Get<FieldOption>();

                fields.Add(
                    new Field(
                        new FieldProps
                        {
                            Id = field.id,
                            Name = field.name,
                            Type = field.type,
                            RelationCollection = field.relation_collection,
                            IsPrimaryKey = field.is_primary_key,
                            IsHidden = field.is_hidden,
                            IsUnique = field.is_unique,
                            IsRequired = field.is_required,
                            Options = [.. optionsResponse] // fixed
                        }
                    )
                );
            }

            return new { fields, authRules };
        }

        [HttpPost]
        public object CreateCollection([FromBody] CreateCollectionBody body)
        {
            var newCollection = new Collection(body.tableName, body.type).SetRuleData();

            foreach (var field in body.fields)
            {
                newCollection.AddField(field);
            }

            newCollection.CreateTable(_db);
            newCollection.InsertMetaData(_db);

            return new { collection=newCollection };
        }
    }
}