
using Bird.Shared;
using Microsoft.AspNetCore.Mvc;
using Microsoft.OpenApi.Expressions;
using SqlKata.Execution;

namespace Bird.Controllers
{
    public record CreateRecordBody(Dictionary<string, object> values);
    
    [ApiController]
    [Route("api/collections/{collectionName}/[controller]")]
    public class RecordsController : ControllerBase
    {
        private readonly QueryFactory _db;
         
        public RecordsController(QueryFactory db)
        {
            _db = db;
        }

        [HttpPost]
        public void CreateRecord(CreateRecordBody body, [FromRoute] string collectionName)
        {
            var collection = _db
                .Query("collections_meta")
                .Select("*")
                .Where("name", collectionName)
                .Take(1)
                .First<CollectionMeta>();

            if (collection.type == "base")
            {
                Console.WriteLine("Wrong Collection type");
            }

            var id = IdGenerator.GenerateShortUuid();

            var fields =  _db.Query("fields_meta").Select("*").Where("collection", "=", collection.id).Get<FieldMeta>();

            foreach (var field in fields)
            {
                var value = body.values[field.name];

                if (field.type == "File" && value is FileInfo file)
                {
                    var filePath = $"bird_data/storage/{collectionName}/{id}/{file.Name}";
                    file.CopyTo(filePath, overwrite: true);

                    body.values[field.name] = $"{collectionName}/{id}/{file.Name}";
                }
            }

            body.values["id"] = id;
            _db.Query(collectionName).Insert(body.values);
        }

        [HttpDelete("{id}")]
        public void DeleteRecord(string collectionName, string id)
        {
            _db.Query(collectionName).AsDelete().Where("id", id);
        }

        [HttpGet("{id}")]
        public dynamic GetRecord([FromRoute] string collectionName, [FromRoute] string id)
        {
            var record = _db
                .Query(collectionName)
                .Select("*")
                .Where("id", id)
                .Take(1)
                .First();

            return record;
        }

        [HttpGet]
        public object ListRecords([FromRoute] string collectionName,  [FromQuery] int page = 1, [FromQuery] int pageSize = 12)
        {
            List<string> selectFields = [];
            var joinCounter = 0;

            var collection = _db
                .Query("collections_meta")
                .Select("id")
                .Where("name", collectionName)
                .First<CollectionMeta>();



            var query = _db.Query(collectionName);

            var fields = _db
                .Query("fields_meta")
                .Select()
                .WhereFalse("is_hidden")
                .Where("collection", collection.id)
                .Get<FieldMeta>();

            foreach (var field in fields)
            {
                if (field.relation_collection != null)
                {
                    query = query.LeftJoin(
                    $"{field.relation_collection} as ref_{joinCounter}",
                    $"{collectionName}.{field.name}",
                    $"ref_{joinCounter}.id"
                    );

                    var relationCollectionMeta = _db
                    .Query("collections_meta")
                    .Select()
                    .Where("name", field.relation_collection)
                    .Get<CollectionMeta>();

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

            query = query.Select();
            var records = query
                // .Offset(parsedPage * parsedPageSize)
                // .Limit(parsedPageSize)
                .Get();

            var totalCount = _db
                    .Query(collectionName)
                    .Select("id")
                    .AsCount()
                    .First<Length>();

            return new { records, totalCount = totalCount.count };
        }
    }
}