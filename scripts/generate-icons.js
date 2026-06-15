const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateIcons() {
  const inputPath = path.join(__dirname, '../public/dmvlogo.jpg');
  
  if (!fs.existsSync(inputPath)) {
    console.error('Source image not found');
    process.exit(1);
  }

  try {
    await sharp(inputPath)
      .resize(192, 192)
      .png()
      .toFile(path.join(__dirname, '../public/icon-192x192.png'));
    
    await sharp(inputPath)
      .resize(512, 512)
      .png()
      .toFile(path.join(__dirname, '../public/icon-512x512.png'));
      
    console.log('Icons generated successfully!');
  } catch (err) {
    console.error('Error generating icons:', err);
  }
}

generateIcons();
