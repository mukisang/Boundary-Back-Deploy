const multer = require('multer')

const upload = multer({
    dest : 'profiles/',
    storage : multer.diskStorage({
    destination : (req, file, cb) => {
        cb(null, 'profiles/')
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

exports.upload = upload