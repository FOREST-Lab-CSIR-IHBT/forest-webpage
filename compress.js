const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const dirs = [
  { dir: './images/team', width: 800, height: 1000, quality: 70, maxSize: 300000, fit: 'inside' },
  { dir: './images/beyond', width: 600, height: 600, quality: 70, maxSize: 200000, fit: 'cover' },
  { dir: './images/gallery', width: 1200, height: 800, quality: 75, maxSize: 400000, fit: 'cover' },
];

dirs.forEach(({ dir, width, height, quality, maxSize, fit }) => {
  if (!fs.existsSync(dir)) return;

  const files = fs.readdirSync(dir).filter(f => f.toLowerCase().endsWith('.jpg'));

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const fileSize = fs.statSync(filePath).size;

    if (fileSize <= maxSize) {
      console.log(`⏭ skipping ${file} (already small: ${Math.round(fileSize/1024)}kb)`);
      return;
    }

    const tmpPath = filePath + '_tmp.jpg';
    sharp(filePath)
      .resize(width, height, { fit: fit || 'cover', position: 'top' })
      .jpeg({ quality })
      .toFile(tmpPath)
      .then(() => {
        fs.renameSync(tmpPath, filePath);
        console.log(`✓ compressed ${file}`);
      })
      .catch(err => console.error(`Error: ${file}`, err));
  });
});