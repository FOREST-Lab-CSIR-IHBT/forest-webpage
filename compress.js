const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const jobs = [
  {
    inputDir: './images/team',
    outputDir: './images/team-compressed',
    width: 800,
    height: 600,
    quality: 70
  },
  {
    inputDir: './images/beyond',
    outputDir: './images/beyond-compressed',
    width: 600,
    height: 600,
    quality: 70
  }
];

jobs.forEach(job => {
  if (!fs.existsSync(job.outputDir)) fs.mkdirSync(job.outputDir, { recursive: true });

  const files = fs.readdirSync(job.inputDir).filter(f => f.toLowerCase().endsWith('.jpg'));
  console.log(`Found ${files.length} images in ${job.inputDir}`);

  Promise.all(files.map(file => {
    return sharp(path.join(job.inputDir, file))
      .resize(job.width, job.height, { fit: 'cover', position: 'center' })
      .jpeg({ quality: job.quality })
      .toFile(path.join(job.outputDir, file))
      .then(() => console.log(`✓ ${file}`));
  })).then(() => {
    console.log(`Done with ${job.inputDir}`);
  }).catch(err => console.error(err));
});