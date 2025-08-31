using Bird.Shared;
using SqlKata.Execution;

namespace Bird.Core
{
    public record CollectionMeta
    {
        public string id { get; init; }
        public string name { get; init; }
        public string type { get; init; }
        public string relation_alias { get; init; }
    }

    public record FieldMeta
    {
        public string id { get; init; }
        public string name { get; init; }
        public string type { get; init; }
        public string relation_collection { get; init; }
        public string collection { get; init; }
        public bool is_required { get; init; }
        public bool is_primary_key { get; init; }
        public bool is_hidden { get; init; }
        public bool is_unique { get; init; }
    }


    public class Record
    {
        public async Task createRecord(Dictionary<string, object> values, string collectionName, QueryFactory db)
        {
            var collection = await db
                .Query("collections_meta")
                .Select("*")
                .Where("name", collectionName)
                .Take(1)
                .GetAsync<CollectionMeta>();

            if (collection.First().type == "base")
            {
                Console.WriteLine("Wrong Collection type");
            }

            var id = IdGenerator.GenerateShortUuid();

            var fields = await db.Query("fields_meta").Select("*").Where("collection", "=", collection.First().id).GetAsync<FieldMeta>();

            foreach (var field in fields)
            {
                var value = values[field.name];

                if (field.type == "File" && value is FileInfo file)
                {
                    var filePath = $"bird_data/storage/{collectionName}/{id}/{file.Name}";
                    file.CopyTo(filePath, overwrite: true);

                    values[field.name] = $"{collectionName}/{id}/{file.Name}";
                }
            }

            values["id"] = id;
            await db.Query(collectionName).InsertAsync(values);
        }

        public async Task DeleteRecord(string collectionName, string id, QueryFactory db)
        {
            await db.Query(collectionName).AsDelete().Where("id", id).DeleteAsync();
        }

        public async Task<dynamic> GetRecord(string collectionName, string id, QueryFactory db)
        {
            var record = await db
                .Query(collectionName)
                .Select("*")
                .Where("id", id)
                .Take(1)
                .GetAsync();

            return record.First();
        }

        public async Task<object> ListRecords(string collectionName, string page, string pageSize, QueryFactory db)
        {
            var parsedPage = int.Parse(page);
            var parsedPageSize = int.Parse(pageSize);

            List<string> selectFields = [];
            var joinCounter = 0;

            var collectionResponse = await db
                .Query("collections_meta")
                .Select("id")
                .Where("name", collectionName)
                .GetAsync<CollectionMeta>();

            var collection = collectionResponse.First();

            var query = db.Query(collectionName);

            var fields = await db
                .Query("fields_meta")
                .Select()
                .WhereFalse("is_hidden")
                .Where("collection", collection.id)
                .GetAsync<FieldMeta>();

            foreach (var field in fields)
            {
                if (field.relation_collection != null)
                {
                    query = query.LeftJoin(
                    $"{field.relation_collection} as ref_{joinCounter}",
                    $"{collectionName}.{field.name}",
                    $"ref_{joinCounter}.id"
                    );

                    var relationCollectionMeta = await db
                    .Query("collections_meta")
                    .Select()
                    .Where("name", field.relation_collection)
                    .GetAsync<CollectionMeta>();

                    selectFields.Add(
                    $"ref_{joinCounter}.{relationCollectionMeta.First().relation_alias} as {field.name}"
                    );
                    ++joinCounter;
                }
                else if (field.type == "Select")
                {
                    query = query.LeftJoin($"select_options as ref_{joinCounter}", (join) =>
                    join
                        .On($"ref_{joinCounter}.collection", collection.id)
                        .On($"ref_{joinCounter}.field", field.id) // match field_id properly
                        .On(
                        $"ref_{joinCounter}.value",
                        $"{collectionName}.{field.name}" // must be a valid column ref
                        )
                    );

                    selectFields.Add($"ref_{joinCounter}.text as {field.name}");
                    ++joinCounter;
                }
                else
                {
                    selectFields.Add($"{collectionName}.{field.name}");
                }
            }

            Console.WriteLine(parsedPageSize + "\n\n\n\n\n");
            Console.WriteLine(parsedPage * parsedPageSize + "\n\n\n\n\n");

            query = query.Select();
            var records = await query
                // .Offset(parsedPage * parsedPageSize)
                // .Limit(parsedPageSize)
                .GetAsync();

            var totalCount = await db
                    .Query(collectionName)
                    .Select("id")
                    .AsCount()
                    .GetAsync<Length>();

            return new { records, totalCount = totalCount.First().count };
        }


    }
}