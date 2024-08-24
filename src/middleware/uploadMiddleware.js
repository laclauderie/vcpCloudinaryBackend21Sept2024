// vcpBackend/src/middleware/uploadMiddleware.js
const multer = require('multer');

const storage = multer.memoryStorage(); // Use memoryStorage to keep file in memory

const upload = multer({ storage: storage });

module.exports = upload;
