const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const multer = require('multer');
const { protect } = require('./middleware/authMiddleware');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI, {}).then(() => console.log('MongoDB Connected')).catch(err => console.error(err));

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'public/uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Застосовуємо middleware для завантаження файлів тільки до захищених маршрутів
const postRoutes = require('./routes/postRoutes');
app.use('/api/posts', (req, res, next) => {
    if ((req.method === 'POST' || req.method === 'PUT') && req.headers.authorization) {
        protect(req, res, (err) => {
            if (err) return next(err);
            upload.single('image')(req, res, next);
        });
    } else {
        next();
    }
}, postRoutes);

app.use('/api/users', require('./routes/userRoutes'));

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));