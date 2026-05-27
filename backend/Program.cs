using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

// ۱. تنظیم CORS برای اینکه ریکت بدون ارور بتونه به دات‌نت وصل بشه
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy => 
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader());
});

var app = builder.Build();
app.UseCors();

const string filePath = "data.json";

// ۲. متد GET: خواندن لیست داده‌ها از فایل JSON
app.MapGet("/api/data", () =>
{
    if (!File.Exists(filePath)) File.WriteAllText(filePath, "[]");
    var json = File.ReadAllText(filePath);
    var data = JsonSerializer.Deserialize<List<Item>>(json) ?? new List<Item>();
    return Results.Ok(data);
});

// ۳. متد POST: گرفتن آیتم جدید از ریکت و اضافه کردن به فایل
app.MapPost("/api/data", (Item newItem) =>
{
    if (!File.Exists(filePath)) File.WriteAllText(filePath, "[]");
    
    var json = File.ReadAllText(filePath);
    var data = JsonSerializer.Deserialize<List<Item>>(json) ?? new List<Item>();
    
    newItem.Id = DateTime.Now.Ticks; // ساخت شناسه منحصربه‌فرد
    data.Insert(0, newItem); // اضافه کردن به ابتدای لیست
    
    File.WriteAllText(filePath, JsonSerializer.Serialize(data, new JsonSerializerOptions { WriteIndented = true }));
    return Results.Ok(new { success = true, data });
});

app.Run();

// مدل ساختار داده‌ای ما
public class Item
{
    public long Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Price { get; set; } = string.Empty;
}