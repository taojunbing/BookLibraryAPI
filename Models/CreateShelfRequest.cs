// Models/CreateShelfRequest.cs
namespace BookLibraryAPI.Models
{
    public class CreateShelfRequest
    {
        public string Number { get; set; }
        public int RoomId { get; set; }
    }
}
