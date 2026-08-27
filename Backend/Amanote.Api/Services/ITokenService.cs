namespace Amanote.Api.Services
{
    public interface ITokenService
    {
        string CreateToken(int userId, string email);
    }
}
