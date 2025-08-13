// Cleanup old test file
import fs from 'fs';

try {
  if (fs.existsSync('./test_cloudinary_upload.mjs')) {
    fs.unlinkSync('./test_cloudinary_upload.mjs');
    console.log('✅ Cleaned up test file');
  }
} catch (error) {
  console.log('File cleanup done');
}
