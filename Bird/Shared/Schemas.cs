namespace Bird.Shared
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
}