# 📚 BookLibraryAPI

BookLibraryAPI is a **ASP.NET Core Web API** project for library management and book borrowing system.  
It provides features like book management, borrowing, returning, reservations, user management, and room booking.  
This project can be used for **.NET Core full-stack learning** or as a backend service for small-scale libraries.

---

## 🚀 Features

- **User Management**
  - User registration / login (JWT authentication)
  - Role-based access (Admin / User)

- **Book Management**
  - Add, edit, delete books
  - Manage shelves and categories

- **Borrowing Management**
  - Borrow and return books
  - View borrowing history

- **Reservation**
  - Reserve books
  - Reserve seats / rooms

- **Upload Management**
  - File upload (e.g., book cover images)

---

## 🏗️ Project Structure

```
BookLibraryAPI
 ├── Controllers         # API Controllers
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
 ├── Data                # Data access layer
 │   ├── AppDbContext.cs
 │   └── AppDbContextFactory.cs
 │
 ├── Models              # Entity and DTO models
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
 ├── Migrations          # EF Core migration files
 ├── wwwroot             # Static resources (uploaded files)
 ├── appsettings.json    # Configurations
 ├── Program.cs          # Entry point
 └── README.md           # Project documentation
```

---

## ⚙️ Tech Stack

- **Backend**: ASP.NET Core Web API (.NET 7/8)
- **Database**: Entity Framework Core + SQL Server
- **Authentication**: JWT (JSON Web Token)
- **Package Management**: NuGet
- **Frontend Integration**: Works with React / Vue / Angular

---

## 📦 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/your-username/BookLibraryAPI.git
cd BookLibraryAPI
```

### 2. Configure Database
Update `appsettings.json` with your connection string:
```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost;Database=BookLibraryDB;User Id=sa;Password=your_password;"
}
```

### 3. Apply migrations
```bash
dotnet ef database update
```

### 4. Run the project
```bash
dotnet run
```

API will run at `https://localhost:7013` by default.

---

## 📖 API Examples

### User Registration
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "password": "123456"
}
```

### Borrow a Book
```http
POST /api/borrow
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
  "bookId": 1,
  "userId": 2
}
```

More examples available in `BookLibraryAPI.http`.

---

## 🛠️ Roadmap

- [x] Basic user, book, borrow, and reservation APIs  
- [ ] Admin dashboard support  
- [ ] Frontend integration (React/Vue)  
- [ ] Unit & Integration tests  
- [ ] Docker deployment support  

---

## 📜 License

This project is licensed under the [MIT License](LICENSE). Feel free to use and modify it.
