using BookLibraryAPI.Data;
using BookLibraryAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NPOI.HSSF.Record.Chart;

namespace BookLibraryAPI.Controllers
{

    [ApiController]
    [Route("api/[controller]")]
    public class UserController:ControllerBase
    {
        private readonly AppDbContext _context;
        public UserController(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// 批量导入用户
        /// </summary>
        [HttpPost("import")]
        public async Task<IActionResult>ImportUser(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("请选择要上传的文件");

            var users  = new List<User>();
            using(var stream = file.OpenReadStream())
            {
                var workbook = new NPOI.XSSF.UserModel.XSSFWorkbook(stream);
                var sheet = workbook.GetSheetAt(0);
                for(int i = 0;i<sheet.LastRowNum;i++)
                {
                    var row = sheet.GetRow(i);
                    if (row == null) continue;

                    var userName = row.GetCell(0)?.ToString();
                    var password = row.GetCell(1)?.ToString();
                    var role = row.GetCell(2)?.ToString();
                    var email = row.GetCell(3)?.ToString();
                    var realName = row.GetCell(4)?.ToString();
                    var phone = row.GetCell(5)?.ToString();

                    if (string.IsNullOrEmpty(userName) || string.IsNullOrEmpty(password))continue;

                    users.Add(new Models.User
                    {
                        UserName = userName,
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),  //自动加密
                        Role = string.IsNullOrEmpty(role) ? "User" : role,
                        Email = email,
                        RealName = realName,
                        Phone = phone,
                    });

                }

            }
            if (users.Count > 0)
            {
                _context.Users.AddRange(users);
                await _context.SaveChangesAsync();
            }
            return Ok(new {success = true ,count = users.Count});
        }


        /// <summary>
        /// 获取个人用户信息
        /// </summary>
        /// <returns></returns>
        [Authorize]
        [HttpGet("me")]
        public IActionResult GetMe()
        {
            var userName = User.Identity?.Name;
            var user = _context.Users.FirstOrDefault(u => u.UserName == userName);
            if (user == null) return Unauthorized();
            // 不返回密码hash
            return Ok(new
            {
                user.Id,
                user.UserName,
                user.Email,
                user.Role
            });
        }


        public class ChangePasswordRequest
        {
            public string OldPassword { get; set; }
            public string NewPassword { get; set; }
        }


        /// <summary>
        /// 修改密码
        /// </summary>
        /// <param name="req"></param>
        /// <returns></returns>
        [Authorize]
        [HttpPost("change-password")]
        public IActionResult ChangePassword([FromBody] ChangePasswordRequest req)
        {
            var userName = User.Identity?.Name;
            var user = _context.Users.FirstOrDefault(u => u.UserName == userName);
            if (user == null) return Unauthorized();
            if (!BCrypt.Net.BCrypt.Verify(req.OldPassword, user.PasswordHash))
                return BadRequest("原密码不正确");

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.NewPassword);
            _context.SaveChanges();
            return Ok("密码修改成功");
        }

        public class UpdateProfileRequest
        {
            public string Email { get; set; }
            public string? AvatarUrl { get; set; }
        }


        /// <summary>
        /// 修改个人资料
        /// </summary>
        /// <param name="req"></param>
        /// <returns></returns>
        [Authorize]
        [HttpPost("update-profile")]
        public IActionResult UpdateProfile([FromBody] UpdateProfileRequest req)
        {
            var userName = User.Identity?.Name;
            var user = _context.Users.FirstOrDefault(u => u.UserName == userName);
            if (user == null) return Unauthorized();
            user.Email = req.Email ?? user.Email;
            if (!string.IsNullOrWhiteSpace(req.AvatarUrl))
                user.AvatarUrl = req.AvatarUrl;
            _context.SaveChanges();
            return Ok("个人信息修改成功");
        }


    }
}
