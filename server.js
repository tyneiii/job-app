const express = require('express');
const path = require('path');

const app = express();
const PORT = 5003;

// Cấu hình Express phục vụ file tĩnh trong thư mục "public"
app.use(express.static(path.join(__dirname, 'public')));

// Điều hướng tất cả request khác về index.html (cho ứng dụng SPA)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Khởi động server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
