using System.ComponentModel.DataAnnotations;

namespace BookLibraryAPI.Models
{
    /// <summary>
    /// 图书实体，对应数据库中的“图书”表
    /// </summary>
    public class Book
    {
        [Key] // 主键
        public int Id { get; set; }

        [Required] // 必填
        [MaxLength(100)] // 最大长度100
        public string Title { get; set; } = string.Empty;

        [MaxLength(50)]
        public string? Author { get; set; }

        [MaxLength(50)]
        public string? Category { get; set; }

        [MaxLength(500)]
        public string? Description { get; set; }

        public string? CoverUrl { get; set; } // 封面图片链接

        public bool IsAvailable { get; set; } = true; // 是否可借

        public bool CanReadOnline { get; set; } = false; // 新增：是否可在线阅读

        public int? ShelfId {  get; set; }   //每本书通过 ShelfId 关联书架，书架再通过 RoomId 关联图书室，实现了层级映射。
        public Shelf? Shelf { get; set; }

        public bool IsEbook { get; set; } = false;
        public string? EbookUrl { get; set; }  // 电子书文件或在线地址

        public string? Publisher { get; set; }  //出版社
        public string? PublishDate { get; set; } //出版时间


    }
}



    