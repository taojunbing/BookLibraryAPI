using BookLibraryAPI.Data;
using BookLibraryAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BookLibraryAPI.Controllers
{
    [ApiController] // 标记为API控制器，自动模型校验、返回JSON
    [Route("api/[controller]")] // 路由为 /api/shelves
    public class ShelfController:ControllerBase
    {
        private readonly AppDbContext _context;

        public ShelfController(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// 批量导入书架
        /// </summary>
        [HttpPost("import")]
        public async Task<IActionResult> ImportShelves(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("请选择要上传的文件");

            var shelves = new List<Shelf>();
            using (var stream = file.OpenReadStream())
            {
                var workbook = new NPOI.XSSF.UserModel.XSSFWorkbook(stream);
                var sheet = workbook.GetSheetAt(0);
                for (int i = 1; i <= sheet.LastRowNum; i++)
                {
                    var row = sheet.GetRow(i);
                    if (row == null) continue;
                    var number = row.GetCell(0)?.ToString();
                    var roomNumber = row.GetCell(1)?.ToString();

                    if (string.IsNullOrWhiteSpace(number) || string.IsNullOrWhiteSpace(roomNumber)) continue;

                    // 通过 roomNumber 查询 Room 实体
                    var room = _context.Rooms.FirstOrDefault(r => r.Number == roomNumber);
                    if (room == null) continue; // 没有此房间则跳过

                    if (string.IsNullOrWhiteSpace(number)) continue;

                    shelves.Add(new Shelf
                    {
                        Number = number,
                        RoomId = room.Id,
                        
                    });
                }
            }
            if (shelves.Count > 0)
            {
                _context.Shelves.AddRange(shelves);
                await _context.SaveChangesAsync();
            }
            return Ok(new { success = true, count = shelves.Count });
        }


        /// <summary>
        /// 获取所有书架及房间信息
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var list = await _context.Shelves
                .Include(s => s.Room)
                .Select(s => new {
                    id = s.Id,
                    number = s.Number,
                    room = s.Room == null ? null : new { id = s.Room.Id, name = s.Room.Name }
                })
                .ToListAsync();
            return Ok(list);
        }


    }
}
