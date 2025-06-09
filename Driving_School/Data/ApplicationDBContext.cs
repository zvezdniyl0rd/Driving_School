using Microsoft.EntityFrameworkCore;
using Driving_School_API.Models.Instructor;
using Driving_School_API.Models.Student;
using Driving_School_API.Models.Review;
using Driving_School_API.Models.Car;
using Driving_School_API.Models.Schedule;
//using Driving_School_API.Models.Question;
//using Driving_School_API.Models.StudentProgress;
using Driving_School_API.Models;
using Driving_School_API.Models.Driving_School;
using Driving_School_API.Models.City;
using Driving_School_API.Models.Admin;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<Student> Student { get; set; }
    public DbSet<Instructor> Instructor { get; set; }
    public DbSet<Review> Review { get; set; }
    public DbSet<Car> Car { get; set; }
    public DbSet<Schedule> Schedule { get; set; }
    //public DbSet<Question> Question { get; set; }
    //public DbSet<Answer> Answer { get; set; }
    //public DbSet<StudentProgress> StudentProgress { get; set; }
    public DbSet<Account> Account { get; set; }
    public DbSet<Driving_School> Driving_School { get; set; }
    public DbSet<City> City { get; set; }
    public DbSet<Admin> Admin { get; set; }
    public DbSet<Attachment> Attachment { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);

        modelBuilder.Entity<Review>(entity =>
        {
            // Настройка автоматической записи текущего времени при создании отзыва
            entity.Property(e => e.CreatedAt)
                  .HasDefaultValueSql("GETDATE()")
                  .ValueGeneratedOnAdd();
        });

        modelBuilder.Entity<Schedule>(entity =>
        {
            // Настройка автоматической записи текущего времени при создании расписания
            entity.Property(e => e.CreatedAt)
                  .HasDefaultValueSql("GETDATE()")
                  .ValueGeneratedOnAdd();
        });

        base.OnModelCreating(modelBuilder);
    }
}