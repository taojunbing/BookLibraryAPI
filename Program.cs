
using BookLibraryAPI.Data; // ����DbContext�����ռ�
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.OpenApi.Models;


//����һ�� WebApplicationBuilder ʵ������ʼ���� Web Ӧ��
//args �������в�����������ͨ��������/�����ļ�Ӱ��Ӧ����Ϊ��
//��� builder ����ע����ַ������ùܵ��ȡ�

var builder = WebApplication.CreateBuilder(args);


//������ע��������ע�ᡰ�����������񣨼� API Controller����
//��Ӧ��֧�� MVC/Web API ·�ɡ������󶨡�ģ����֤�ȹ��ܡ�
// Add services to the container.

builder.Services.AddControllers()
    .AddJsonOptions(options => { options.JsonSerializerOptions.Encoder=System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping; });

//���JWT��֤����
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

// �� builder.Services.AddControllers(); ������룺
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

//ע�ᡰ�ս��API����������������� OpenAPI/Swagger �ĵ������ API Ԫ���ݡ�
//û����䣬SwaggerGen ���Ҳ���������ЩAPI�ӿڣ��ĵ��᲻ȫ�򱨴�

builder.Services.AddEndpointsApiExplorer();

//ע�� Swagger ���ɷ���������������Զ����� API �ĵ��Ϳ��ӻ�ҳ�棨Swagger UI����
//���� API �����͵��Ե�������Ҳ��ǰ�����������Ҫ���ߡ�
//��Swagger���������JWT��֤֧��
//builder.Services.AddSwaggerGen();

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "BookLibraryAPI", Version = "v1" });
    c.SupportNonNullableReferenceTypes();
    c.CustomSchemaIds(type => type.FullName);

    // ���JWT��֤����
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

// ע�� CORS��������Դ������������ע������
builder.Services.AddCors(options =>
{
    // ���һ����Ϊ "AllowLocalhost5173" �� CORS ����
    options.AddPolicy("AllowFrontend", policy =>
    {
        // �������� http://localhost:8080 ������ͨ�����ڱ���ǰ�˿���������
        policy.WithOrigins("http://localhost:5173")
              // ������������ͷ���� Authorization��Content-Type �ȣ�
              .AllowAnyHeader()
              // �������� HTTP �������� GET��POST��PUT��DELETE �ȣ�
              .AllowAnyMethod()
              .AllowCredentials(); // �����ǰ�˴�cookie�ȣ������
    });
});

//���� builder ���������������� WebApplication ʵ����
//����������Ϊ��Ӧ�ó�����ʽװ����ϣ�׼����������

var app = builder.Build();
app.UseCors("AllowFrontend");

//app.UseCors("AllowLocalhost5173");

//��̬����
app.UseStaticFiles();
//���á��м���ܵ�����
//�жϵ�ǰ�����Ƿ�Ϊ����������Development����ֻ���ڿ��������²�����Swagger��Swagger UI����������������¶�ӿ��ĵ�����
//app.UseSwagger()������ Swagger ���� OpenAPI JSON �ĵ���
//app.UseSwaggerUI()������ Swagger ���ӻ���ҳ��UI����
// Configure the HTTP request pipeline.


//if (app.Environment.IsDevelopment())
//{
//    app.UseSwagger();
//    app.UseSwaggerUI();
//}

//��������
app.UseSwagger();
app.UseSwaggerUI();
//���� HTTPS �ض��򣬰����� HTTP �����Զ���ת�� HTTPS����ǿ��ȫ�ԡ�
//������������ʼ�տ�����

// ���� CORS �м����û��֤��ʱ�����԰���һ��ע�͵������������ض�������������� https��
//app.UseHttpsRedirection();

//app.UseCors("AllowFrontend");  //ȷ��ֻ����һ��


//������֤�м��
app.UseAuthentication();


//������Ȩ�м����
//����У���û�Ȩ�ޣ����� [Authorize] �������ε�API����û������ؼ�Ȩ��ʧЧ��
//ע�⣺ֻ����Ȩ��������֤��������������֤����JWT��ʱ���õ���
app.UseAuthorization();

//ӳ�� API ·�ɣ��� Controller ������� action ����ע��� HTTP ·�ɣ��� /api/books����
//û����䣬���� Controller API �����ʲ�����
app.MapControllers();

//�������� Web Ӧ�ã���ʼ�����˿ڣ���ʽ�������
//��������ڣ�Ӧ�ó����һֱ����������ֱ���رա�



app.Run();

//�ܽ����
//builder �׶Σ�ע����ַ���Controller��Swagger������ע��ȣ���
//app �׶Σ�װ�䡢��������ܵ����м����������API·�ɡ���������Ӧ�á�