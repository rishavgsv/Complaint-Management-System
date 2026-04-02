import multer from 'multer';
import path from 'path';

// Store in RAM temporarily so `sharp` can compress it BEFORE hitting the hard-drive
const storage = multer.memoryStorage();

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit for students to prevent RAM exhaustion
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only Images (JPEG, PNG, WebP) are allowed!'));
        }
    }
});

export default upload;
