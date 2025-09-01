using Microsoft.AspNetCore.Mvc;
using SqlKata.Execution;

namespace Bird.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly QueryFactory _db;
         
        public AuthController(QueryFactory db)
        {
            _db = db;
        }

        [HttpGet("me")]
        public object Me()
        {
            return new { user = new { username = "bird", email = "bird@web.de", disabled = false, role = 6 } };
        }

        [HttpGet("realtime")]
        public async IAsyncEnumerable<string> RealTimeHandler()
        {
            while (true)
            {
                string sseData;
                try
                {
                    var data = Me(); // your function providing the data

                    sseData = $"event: auth_update\ndata: {System.Text.Json.JsonSerializer.Serialize(data)}\n\n";
                }
                catch
                {
                    sseData = $"event: auth-error\ndata: null\n\n";
                }

                yield return sseData;

                await Task.Delay(5000);
            }
        }
    }
}