# 📚 BookLibraryAPI

BookLibraryAPI 是一个基于 **ASP.NET Core Web API** 开发的图书管理与借阅系统，支持图书上架、借阅、归还、预约、用户管理、房间预约等功能。适合作为学习 **.NET Core 全栈开发** 的项目实践，也可作为图书馆或小型机构的后台服务。

---

## 🚀 功能特性

- **用户管理**
  - 用户注册 / 登录（JWT 鉴权）
  - 权限控制（管理员 / 普通用户）

- **图书管理**
  - 添加、编辑、删除图书
  - 图书上架与分类（Shelf）

- **借阅管理**
  - 借阅图书、归还图书
  - 借阅历史记录查询

- **预约功能**
  - 图书预约
  - 座位 / 房间预约

- **上传管理**
  - 文件上传接口（例如：封面图片）

---

## 🏗️ 项目结构

```
BookLibraryAPI
 ├── Controllers         # 控制器层，提供 API 接口
 │   ├── AuthController.cs
 │   ├── BooksController.cs
 │   ├── BorrowController.cs
 │   ├── ReservationController.cs
 │   ├── RoomController.cs
 │   ├── ShelfController.cs
 │   ├── UploadController.cs
 │   ├── UserController.cs
 │   └── WeatherForecastController.cs
 │
 ├── Data                # 数据访问层
 │   ├── AppDbContext.cs
 │   └── AppDbContextFactory.cs
 │
 ├── Models              # 模型层，定义实体与请求对象
 │   ├── Book.cs
 │   ├── BookReservation.cs
 │   ├── BorrowBookRequest.cs
 │   ├── BorrowRecord.cs
 │   ├── CreateBookRequest.cs
 │   ├── CreateShelfRequest.cs
 │   ├── LoginRequest.cs
 │   ├── RegisterRequest.cs
 │   ├── ReserveBookRequest.cs
 │   ├── ReturnBookRequest.cs
 │   ├── Room.cs
 │   ├── Shelf.cs
 │   └── User.cs
 │
 ├── Migrations          # EF Core 数据库迁移文件
 ├── wwwroot             # 静态资源（如上传文件）
 ├── appsettings.json    # 配置文件
 ├── Program.cs          # 程序入口
 └── README.md           # 项目说明文档
```

---

## ⚙️ 技术栈

- **后端框架**: ASP.NET Core Web API (.NET 7/8)
- **数据库**: Entity Framework Core + SQL Server
- **身份认证**: JWT (JSON Web Token)
- **依赖管理**: NuGet
- **前端对接**: 支持 React / Vue / Angular 等前端框架调用

---

## 📦 快速开始

### 1. 克隆项目
```bash
git clone https://github.com/你的用户名/BookLibraryAPI.git
cd BookLibraryAPI
```

### 2. 配置数据库连接
修改 `appsettings.json` 中的连接字符串：
```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost;Database=BookLibraryDB;User Id=sa;Password=your_password;"
}
```

### 3. 运行数据库迁移
```bash
dotnet ef database update
```

### 4. 启动项目
```bash
dotnet run
```

API 将默认运行在 `https://localhost:7013`。

---

## 📖 API 示例

### 用户注册
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "password": "123456"
}
```

### 借阅图书
```http
POST /api/borrow
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
  "bookId": 1,
  "userId": 2
}
```

更多 API 示例可见 `BookLibraryAPI.http` 文件。

---

## 🛠️ 开发计划

- [x] 基本的用户、图书、借阅、预约接口  
- [x] 增加管理员后台管理界面  
- [x] 支持前后端分离（React/Vue 前端）  
- [ ] 增加单元测试 / 集成测试  
- [ ] Docker 部署支持  

---

## 📜 许可证

本项目基于 [MIT License](LICENSE) 开源，欢迎自由使用与二次开发。
