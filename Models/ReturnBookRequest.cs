// Models/ReturnBookRequest.cs
namespace BookLibraryAPI.Models
{
    public class ReturnBookRequest
    {
        public List<int> RecordIds { get; set; }  //支持归还多本图书
    }
}
