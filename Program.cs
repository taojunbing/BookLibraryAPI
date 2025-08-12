
using BookLibraryAPI.Data; // 引入DbContext命名空间
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.OpenApi.Models;


//创建一个 WebApplicationBuilder 实例，开始构建 Web 应用
//args 是命令行参数，允许你通过命令行/配置文件影响应用行为。
//这个 builder 用于注册各种服务、配置管道等。

var builder = WebApplication.CreateBuilder(args);


//向依赖注入容器中注册“控制器”服务（即 API Controller）。
//让应用支持 MVC/Web API 路由、参数绑定、模型验证等功能。
// Add services to the container.

builder.Services.AddControllers()
    .AddJsonOptions(options => { options.JsonSerializerOptions.Encoder=System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping; });

//添加JWT认证服务
var jwtKey = builder.Configuration["Jwt:Key"] ?? "DefaultSecretKey";
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ClockSkew = TimeSpan.Zero
        };
    });

// 在 builder.Services.AddControllers(); 下面加入：
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

//注册“终结点API浏览器”，用于生成 OpenAPI/Swagger 文档所需的 API 元数据。
//没有这句，SwaggerGen 会找不到你有哪些API接口，文档会不全或报错。

builder.Services.AddEndpointsApiExplorer();

//注册 Swagger 生成服务，让你后续可以自动生成 API 文档和可视化页面（Swagger UI）。
//这是 API 开发和调试的利器，也是前后端联调的重要工具。
//在Swagger配置中添加JWT认证支持
//builder.Services.AddSwaggerGen();

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "BookLibraryAPI", Version = "v1" });
    c.SupportNonNullableReferenceTypes();
    c.CustomSchemaIds(type => type.FullName);

    // 添加JWT认证配置
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement{
        {
            new OpenApiSecurityScheme{
                Reference = new OpenApiReference{
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

// 注册 CORS（跨域资源共享）服务到依赖注入容器
builder.Services.AddCors(options =>
{
    // 添加一个名为 "AllowLocalhost5173" 的 CORS 策略
    options.AddPolicy("AllowFrontend", policy =>
    {
        // 允许来自 http://localhost:8080 的请求（通常用于本地前端开发环境）
        policy.WithOrigins("http://localhost:5173")
              // 允许任意请求头（如 Authorization、Content-Type 等）
              .AllowAnyHeader()
              // 允许任意 HTTP 方法（如 GET、POST、PUT、DELETE 等）
              .AllowAnyMethod()
              .AllowCredentials(); // 如果有前端带cookie等，必须加
    });
});

//根据 builder 的配置生成真正的 WebApplication 实例。
//这里可以理解为“应用程序正式装配完毕，准备启动”。

var app = builder.Build();
app.UseCors("AllowFrontend");

//app.UseCors("AllowLocalhost5173");

//静态访问
app.UseStaticFiles();
//配置“中间件管道”。
//判断当前环境是否为开发环境（Development），只有在开发环境下才启用Swagger和Swagger UI（避免生产环境暴露接口文档）。
//app.UseSwagger()：启用 Swagger 生成 OpenAPI JSON 文档。
//app.UseSwaggerUI()：启用 Swagger 可视化网页（UI）。
// Configure the HTTP request pipeline.


//if (app.Environment.IsDevelopment())
//{
//    app.UseSwagger();
//    app.UseSwaggerUI();
//}

//生产环境
app.UseSwagger();
app.UseSwaggerUI();
//启用 HTTPS 重定向，把所有 HTTP 请求自动跳转到 HTTPS，增强安全性。
//生产环境建议始终开启。

// 启用 CORS 中间件，没有证书时，可以把这一行注释掉，避免意外重定向导致浏览器请求 https。
//app.UseHttpsRedirection();

//app.UseCors("AllowFrontend");  //确保只用了一次


//启用认证中间件
app.UseAuthentication();


//启用授权中间件。
//用于校验用户权限（比如 [Authorize] 特性修饰的API），没有它相关鉴权会失效。
//注意：只是授权，不是认证，后续你加身份验证（如JWT）时会用到。
app.UseAuthorization();

//映射 API 路由，把 Controller 里的所有 action 方法注册成 HTTP 路由（如 /api/books）。
//没有这句，所有 Controller API 都访问不到。
app.MapControllers();

//启动整个 Web 应用，开始监听端口，正式对外服务。
//这是主入口，应用程序会一直阻塞在这里直到关闭。



app.Run();

//总结归纳
//builder 阶段：注册各种服务（Controller、Swagger、依赖注入等）。
//app 阶段：装配、配置请求管道（中间件）、设置API路由、最终启动应用。