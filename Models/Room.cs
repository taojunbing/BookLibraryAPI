using System;

namespace BookLibraryAPI.Models
{
    //图书室
    public class Room
    {
        public int Id { get; set; }

        public string? Number { get; set; }

        public string? Location { get; set; }   //图示室位置

        
        public string Name { get; set; } = ""; // 图书室名称
        public ICollection<Shelf> Shelves { get; set; } = new List<Shelf>();

        public string? Description { get; set; } //描述
    }
}
