using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BookLibraryAPI.Models
{
    public class BorrowRecord
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int BookId { get; set; }
        public Book? Book { get; set; }

        [Required]
        public int UserId { get; set; }
        public User? User { get; set; }

        [Required]
        public DateTime BorrowTime { get; set; } = DateTime.Now;
        public DateTime? ReturnTime { get; set; } // 还书时间
        public bool IsReturned { get; set; } = false;
        public DateTime DueTime { get; set; } // 应还时间
    }
}
