using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

//BookReservation 预约表
namespace BookLibraryAPI.Models
{
    public class BookReservation
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public int BookId { get; set; }
        public Book? Book { get; set; }

        [Required]
        public int UserId { get; set; }
        public User? User { get; set; }

        public DateTime ReserveTime { get; set; } = DateTime.Now;
        public bool IsActive { get; set; } = true;  // 预约是否生效
        public DateTime? NotifiedTime { get; set; } // 可选：通知用户时间
        public bool IsFulfilled { get; set; } = false; // 是否已成功借阅
    }
}
