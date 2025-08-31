using System.Reflection.Metadata.Ecma335;

namespace Bird.Core
{
    public class Auth
    {
        public async Task<object> Me()
        {
            return new { user = new { username = "bird", email = "bird@web.de", disabled = false, role = 6 } };
        }
        
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