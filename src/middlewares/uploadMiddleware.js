import multer from 'multer';
import { AppError } from '../utils/appError.js';

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 0.5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype == 'application/pdf') {
            cb(null, true);
        }
        else {
            const error = new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'resume');
            error.message = 'Only PDFs are allowed';
            cb(error)
        }
    }
}).single('resume');

export default function uploadMiddleware(req, res, next){
    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            next(new AppError(`Upload error: ${err.message}`, 400));
        } else if (err) {
            next(new AppError('Unknown file parsing error'));
        }
        next();
    })
}