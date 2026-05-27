const express = require('express');
const fs = require('fs');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const filePath = path.join(__dirname, 'data.json');

// ۱. دریافت اطلاعات از فایل JSON
app.get('/api/data', (req, res) => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '[]');
  }
  const fileData = fs.readFileSync(filePath, 'utf8');
  res.json(JSON.parse(fileData || '[]'));
});

// ۲. ذخیره اطلاعات جدید در فایل JSON
app.post('/api/data', (req, res) => {
  const currentData = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf8') || '[]') : [];
  
  // ساخت آیتم جدید با شناسه یکتا
  const newItem = {
    id: Date.now(),
    ...req.body
  };
  
  currentData.unshift(newItem); // اضافه کردن به ابتدای آرایه
  fs.writeFileSync(filePath, JSON.stringify(currentData, null, 2));
  res.json({ success: true, data: currentData });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));