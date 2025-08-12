using Microsoft.AspNetCore.Mvc;
using BookLibraryAPI.Models;
using BookLibraryAPI.Data;
using NPOI.HSSF.Record.Chart;
using Microsoft.EntityFrameworkCore; // 需要引入

namespace BookLibraryAPI.Controllers
{
    public class ChangeBookCountRequest
    {
        public string Title { get; set; }
        public string Author { get; set; }
        public int Delta { get; set; }  // 增加几本（正数=增加，负数=减少）
    }




    [ApiController] // 标记为API控制器，自动启用模型校验和JSON响应
    [Route("api/[controller]")] // 路由前缀为 /api/books
    public class BooksController : ControllerBase
    {
        private readonly AppDbContext _context; // 数据库上下文

        // 构造函数，通过依赖注入获取数据库上下文
        public BooksController(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// 获取所有图书
        /// GET: /api/books
        /// </summary>
        [HttpGet]
        public ActionResult<IEnumerable<Book>> GetBooks()
        {
            // 查询所有图书并返回
            return Ok(_context.Books.ToList()); // 200响应，返回JSON数组
        }

        /// <summary>
        /// 新增一本图书
        /// POST: /api/books
        /// </summary>
        [HttpPost]
        public ActionResult<Book> AddBook([FromBody] CreateBookRequest req)
        {
            // 校验请求模型是否合法
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // 构造Book实体
            var book = new Book
            {
                Title = req.Title,
                Author = req.Author,
                Category = req.Category,
                Description = req.Description,
                CoverUrl = req.CoverUrl,
                IsAvailable = req.IsAvailable,
                CanReadOnline = req.CanReadOnline,
                ShelfId = req.ShelfId,
                IsEbook = req.IsEbook,
                EbookUrl = req.EbookUrl,
                Publisher = req.Publisher,
                PublishDate = req.PublishDate
            };
            _context.Books.Add(book); // 添加到数据库上下文
            _context.SaveChanges();   // 保存到数据库

            // 返回201响应，包含新建资源的地址和内容
            return CreatedAtAction(nameof(GetBookById), new { id = book.Id }, book);
        }

        /// <summary>
        /// 根据ID获取单本图书
        /// GET: /api/books/{id}
        /// </summary>
        [HttpGet("{id}")]
        public ActionResult<Book> GetBookById(int id)
        {
            var book = _context.Books.Find(id); // 根据主键查找
            if (book == null)
                return NotFound(); // 未找到返回404

            return Ok(book); // 返回200和图书信息
        }

        /// <summary>
        /// 删除一本图书
        /// DELETE: /api/books/{id}
        /// </summary>
        [HttpDelete("{id}")]
        public IActionResult DeleteBook(int id)
        {
            var book = _context.Books.Find(id);
            if (book == null)
                return NotFound(); // 未找到返回404

            _context.Books.Remove(book); // 删除图书
            _context.SaveChanges();      // 保存更改

            return NoContent(); // 返回204，无内容
        }

        /// <summary>
        /// 更新一本图书
        /// PUT: /api/books/{id}
        /// </summary>
        [HttpPut("{id}")]
        public IActionResult UpdateBook(int id, [FromBody] CreateBookRequest req)
        {
            var book = _context.Books.Find(id);
            if (book == null)
                return NotFound(); // 未找到返回404

            // 更新字段
            book.Title = req.Title;
            book.Author = req.Author;
            book.Category = req.Category;
            book.Description = req.Description;
            book.CoverUrl = req.CoverUrl;
            book.IsAvailable = req.IsAvailable;
            book.ShelfId = req.ShelfId;
            book.IsEbook = req.IsEbook;
            book.EbookUrl = req.EbookUrl;
            book.CanReadOnline = req.CanReadOnline;   // <<=== 添加这行

            _context.SaveChanges(); // 保存更改
            return NoContent();     // 返回204，无内容
        }

        /// <summary>
        /// 批量导入图书（Excel文件）
        /// POST: /api/books/import
        /// </summary>
        [HttpPost("import")]
        public async Task<IActionResult> ImportBooks( IFormFile file)
        {
            // 校验文件是否上传
            if (file == null || file.Length == 0)
                return BadRequest("请选择要上传的文件");

            var books = new List<Book>();
            var failedRows = new List<string>();
            try
            {
                using (var stream = file.OpenReadStream())
                {
                    var workbook = new NPOI.XSSF.UserModel.XSSFWorkbook(stream);
                    var sheet = workbook.GetSheetAt(0);
                    // 从第2行开始读取数据（第1行为表头）
                    for (int i = 1; i <= sheet.LastRowNum; i++)
                    {
                        var row = sheet.GetRow(i);
                        if (row == null) continue;
                        // 依次读取每一列
                        var title = row.GetCell(0)?.ToString();
                        var author = row.GetCell(1)?.ToString();
                        var category = row.GetCell(2)?.ToString();
                        var description = row.GetCell(3)?.ToString();
                        var coverUrl = row.GetCell(4)?.ToString();
                        var isAvailable = row.GetCell(5)?.ToString().ToLower() == "true";
                        var canReadOnline = row.GetCell(6)?.ToString().ToLower() == "true";
                        var shelfNumber = row.GetCell(7)?.ToString();
                        var isEbook = row.GetCell(8)?.ToString().ToLower() == "true";
                        var ebookUrl = row.GetCell(9)?.ToString();
                        var publisher = row.GetCell(10)?.ToString();
                        var publishDate = row.GetCell(11)?.ToString();
                        var stockStr = row.GetCell(12)?.ToString();

                        // 查找书架
                        var shelf = _context.Shelves.FirstOrDefault(s => s.Number == shelfNumber);

                        // 校验必填项
                        if (string.IsNullOrWhiteSpace(title))
                        {
                            failedRows.Add($"第{i + 1}行：Title 不能为空");
                            continue;
                        }
                        if (shelf == null && !string.IsNullOrEmpty(shelfNumber))
                        {
                            failedRows.Add($"第{i + 1}行：ShelfNumber={shelfNumber} 未找到");
                            continue;
                        }
                        if (row == null || row.Cells.All(c => c == null || string.IsNullOrWhiteSpace(c.ToString())))
                            continue; // 空行直接跳过

                        // 处理库存数量
                        int stock = 1;
                        int.TryParse(stockStr, out stock);
                        if (stock < 1) stock = 1;

                        // 按库存数量批量添加
                        for (int s = 0; s < stock; s++)
                        {
                            books.Add(new Book
                            {
                                Title = title,
                                Author = author,
                                Category = category,
                                Description = description,
                                CoverUrl = coverUrl,
                                IsAvailable = isAvailable,
                                CanReadOnline = canReadOnline,
                                ShelfId = shelf?.Id,
                                IsEbook = isEbook,
                                EbookUrl = ebookUrl,
                                Publisher = publisher,
                                PublishDate = publishDate
                            });
                        }
                    }
                }
                // 批量保存到数据库
                if (books.Count > 0)
                {
                    _context.Books.AddRange(books);
                    await _context.SaveChangesAsync();
                }
                // 返回导入结果
                return Ok(new { success = true, count = books.Count, failedRows });
            }
            catch (Exception ex)
            {
                // 文件解析失败
                return BadRequest("文件格式不正确或解析失败：" + ex.Message + "/n" + ex.ToString());
            }
        }

        /// <summary>
        /// 导出所有图书为Excel
        /// GET: /api/books/export
        /// </summary>
        [HttpGet("export")]
        public IActionResult ExportBooks()
        {
            // 先把所有书查出来
            var allBooks = _context.Books
                .Include(b => b.Shelf)
                .ThenInclude(s => s.Room)
                .ToList();

            // 按 title + author 分组统计数量
            var groupedBooks = allBooks
                .GroupBy(b => new { b.Title, b.Author, b.Category, b.Description, b.CoverUrl, b.IsEbook, b.EbookUrl, b.Publisher, b.PublishDate })
                .Select(g => new
                {
                    Title = g.Key.Title,
                    Author = g.Key.Author,
                    Category = g.Key.Category,
                    Description = g.Key.Description,
                    CoverUrl = g.Key.CoverUrl,
                    IsEbook = g.Key.IsEbook,
                    EbookUrl = g.Key.EbookUrl,
                    Publisher = g.Key.Publisher,
                    PublishDate = g.Key.PublishDate,
                    Count = g.Count(),
                    AvailableCount = g.Count(b => b.IsAvailable),
                    UnavailableCount = g.Count(b => !b.IsAvailable),
                    ShelfNumber = g.FirstOrDefault()?.Shelf?.Number ?? "",
                    RoomNumber = g.FirstOrDefault()?.Shelf?.Room?.Number ?? "",
                    RoomName = g.FirstOrDefault()?.Shelf?.Room?.Name ?? ""
                })
                .ToList();

            var workbook = new NPOI.XSSF.UserModel.XSSFWorkbook();
            var sheet = workbook.CreateSheet("Books");

            // 写表头
            var header = sheet.CreateRow(0);
            header.CreateCell(0).SetCellValue("书名");
            header.CreateCell(1).SetCellValue("作者");
            header.CreateCell(2).SetCellValue("类别");
            header.CreateCell(3).SetCellValue("描述");
            header.CreateCell(4).SetCellValue("封面图片URL");
            header.CreateCell(5).SetCellValue("是否电子书");
            header.CreateCell(6).SetCellValue("电子书地址");
            header.CreateCell(7).SetCellValue("出版社");
            header.CreateCell(8).SetCellValue("出版时间");
            header.CreateCell(9).SetCellValue("总数");
            header.CreateCell(10).SetCellValue("可借数量");
            header.CreateCell(11).SetCellValue("已借出数量");
            header.CreateCell(12).SetCellValue("书架号");
            header.CreateCell(13).SetCellValue("房间号");
            header.CreateCell(14).SetCellValue("房间名");

            // 写内容
            for (int i = 0; i < groupedBooks.Count; i++)
            {
                var book = groupedBooks[i];
                var row = sheet.CreateRow(i + 1);

                row.CreateCell(0).SetCellValue(book.Title ?? "");
                row.CreateCell(1).SetCellValue(book.Author ?? "");
                row.CreateCell(2).SetCellValue(book.Category ?? "");
                row.CreateCell(3).SetCellValue(book.Description ?? "");
                row.CreateCell(4).SetCellValue(book.CoverUrl ?? "");
                row.CreateCell(5).SetCellValue(book.IsEbook ? "是" : "否");
                row.CreateCell(6).SetCellValue(book.EbookUrl ?? "");
                row.CreateCell(7).SetCellValue(book.Publisher ?? "");
                row.CreateCell(8).SetCellValue(book.PublishDate ?? "");
                row.CreateCell(9).SetCellValue(book.Count);              // 总数
                row.CreateCell(10).SetCellValue(book.AvailableCount);    // 可借数量
                row.CreateCell(11).SetCellValue(book.UnavailableCount);  // 已借出数量
                row.CreateCell(12).SetCellValue(book.ShelfNumber ?? "");
                row.CreateCell(13).SetCellValue(book.RoomNumber ?? "");
                row.CreateCell(14).SetCellValue(book.RoomName ?? "");
            }
            // 写入内存流并返回文件下载
            using (var ms = new MemoryStream())
            {
                workbook.Write(ms);
                var fileName = $"Books_{DateTime.Now:yyyyMMddHHmmss}.xlsx";
                return File(
                    ms.ToArray(),// 转为字节数组
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    fileName
                );
            }


         
        }


        [HttpPost("changeCount")]
        public IActionResult ChangeBookCount([FromBody] ChangeBookCountRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.Title)) return BadRequest("Title不能为空");

            var books = _context.Books
                .Where(b => b.Title == req.Title && b.Author == req.Author)
                .ToList();

            if (books.Count == 0)
                return BadRequest("找不到对应的图书");

            if (req.Delta > 0)
            {
                for (int i = 0; i < req.Delta; i++)
                {
                    var first = books.FirstOrDefault();
                    var newBook = new Book
                    {
                        Title = req.Title,
                        Author = req.Author,
                        Category = first?.Category,
                        Description = first?.Description,
                        CoverUrl = first?.CoverUrl,
                        IsAvailable = true,
                        CanReadOnline = first?.CanReadOnline ?? false,
                        ShelfId = first?.ShelfId,
                        IsEbook = first?.IsEbook ?? false,
                        EbookUrl = first?.EbookUrl,
                        Publisher = first?.Publisher,
                        PublishDate = first?.PublishDate
                    };
                    _context.Books.Add(newBook);
                }
            }
            else if (req.Delta < 0)
            {
                var toDelete = books.Where(b => b.IsAvailable).Take(-req.Delta).ToList();
                if (toDelete.Count < -req.Delta)
                    return BadRequest("可删除数量不足，请先归还后再减少数量");
                _context.Books.RemoveRange(toDelete);
            }
            else
            {
                return Ok(new { message = "数量未变更" });
            }

            _context.SaveChanges();
            return Ok(new { success = true, count = _context.Books.Count(b => b.Title == req.Title && b.Author == req.Author) });
        }


    }
}