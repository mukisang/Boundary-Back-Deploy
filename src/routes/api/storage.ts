import multer  from 'multer';
import { setting } from '../../config.js';
const filePath = setting.filePath
const uploadOption = multer({
    dest : filePath,
    storage : multer.diskStorage({
    destination : (req, file, cb) => {
        cb(null, filePath)
    },
    filename: (req, file, cb) => {
        var filetype = '';
        if (file.mimetype === 'image/gif') {
            filetype = 'gif';
        }
        if (file.mimetype === 'image/png') {
            filetype = 'png';
        }
        if (file.mimetype === 'image/jpeg') {
            filetype = 'jpg';
        }
        cb(null, 'image-' + Date.now() + '.' + filetype);
    }
    })
})

export {uploadOption}