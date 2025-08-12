using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BookLibraryAPI.Data;
using BookLibraryAPI.Models;

namespace BookLibraryAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReservationController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ReservationController(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// 预约一本已被借出的图书
        /// </summary>
        [Authorize]
        [HttpPost("reserve")]
        public IActionResult ReserveBook([FromBody] ReserveBookRequest req)
        {
            var username = User.Identity?.Name;
            var user = _context.Users.FirstOrDefault(u => u.UserName == username);
            if (user == null) return Unauthorized();

            // 检查该书是否存在
            var book = _context.Books.FirstOrDefault(b => b.Id == req.BookId);
            if (book == null) return BadRequest("图书不存在。");

            // 电子书无需预约
            if (book.IsEbook)
                return BadRequest("电子书无需预约，可直接在线阅读。");

            // 书当前有库存，无需预约
            if (book.IsAvailable)
                return BadRequest("该图书有库存，无需预约，直接借阅即可。");

            // 检查用户是否已预约过该书
            bool alreadyReserved = _context.BookReservations
                .Any(r => r.BookId == req.BookId && r.UserId == user.Id && r.IsActive && !r.IsFulfilled);
            if (alreadyReserved)
                return BadRequest("你已经预约过该图书。");

            // 最大可借数
            int maxBorrowLimit = 8;
            int currentBorrowed = _context.BorrowRecords.Count(r => r.UserId == user.Id && !r.IsReturned);
            int currentReserved = _context.BookReservations.Count(r => r.UserId == user.Id && r.IsActive && !r.IsFulfilled);
            int leftCanReserve = maxBorrowLimit - currentBorrowed - currentReserved;
            if (leftCanReserve <= 0)
                return BadRequest($"你当前已借阅({currentBorrowed})本，已预约({currentReserved})本，无法再预约更多图书。");


            // 创建预约记录
            var reservation = new BookReservation
            {
                BookId = req.BookId,
                UserId = user.Id,
                ReserveTime = DateTime.Now,
                IsActive = true
            };
            _context.BookReservations.Add(reservation);
            _context.SaveChanges();
            return Ok("预约成功！");
        }

        /// <summary>
        /// 查询我的预约
        /// </summary>
        [Authorize]
        [HttpGet("my")]
        public IActionResult GetMyReservations()
        {
            var username = User.Identity?.Name;
            var user = _context.Users.FirstOrDefault(u => u.UserName == username);
            if (user == null) return Unauthorized();

            var reservations = _context.BookReservations
                .Where(r => r.UserId == user.Id && r.IsActive && !r.IsFulfilled)
                .OrderBy(r => r.ReserveTime)
                .ToList();

            return Ok(reservations);
        }
    }
}
