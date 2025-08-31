using System.Data.Common;
using Microsoft.Extensions.Options;
using SqlKata.Execution;

namespace Bird.Core
{
    public class Collection
    {
        public async Task<object> ListCollections(QueryFactory db)
        {
            var collections = await db
                .Query("collections_meta")
                .Select("id", "name", "type", "is_system")
                .GetAsync<CollectionMeta>();

            return new { collections };
        }

        public async Task<object> ViewCollection(string collectionName, QueryFactory db)
        {
            var collectionResponse = await db
                .Query("collections_meta")
                .Select()
                .Where("name", collectionName)
                .GetAsync<CollectionMeta>();

            var collection = collectionResponse.First();

            var fieldResponse = await db
                .Query("fields_meta")
                .Select()
                .Where("collection", collection.id)
                .GetAsync<FieldMeta>();

            var authRules = await db
                .Query("auth_rules")
                .Select()
                .Where("collection", collection.id)
                .GetAsync(); 

            var fields = new List<Field>();

            foreach (var field in fieldResponse)
            {
                var optionsResponse = await db
                    .Query("select_options")
                    .Select("value", "text") // fixed select syntax
                    .Where("collection", collection.id) // fixed variable usage
                    .Where("field", field.id)
                    .GetAsync<FieldOption>();

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
                            Options = optionsResponse.ToList() // fixed
                        }
                    )
                );
            }

            Console.WriteLine(fields);

            return new { fields, authRules };
        }

    }
}