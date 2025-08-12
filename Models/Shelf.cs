namespace BookLibraryAPI.Models
{
    public class Shelf
    {
        public int Id { get; set; }
        public string Number { get; set; } = ""; // 书架编号
        public int RoomId { get; set; }
        public Room? Room { get; set; }
        public ICollection<Book> Books { get; set; } = new List<Book>();
    }

}
