using Microsoft.AspNetCore.Mvc;
using BookLibraryAPI.Data;
using BookLibraryAPI.Models;

namespace BookLibraryAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RoomController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RoomController(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// 批量导入图书室
        /// </summary>
        [HttpPost("import")]
        public async Task<IActionResult> ImportRooms(IFormFile file)
        {
            
                if (file == null || file.Length == 0)
                    return BadRequest("请选择要上传的文件");

                var rooms = new List<Room>();
                using (var stream = file.OpenReadStream())
                {
                    var workbook = new NPOI.XSSF.UserModel.XSSFWorkbook(stream);
                    var sheet = workbook.GetSheetAt(0);
                    for (int i = 1; i <= sheet.LastRowNum; i++)
                    {
                        var row = sheet.GetRow(i);
                        if (row == null) continue;
                        var number = row.GetCell(0)?.ToString();
                        var name = row.GetCell(1)?.ToString();
                        var location = row.GetCell(2)?.ToString();
                        var description = row.GetCell(3)?.ToString();

                        if (string.IsNullOrWhiteSpace(number)) continue;

                        rooms.Add(new Room
                        {
                            Number = number,
                            Name = name,
                            Location = location,
                            Description = description
                        });
                    }
                }
                if (rooms.Count > 0)
                {
                    _context.Rooms.AddRange(rooms);
                    await _context.SaveChangesAsync();
                }
                return Ok(new { success = true, count = rooms.Count });
            }

        }

        // 你也可以继续加 GET/POST/PUT/DELETE 等管理房间的接口
    }

