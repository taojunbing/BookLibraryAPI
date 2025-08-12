// Models/RegisterRequest.cs
namespace BookLibraryAPI.Models
{
    public class RegisterRequest
    {
        public string UserName { get; set; }
        public string Password { get; set; }
        public string Role { get; set; }   // 可选：User/Admin等
        public string Email { get; set; }  // 可选
    }
}
