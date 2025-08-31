public static class IdGenerator
{
    public static string GenerateShortUuid()
    {
        Guid guid = Guid.NewGuid();
        string shortId = Convert.ToBase64String(guid.ToByteArray())
                            .Replace("+", "-")
                            .Replace("/", "_")
                            .TrimEnd('=');
        return shortId;
    }
}