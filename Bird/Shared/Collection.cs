using System.Diagnostics.Eventing.Reader;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication;
using SqlKata.Execution;



namespace Bird.Shared
{
    public record Length
    {
        public int count { get; init; }
    }

    public class Collection
    {
        private string id;
        private string name;
        private string description = string.Empty;
        private string relationAlias = string.Empty;
        private bool isSystem;
        private string type;
        private List<Field> fields;

        public Collection(string name, string type)
        {
            this.name = name;
            this.type = type;

            fields = [new Field(new FieldProps { Name = "id", Type = "String", IsRequired = true, IsPrimaryKey = true, IsUnique = true })];

            id = IdGenerator.GenerateShortUuid();
        }

        public void CreateTable(QueryFactory db)
        {
            var FieldTypes = new Dictionary<string, string>
                {
                    { "String", "text" },
                    { "Integer", "integer" },
                    { "Float", "float4" },
                    { "Boolean", "boolean" },
                    { "Date", "date" },
                    { "Select", "text" },
                    { "Relation", "text" },
                    { "File", "text" },
                    { "Markdown", "text" }
                };

            var columns = fields.Select(field =>
                $"{field.Name} {FieldTypes[field.Type]}" +
                (field.IsPrimaryKey ? " PRIMARY KEY" : "") +
                (field.IsRequired   ? " NOT NULL"    : "")
            );

            db.Statement($@"
                CREATE TABLE IF NOT EXISTS {name} (
                    {string.Join(", ", columns)}
                );
            ");

        }

        public async Task InsertMetaData(QueryFactory db)
        {
            if (!exists(db))
            {
                await db
                .Query("collections_meta")
                .InsertAsync(
                    new
                    {
                        id = id,
                        name = name,
                        type = type,
                        description = description,
                        is_system = isSystem,
                        relation_alias = relationAlias
                    }
                );

                foreach (var field in fields)
                {
                    await field.InsertMetaDataAsync(id, db);
                }
            }

        }

        private Boolean exists(QueryFactory db)
        {

            var result = db
                .Query("collections_meta")
                .Select("id")
                .AsCount()
                .Where("name", name)
                .First<Length>();

            return result.count != 0;
        }

        public Collection AddField(FieldProps props)
        {
            fields.Add(new Field(props));
            return this;
        }

        public Collection AddDescription(string description)
        {
            this.description = description;
            return this;
        }

        public Collection SetSystem(bool isSystem)
        {
            this.isSystem = isSystem;
            return this;
        }

        public Collection SetRuleData()
        {
            return this;
        }

        public Collection SetRelationAlias(string relationAlias)
        {
            this.relationAlias = relationAlias;
            return this;
        }
    }
}