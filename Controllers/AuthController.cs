using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using BookLibraryAPI.Data;
using BookLibraryAPI.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;

namespace BookLibraryAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;

        public AuthController(AppDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        /// <summary>
        /// 用户注册
        /// </summary>
        [HttpPost("register")]
        public IActionResult Register([FromBody] RegisterRequest req)
        {
            // 判断用户名是否已存在
            if (_context.Users.Any(u => u.UserName == req.UserName))
                return BadRequest("用户名已存在");

            // 使用BCrypt加密密码
            //  user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(user.PasswordHash);

            var user = new User
            {
                UserName = req.UserName,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
                Role = string.IsNullOrEmpty(req.Role) ? "User" : req.Role,
                Email = req.Email
            };
            _context.Users.Add(user);
            _context.SaveChanges();
            return Ok("注册成功");
        }

        /// <summary>
        /// 用户登录
        /// </summary>
        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest login)
        {
            var user = _context.Users.FirstOrDefault(u => u.UserName == login.UserName);

            // 用BCrypt验证密码
            if (user == null || !BCrypt.Net.BCrypt.Verify(login.Password, user.PasswordHash))
                return Unauthorized("用户名或密码错误");

            //参数非空校验：
            if (string.IsNullOrWhiteSpace(login.UserName) || string.IsNullOrWhiteSpace(login.Password))
                return BadRequest("用户名和密码不能为空");


            // 生成JWT Token
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_config["Jwt:Key"]);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.Name, user.UserName),
                    new Claim(ClaimTypes.Role, user.Role ?? "User"),
                    new Claim("UserId", user.Id.ToString())
                }),
                Expires = DateTime.UtcNow.AddHours(8),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);

            return Ok(new
            {
                token = tokenHandler.WriteToken(token),
                username = user.UserName,
                role = user.Role
            });
        }
    }
}
