using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using SqlKata.Execution;

public class FieldOption
{
    public int Value { get; set; }
    public string Text { get; set; } = string.Empty;
}

public class FieldProps
{
    public string? Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string? RelationCollection { get; set; }
    public List<FieldOption>? Options { get; set; }
    public bool IsHidden { get; set; } = false;
    public bool IsRequired { get; set; } = false;
    public bool IsPrimaryKey { get; set; } = false;
    public bool IsUnique { get; set; } = false;
}

public class Field
{
    public string Id { get; set; }
    public string Name { get; set; }
    public string Type { get; set; }
    public string? RelationCollection { get; set; }
    public List<FieldOption>? Options { get; set; }
    public bool IsHidden { get; set; }
    public bool IsRequired { get; set; }
    public bool IsPrimaryKey { get; set; }
    public bool IsUnique { get; set; }

    public Field(FieldProps props)
    {
        Name = props.Name;
        Type = props.Type;
        RelationCollection = props.RelationCollection;
        Options = props.Options;
        IsHidden = props.IsHidden;
        IsRequired = props.IsRequired;
        IsPrimaryKey = props.IsPrimaryKey;
        IsUnique = props.IsUnique;

        Id = props.Id ?? IdGenerator.GenerateShortUuid();
    }

    public bool Exists(string collectionId, QueryFactory db)
    {
        try
        {
            var result = db.Query("fields_meta as f")
                .Where("f.name", Name)
                .Where("f.collection", collectionId)
                .Count<int>();

            return result > 0;
        }
        catch (Exception e)
        {
            Console.WriteLine($"Error: {e.Message}");
            return false;
        }
    }

    public void InsertMetaData(string collectionId, QueryFactory db)
    {
        if (!Exists(collectionId, db))
        {
            try
            {
                db.Query("fields_meta")
                    .Insert(new
                    {
                        id = Id,
                        name = Name,
                        type = Type,
                        collection = collectionId,
                        is_required = IsRequired,
                        relation_collection = RelationCollection,
                        is_hidden = IsHidden,
                        is_primary_key = IsPrimaryKey,
                        is_unique = IsUnique
                    });

                if (Type == "Select" && Options != null)
                {
                    foreach (var option in Options)
                    {
                        db.Query("select_options")
                            .Insert(new
                            {
                                id = Guid.NewGuid().ToString(),
                                collection = collectionId,
                                field = Id,
                                text = option.Text,
                                value = option.Value
                            });
                    }
                }
            }
            catch (Exception e)
            {
                Console.WriteLine($"Error: {e.Message}");
            }
        }
    }
}