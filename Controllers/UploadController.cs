using Microsoft.AspNetCore.Mvc;

namespace BookLibraryAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [ApiExplorerSettings(IgnoreApi = true)]  //忽略测试

    public class UploadController : ControllerBase
    {
        private readonly IWebHostEnvironment _env;

        public UploadController(IWebHostEnvironment env)
        {
            _env = env;
        }
     

            /// <summary>
            /// 上传电子书文件（PDF）
            /// </summary>
            /// <param name="file">上传的PDF文件</param>
            /// <returns>文件存储相对路径</returns>
            [HttpPost("ebook")]
            public async Task<IActionResult> UploadEbook([FromForm] IFormFile file)
            {
                if (file == null || file.Length == 0)
                    return BadRequest("未选择文件。");

                var allowedTypes = new[] { "application/pdf" };
                if (!allowedTypes.Contains(file.ContentType))
                    return BadRequest("仅支持PDF文件。");

                // 生成唯一文件名
                var ext = Path.GetExtension(file.FileName);
                var fileName = $"{Path.GetFileNameWithoutExtension(Path.GetRandomFileName())}{ext}";
                var uploadPath = Path.Combine(_env.WebRootPath ?? "wwwroot", "ebooks");
                if (!Directory.Exists(uploadPath))
                    Directory.CreateDirectory(uploadPath);

                var filePath = Path.Combine(uploadPath, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // 返回相对路径，供前端保存到 EbookUrl 字段
                var relativePath = $"/ebooks/{fileName}";
                return Ok(new { url = relativePath });
            }
        

        [HttpPost]
        public async Task<IActionResult> Post([FromForm] IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("未选择文件");

            var uploadsDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/uploads");
            if (!Directory.Exists(uploadsDir))
                Directory.CreateDirectory(uploadsDir);

            var ext = Path.GetExtension(file.FileName);
            var fileName = $"{Guid.NewGuid():N}{ext}";
            var savePath = Path.Combine(uploadsDir, fileName);

            using (var stream = new FileStream(savePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var url = $"/uploads/{fileName}";
            return Ok(new { url });
        }
    }



  

}
