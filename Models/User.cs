using System.ComponentModel.DataAnnotations;
namespace BookLibraryAPI.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }
        [Required, MaxLength(32)]
        public string UserName { get; set; } = "";

        [Required, MaxLength(128)]
        public string PasswordHash { get; set; } = ""; //存储密码哈希，不存明文

        [MaxLength(64)]
        public string? Role {  get; set; }   //用户角色，Admin/User等

        [MaxLength(128)]
        public string? Email { get; set; }

        [MaxLength(128)]
        public string? RealName { get; set; }

        [MaxLength(128)]
        public string? Phone { get; set; }

        public string? AvatarUrl { get; set; }  // <--- 新增头像字段

    }
}
