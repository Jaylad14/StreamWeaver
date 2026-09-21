const express = require('express');
const busboy = require('busboy');
const fs = require('fs');
const path = require('path');
const CSVStreamParser = require('../utils/streamParser');
const { saveFileInfo } = require('../utils/fileStore');

const router = express.Router();

const tmpDir = path.join(__dirname, '../tmp');
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir);
}

router.post('/', (req, res) => {
  console.log('Upload request received');
  
  const bb = busboy({ headers: req.headers });
  let fileSize = 0;
  let uploadedFile = null;
  let fileName = null;

  bb.on('file', (fieldname, file, info) => {
    console.log('File received:', info.filename);
    
    fileName = `${Date.now()}-${info.filename}`;
    const filePath = path.join(tmpDir, fileName);

    uploadedFile = filePath;
    const writeStream = fs.createWriteStream(filePath);

    file.on('data', (chunk) => {
      fileSize += chunk.length;
    });

    file.pipe(writeStream);

    writeStream.on('finish', () => {
      console.log(`File saved: ${fileName}`);
    });

    writeStream.on('error', (err) => {
      console.error('Write error:', err);
      res.status(500).json({ error: 'Upload failed' });
    });
  });

  bb.on('close', () => {
    if (!uploadedFile) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
      const fileExt = path.extname(fileName).toLowerCase();
      const fileId = fileName.split('-')[0];
      
      if (fileExt === '.json') {
        const data = JSON.parse(fs.readFileSync(uploadedFile, 'utf8'));
        const rows = Array.isArray(data) ? data : [data];
        const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

        saveFileInfo(fileId, {
          name: fileName,
          path: uploadedFile,
          type: 'json'
        });

        res.json({
          success: true,
          fileId: fileId,
          file: {
            name: fileName,
            path: uploadedFile,
            sizeBytes: fileSize,
            sizeMB: (fileSize / 1024 / 1024).toFixed(2),
          },
          data: {
            rowCount: rows.length,
            columns: columns,
          },
          memory: {
            heapUsedMB: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2),
            heapTotalMB: (process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2),
          },
        });
      } else {
        const parser = new CSVStreamParser(uploadedFile);
        const transformStream = parser.createTransformStream();
        const readStream = fs.createReadStream(uploadedFile);

        readStream.pipe(transformStream)
          .on('data', (row) => {
          })
          .on('end', () => {
            const metadata = parser.getMetadata();

            saveFileInfo(fileId, {
              name: fileName,
              path: uploadedFile,
              type: 'csv'
            });

            res.json({
              success: true,
              fileId: fileId,
              file: {
                name: fileName,
                path: uploadedFile,
                sizeBytes: fileSize,
                sizeMB: (fileSize / 1024 / 1024).toFixed(2),
              },
              data: {
                rowCount: metadata.rowCount,
                columns: metadata.headers,
              },
              memory: {
                heapUsedMB: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2),
                heapTotalMB: (process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2),
              },
            });
          })
          .on('error', (err) => {
            console.error('Parse error:', err);
            res.status(500).json({ error: 'File parsing failed' });
          });
      }
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Processing failed: ' + error.message });
    }
  });

  bb.on('error', (err) => {
    console.error('Busboy error:', err);
    res.status(500).json({ error: 'Upload failed' });
  });

  req.pipe(bb);
});

module.exports = router;
