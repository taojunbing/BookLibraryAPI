

using BookLibraryAPI.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;

namespace BookLibraryAPI.Data
{
    /// <summary>
    ///  配置数据库上下文（DbContext）
    /// 应用程序的数据库上下文，包含所有实体表
    ///  安装EntityFrameworkCore
    /// </summary>
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        // DbSet<Book> 就是对应数据库里的“Books”表
        public DbSet<Book> Books { get; set; }
        public DbSet<Room> Rooms { get; set; }
        public DbSet<Shelf> Shelves { get; set; }

        //注册User到DbContext
        public DbSet<User> Users { get; set; }

        //注册BorrowRecord到DbContext
        public DbSet<BorrowRecord> BorrowRecords { get; set; }

        //注册BookReservations
        public DbSet<BookReservation> BookReservations { get; set; }

        //用 HasData 初始化基础数据
        //初始化一个阅览室、一个书架、一本实体书和一个管理员用户
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // 1. 阅览室
            modelBuilder.Entity<Room>().HasData(
                new Room { Id = 1, Name = "一号阅览室" }
            );

            // 2. 书架（依赖RoomId=1）
            modelBuilder.Entity<Shelf>().HasData(
                new Shelf { Id = 1, Number = "A1", RoomId = 1 }
            );

            // 3. 一本实体书（依赖ShelfId=1）
            modelBuilder.Entity<Book>().HasData(
                new Book
                {
                    Id = 1,
                    Title = "C#权威指南",
                    Author = "张三",
                    IsAvailable = true,
                    ShelfId = 1,
                    IsEbook = false
                }
            );

            // 4. 管理员用户（密码必须是哈希！）
            modelBuilder.Entity<User>().HasData(
                new User
                {
                    Id = 1,
                    UserName = "admin",
                    PasswordHash = "$2a$11$F0NSPvB2Jk7ztuT4RUQJFuBeyqj7bZ6XlAFR9JKlD4/EvmU7qIuaK", // 123456（BCrypt哈希）
                    Role = "Admin",
                    Email = "admin@example.com"
                }
            );
        }



    }
}

