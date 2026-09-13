const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const dirs = [
  { dir: './images/team', width: 800, height: 600, quality: 70 },
  { dir: './images/beyond', width: 600, height: 600, quality: 70 },
  { dir: './images/gallery', width: 1200, height: 800, quality: 75 },
  { dir: './images/alumni', width: 400, height: 400, quality: 70 }
];

dirs.forEach(({ dir, width, height, quality }) => {
  if (!fs.existsSync(dir)) return;

  const files = fs.readdirSync(dir).filter(f => f.toLowerCase().endsWith('.jpg'));
  console.log(`Processing ${files.length} images in ${dir}...`);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const tmpPath = filePath + '_tmp.jpg';

    sharp(filePath)
      .resize(width, height, { fit: 'cover', position: 'center' })
      .jpeg({ quality })
      .toFile(tmpPath)
      .then(() => {
        fs.renameSync(tmpPath, filePath);
        console.log(`✓ ${file}`);
      })
      .catch(err => console.error(`Error: ${file}`, err));
  });
});