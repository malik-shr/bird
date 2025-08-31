using System.Data.Common;
using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Threading.Tasks;
using Microsoft.Data.Sqlite;
using SqlKata.Compilers;
using SqlKata.Execution;

namespace Bird.Core
{
    public class App
    {
        private Stopwatch stopwatch = new();
        private WebApplication app;

        private QueryFactory db;

        public App(string[] args)
        {
            stopwatch.Start();
            var builder = WebApplication.CreateBuilder(args);
            app = builder.Build();

            var connection = new SqliteConnection("Data Source=bird_data/data.db");
            var compiler = new SqlServerCompiler();

            db = new QueryFactory(connection, compiler);
        }

        private async Task registerDatabase()
        {
            Shared.Collection[] collections = [
                new Shared.Collection("collections_meta", "system")
                        .AddField(new FieldProps{ Name= "name", Type= "String", IsRequired= true, IsUnique= true })
                        .AddField(new FieldProps{ Name="type", Type= "String", IsRequired= true })
                        .AddField(new FieldProps{ Name="description", Type= "String" })
                        .AddField(new FieldProps{ Name="is_system", Type= "Boolean", IsRequired= true })
                        .AddField(new FieldProps{ Name="relation_alias", Type= "String", IsRequired= true })
                        .SetSystem(true)
                        .SetRelationAlias("Name"),
                    new Shared.Collection("fields_meta", "system")
                        .AddField(new FieldProps{
                            Name= "name",
                            Type= "String",
                            IsRequired= true,
                        })
                        .AddField(new FieldProps{ Name= "type", Type= "String", IsRequired= true })
                        .AddField(new FieldProps{
                            Name= "collection",
                            Type= "Relation",
                            IsRequired= true,
                            RelationCollection= "collections_meta",
                        })
                        .AddField(new FieldProps{ Name= "is_hidden", Type= "Boolean", IsRequired= true })
                        .AddField(new FieldProps{
                            Name= "is_required",
                            Type= "Boolean",
                            IsRequired= true,
                        })
                        .AddField(new FieldProps{
                            Name= "is_primary_key",
                            Type= "Boolean",
                            IsRequired= true,
                        })
                        .AddField(new FieldProps{
                            Name= "is_unique",
                            Type= "Boolean",
                            IsRequired= true,
                        })
                        .AddField(new FieldProps{
                            Name= "relation_collection",
                            Type= "String",
                        })
                        .SetSystem(true)
                        .SetRelationAlias("Name"),
                    new Shared.Collection("auth_rules", "system")
                        .AddField(new FieldProps{
                            Name= "collection",
                            Type= "Relation",
                            IsRequired= true,
                            RelationCollection= "collections_meta",
                        })
                        .AddField(new FieldProps{ Name= "rule", Type="String", IsRequired= true })
                        .AddField(new FieldProps{ Name= "permission", Type="Integer", IsRequired= true })
                        .SetSystem(true)
                        .SetRelationAlias("rule"),
                    new Shared.Collection("select_options", "system")
                        .AddField(new FieldProps{
                            Name="collection",
                            Type="Relation",
                            IsRequired=true,
                            RelationCollection="collections_meta",
                        })
                        .AddField(new FieldProps{
                            Name="field",
                            Type="Relation",
                            IsRequired=true,
                            RelationCollection="fields_meta",
                        })
                        .AddField(new FieldProps{ Name="text", Type="String", IsRequired= true })
                        .AddField(new FieldProps{ Name="value", Type="Integer", IsRequired= true })
                        .SetSystem(true)
                        .SetRelationAlias("text")
            ];

            foreach (var collection in collections)
            {
                collection.CreateTable(db);
            }

            foreach (var collection in collections)
            {
                await collection.InsertMetaData(db);
            }
        }

        private void registerRoutes()
        {
            app.UseDeveloperExceptionPage();
            app.MapGet("/ping", () => "pong");
            var auth = new Auth();
            app.MapGet("/api/auth/me", () => auth.Me());
            app.MapGet("/api/auth/realtime", async (HttpContext ctx, CancellationToken ct) =>
            {
                // Set SSE headers
                ctx.Response.Headers.ContentType = "text/event-stream";
                ctx.Response.Headers.CacheControl = "no-cache";
                ctx.Response.Headers.Connection = "keep-alive";

                // Stream data continuously
                await foreach (var sseData in auth.RealTimeHandler().WithCancellation(ct))
                {
                    await ctx.Response.WriteAsync(sseData, cancellationToken: ct);
                    await ctx.Response.Body.FlushAsync(ct); // push data to client immediately
                }
            });

            var record = new Record();
            app.MapGet("/api/collections/{collectionName}/records", async(string collectionName) => await  record.ListRecords(collectionName, "1", "12", db));
            app.MapGet("/api/collections/{collectionName}/{id}", async(string collectionName, string id) => await record.GetRecord(collectionName, id, db));

            var collection = new Collection();
            var logger = app.Logger;
            app.MapGet("/api/collections", async () => await collection.ListCollections(db));
            app.MapGet("/api/collections/{collectionName}", async (string collectionName) => await collection.ViewCollection(collectionName, db));
        }

        public async Task Start()
        {
            await registerDatabase();
            registerRoutes();
            TimeSpan elapsed = stopwatch.Elapsed;

            Console.WriteLine("Bird");
            Console.WriteLine(elapsed + "ms");

            await app.RunAsync();
        }
    }
}
