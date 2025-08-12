// Models/CreateBookRequest.cs
namespace BookLibraryAPI.Models
{
    public class CreateBookRequest
    {
        public string Title { get; set; }
        public string? Author { get; set; }
        public string? Category { get; set; }
        public string? Description { get; set; }
        public string? CoverUrl { get; set; }
        public bool IsAvailable { get; set; }
        public bool CanReadOnline { get; set; }
        public int? ShelfId { get; set; }
        public bool IsEbook { get; set; }
        public string? EbookUrl { get; set; }
        public string? Publisher { get; set; }
        public string? PublishDate { get; set; }
    }

}
