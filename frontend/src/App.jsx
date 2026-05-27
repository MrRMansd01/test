import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

export default function App() {
  // Stateهای اصلی
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [formData, setFormData] = useState({ title: '', category: 'کتاب', price: '' });

  // ۱. گرفتن داده‌ها از سرور نود جی اس در ابتدای لود صفحه
  useEffect(() => {
    fetch('http://localhost:5041/api/data')
      .then((res) => res.json())
      .then((savedData) => setData(savedData))
      .catch((err) => console.error('خطا در دریافت اطلاعات از سرور:', err));
  }, []);

  // ۲. مدیریت تغییرات اینپوت‌های فرم
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ۳. سابمیت فرم و ارسال داده به سرور
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return alert('لطفاً عنوان را وارد کنید');

    const newItem = {
      title: formData.title,
      category: formData.category,
      price: formData.price || 'رایگان',
    };

    try {
      const response = await fetch('http://localhost:5041/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });
      const resData = await response.json();

      if (resData.success) {
        setData(resData.data); // لیست جدید ارسالی از سرور جایگزین می‌شود
      }
      setFormData({ title: '', category: 'کتاب', price: '' }); // ریست فرم
    } catch (err) {
      alert('خطا در ارتباط با سرور و ذخیره داده!');
    }
  };

  // ۴. منطق فیلتر و سرچ همزمان (Derived State)
  const filteredData = data.filter((item) => {
    const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterCategory === 'All' || item.category === filterCategory;
    return matchesSearch && matchesFilter;
  });

  // ۵. خروجی اکسل (Excel Export) از داده‌های فیلتر شده موجود در صفحه
  const exportToExcel = () => {
    if (filteredData.length === 0) return alert('داده‌ای برای خروجی گرفتن وجود ندارد!');

    const excelRows = filteredData.map(({ title, category, price }) => ({
      'عنوان آیتم': title,
      'دسته‌بندی': category,
      'قیمت / وضعیت': price,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'DataList');
    XLSX.writeFile(workbook, 'exported_data.xlsx');
  };

  return (
    <div className="landing-container">
      <header className="hero-section">
        <h1>سامانه مدیریت محتوا با خروجی اکسل</h1>
        <p>داده‌ها در فایل دیتابیس (JSON) ذخیره می‌شوند و با رفرش پاک نخواهند شد.</p>
      </header>

      <div className="main-layout">
        {/* بخش فرم افزودن */}
        <section className="card-box">
          <h3>➕ افزودن آیتم جدید</h3>
          <form onSubmit={handleFormSubmit} className="main-form">
            <div className="form-group">
              <label>عنوان آیتم:</label>
              <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="مثلا: دوره جاوااسکریپت..." />
            </div>

            <div className="form-group">
              <label>نوع دسته‌بندی:</label>
              <select name="category" value={formData.category} onChange={handleInputChange}>
                <option value="کتاب">کتاب</option>
                <option value="دوره">دوره</option>
                <option value="پادکست">پادکست</option>
              </select>
            </div>

            <div className="form-group">
              <label>قیمت / وضعیت:</label>
              <input type="text" name="price" value={formData.price} onChange={handleInputChange} placeholder="مثلا: رایگان یا مبلغ..." />
            </div>

            <button type="submit" className="btn-submit">ثبت در دیتابیس واقعی</button>
          </form>
        </section>

        {/* بخش سرچ، فیلتر و لیست */}
        <section className="card-box">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3>🔍 فیلتر و جستجو</h3>
            <button onClick={exportToExcel} className="btn-submit" style={{ width: 'auto', background: '#107c41', padding: '8px 15px' }}>
              🟢 خروجی اکسل (Excel)
            </button>
          </div>

          <div className="filter-wrapper">
            <input type="text" placeholder="جستجو در عنوان..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="search-input" />
            
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="filter-select">
              <option value="All">همه دسته‌ها</option>
              <option value="کتاب">کتاب</option>
              <option value="دوره">دوره</option>
              <option value="پادکست">پادکست</option>
            </select>
          </div>

          <hr />

          <h3>📋 لیست آیتم‌ها ({filteredData.length})</h3>
          <div className="list-container">
            {filteredData.length === 0 ? (
              <p className="empty-msg">هیچ داده‌ای با این مشخصات پیدا نشد!</p>
            ) : (
              filteredData.map((item) => (
                <div key={item.id} className="list-item">
                  <div>
                    <h4>{item.title}</h4>
                    <span className="badge">{item.category}</span>
                  </div>
                  <div className="item-price">{item.price}</div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}