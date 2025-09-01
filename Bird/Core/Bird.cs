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

        private string[] args;

        public App(string[] args)
        {
            stopwatch.Start();
            this.args = args;
        }

        private void registerDatabase(QueryFactory db)
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
                collection.InsertMetaData(db);
            }
        }



        public void Start()
        {
            var builder = WebApplication.CreateBuilder(args);

            builder.Services.AddSingleton<QueryFactory>(sp =>
            {
                var connection = new SqliteConnection("Data Source=bird_data/data.db");
                var compiler = new SqlKata.Compilers.SqliteCompiler();

                connection.Open();
                return new QueryFactory(connection, compiler);
            });

            builder.Services.AddControllers();
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            app = builder.Build();
            

            if (app.Environment.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseSwagger();

                app.UseSwaggerUI(options =>
                {
                    options.SwaggerEndpoint("/swagger/v1/swagger.json", "My API V1");
                    options.RoutePrefix = "";
                });
            }

            var db = app.Services.GetRequiredService<QueryFactory>();
            registerDatabase(db);

            TimeSpan elapsed = stopwatch.Elapsed;

            Console.WriteLine("Bird");
            Console.WriteLine(elapsed + "ms");

            app.UseHttpsRedirection();
            app.MapControllers();
            app.Run();
            

        }
    }
}
