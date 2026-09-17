const express = require('express');
const busboy = require('busboy');
const fs = require('fs');
const path = require('path');
const CSVStreamParser = require('../utils/streamParser');

const router = express.Router();

// Create tmp directory if it doesn't exist
const tmpDir = path.join(__dirname, '../tmp');
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir);
}

/**
 * POST /api/upload
 * Stream multipart file upload
 * Returns: file path, row count, headers, memory used
 */
router.post('/', (req, res) => {
  const bb = busboy({ headers: req.headers });
  let fileSize = 0;
  let uploadedFile = null;
  let metadata = null;

  bb.on('file', (fieldname, file, info) => {
    const fileName = `${Date.now()}-${info.filename}`;
    const filePath = path.join(tmpDir, fileName);

    uploadedFile = filePath;
    const writeStream = fs.createWriteStream(filePath);

    // Track file size as it streams in
    file.on('data', (chunk) => {
      fileSize += chunk.length;
    });

    // Pipe file directly to disk
    file.pipe(writeStream);

    writeStream.on('finish', () => {
      console.log(`File uploaded: ${fileName} (${(fileSize / 1024 / 1024).toFixed(2)} MB)`);
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

    // Parse the uploaded file to extract metadata
    try {
      const parser = new CSVStreamParser(uploadedFile);
      const transformStream = parser.createTransformStream();
      const readStream = fs.createReadStream(uploadedFile);

      readStream.pipe(transformStream)
        .on('data', (row) => {
          // Consume rows to count them (don't store in memory)
        })
        .on('end', () => {
          metadata = parser.getMetadata();

          res.json({
            success: true,
            file: {
              name: path.basename(uploadedFile),
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
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Processing failed' });
    }
  });

  req.pipe(bb);
});

module.exports = router;
