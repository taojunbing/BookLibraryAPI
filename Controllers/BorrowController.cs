using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BookLibraryAPI.Data;
using BookLibraryAPI.Models;

namespace BookLibraryAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BorrowController : ControllerBase
    {
        // 数据库上下文，用于访问和操作数据库实体
        private readonly AppDbContext _context;

        /// <summary>
        /// 构造函数，注入数据库上下文
        /// </summary>
        /// <param name="context">应用数据库上下文</param>
        public BorrowController(AppDbContext context)
        {
            _context = context;
        }





        /// <summary>
        /// 借阅一本书（含最大借阅数量判断、自动跳过预约队列）
        /// </summary>
        /// <param name="bookId">要借阅的图书ID</param>
        /// <returns>借阅结果及到期时间</returns>
        [Authorize]
        [HttpPost("borrow")]
        public IActionResult BorrowBooks([FromBody] BorrowBookRequest req)
        {
            if (req.BookIds == null || req.BookIds.Count == 0)
                return BadRequest("请提供要借阅的图书ID列表。");
            if (req.BookIds.Distinct().Count() != req.BookIds.Count)
                return BadRequest("请勿重复借阅同一本图书。");

            var username = User.Identity?.Name;
            var user = _context.Users.FirstOrDefault(u => u.UserName == username);
            if (user == null) return Unauthorized();

            int maxBorrowLimit = 8;
            int currentBorrowedCount = _context.BorrowRecords.Count(r => r.UserId == user.Id && !r.IsReturned);

            var results = new List<object>();

            foreach (var bookId in req.BookIds)
            {
                if (currentBorrowedCount >= maxBorrowLimit)
                {
                    results.Add(new { bookId, result = "超出最大借阅数量，无法再借阅" });
                    continue;
                }

                var book = _context.Books.FirstOrDefault(b => b.Id == bookId);
                if (book == null)
                {
                    results.Add(new { bookId, result = "图书不存在" });
                    continue;
                }
                if (book.IsEbook)
                {
                    results.Add(new { bookId, result = "电子书无需借阅" });
                    continue;
                }
                if (!book.IsAvailable)
                {
                    results.Add(new { bookId, result = "图书已被借出" });
                    continue;
                }

                // 预约优先等逻辑（可根据需要扩展）
                var record = new BorrowRecord
                {
                    BookId = bookId,
                    UserId = user.Id,
                    BorrowTime = DateTime.Now,
                    DueTime = DateTime.Now.AddDays(14)
                };
                book.IsAvailable = false;
                _context.BorrowRecords.Add(record);
                currentBorrowedCount++;
                results.Add(new { bookId, result = "借阅成功", dueTime = record.DueTime });
            }
            _context.SaveChanges();
            return Ok(results);
        }


        /// <summary>
        /// 归还图书（含自动为预约人保留）
        /// </summary>
        /// <param name="recordId">借阅记录ID</param>
        /// <returns>归还结果</returns>
        [Authorize]
        [HttpPost("return")]
        public IActionResult ReturnBooks([FromBody] ReturnBookRequest req)
        {
            if (req.RecordIds == null || req.RecordIds.Count == 0)
                return BadRequest("请提供要归还的借阅记录ID列表。");

            var username = User.Identity?.Name;
            var user = _context.Users.FirstOrDefault(u => u.UserName == username);
            if (user == null) return Unauthorized();

            var results = new List<object>();
            foreach (var recordId in req.RecordIds)
            {
                var record = _context.BorrowRecords.FirstOrDefault(r => r.Id == recordId && !r.IsReturned);
                if (record == null)
                {
                    results.Add(new { recordId, result = "无效的借阅记录或已归还" });
                    continue;
                }
                // 可选：校验归还记录属于本人
                if (record.UserId != user.Id)
                {
                    results.Add(new { recordId, result = "不能归还他人图书" });
                    continue;
                }

                record.IsReturned = true;
                record.ReturnTime = DateTime.Now;

                var book = _context.Books.FirstOrDefault(b => b.Id == record.BookId);
                if (book != null)
                {
                    var reservation = _context.BookReservations
                        .Where(r => r.BookId == book.Id && r.IsActive && !r.IsFulfilled)
                        .OrderBy(r => r.ReserveTime)
                        .FirstOrDefault();
                    if (reservation != null)
                    {
                        reservation.IsActive = false;
                        reservation.IsFulfilled = true;
                        reservation.NotifiedTime = DateTime.Now;
                        book.IsAvailable = false;
                    }
                    else
                    {
                        book.IsAvailable = true;
                    }
                }
                results.Add(new { recordId, result = "归还成功" });
            }
            _context.SaveChanges();
            return Ok(results);
        }


        /// <summary>
        /// 查看我的借阅历史
        /// </summary>
        /// <returns>当前用户的所有借阅记录</returns>
        [Authorize]
        [HttpGet("history")]
        public IActionResult GetMyHistory()
        {
            // 获取当前登录用户名
            var username = User.Identity?.Name;
            // 查询用户信息
            var user = _context.Users.FirstOrDefault(u => u.UserName == username);
            if (user == null) return Unauthorized(); // 用户未登录或不存在

            // 查询该用户的所有借阅记录，按借阅时间倒序排列
            var history = _context.BorrowRecords
        .Where(r => r.UserId == user.Id)
        .OrderByDescending(r => r.BorrowTime)
        .Select(r => new
        {
            r.Id,
            r.BookId,
            BookTitle = r.Book.Title,
            BookAuthor = r.Book.Author,
            r.BorrowTime,
            r.DueTime,
            r.IsReturned,
            r.ReturnTime
        })
        .ToList();


            // 返回借阅历史
            return Ok(history);
        }


        /// <summary>
        /// 批量导出所有借阅记录，含用户、图书、状态等
        /// </summary>
        /// <returns></returns>
        [HttpGet("export")]
        public IActionResult ExportBorrowRecords()
        {
            var records = _context.BorrowRecords
                .Select(r => new
                {
                    r.Id,
                    UserName = r.User.UserName,
                    BookTitle = r.Book.Title,
                    r.BorrowTime,
                    r.DueTime,
                    r.IsReturned,
                    r.ReturnTime
                }).ToList();

            var workbook = new NPOI.XSSF.UserModel.XSSFWorkbook();
            var sheet = workbook.CreateSheet("BorrowRecords");

            // 表头
            var header = sheet.CreateRow(0);
            header.CreateCell(0).SetCellValue("记录ID");
            header.CreateCell(1).SetCellValue("借阅人");
            header.CreateCell(2).SetCellValue("书名");
            header.CreateCell(3).SetCellValue("借阅时间");
            
            header.CreateCell(4).SetCellValue("是否归还");
            header.CreateCell(5).SetCellValue("归还时间");

            for (int i = 0; i < records.Count; i++)
            {
                var r = records[i];
                var row = sheet.CreateRow(i + 1);
                row.CreateCell(0).SetCellValue(r.Id);
                row.CreateCell(1).SetCellValue(r.UserName ?? "");
                row.CreateCell(2).SetCellValue(r.BookTitle ?? "");
                row.CreateCell(3).SetCellValue(r.BorrowTime.ToString("yyyy-MM-dd HH:mm"));
                
                row.CreateCell(4).SetCellValue(r.IsReturned ? "是" : "否");
                row.CreateCell(5).SetCellValue(r.ReturnTime?.ToString("yyyy-MM-dd HH:mm") ?? "");
            }

            using (var ms = new MemoryStream())
            {
                workbook.Write(ms);
                
                var fileName = $"BorrowRecords_{DateTime.Now:yyyyMMddHHmmss}.xlsx";
                return File(ms.ToArray(),
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    fileName);
            }
        }


    }
}