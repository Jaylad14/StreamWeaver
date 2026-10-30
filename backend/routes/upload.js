const express = require('express');
const busboy = require('busboy');
const fs = require('fs');
const path = require('path');
const { saveFileInfo } = require('../utils/fileStore');
const CSVParser = require('../utils/csvParser');
const FileValidator = require('../utils/fileValidator');

const router = express.Router();
const TMP_DIR = path.join(__dirname, '../tmp');

router.post('/', (req, res) => {
  const bb = busboy({ headers: req.headers, limits: { fileSize: 100 * 1024 * 1024 } });
  let fileId = null;
  let filePath = null;
  let uploadError = null;
  let responseSent = false;

  const sendResponse = (statusCode, data) => {
    if (!responseSent) {
      responseSent = true;
      res.status(statusCode).json(data);
    }
  };

  bb.on('file', (fieldname, file, info) => {
    const fileName = info.filename;
    console.log('Upload request received');
    console.log('File received:', fileName);

    const fileNameValidation = FileValidator.validateFileName(fileName);
    if (!fileNameValidation.valid) {
      uploadError = fileNameValidation.error;
      file.resume();
      return;
    }

    fileId = require('crypto').randomUUID();
    const sanitizedName = `${fileId}-${fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    filePath = path.join(TMP_DIR, sanitizedName);

    const writeStream = fs.createWriteStream(filePath);

    file.pipe(writeStream);

    writeStream.on('finish', () => {
      console.log('Upload closed, processing...');

      const ext = fileName.split('.').pop().toLowerCase();
      console.log('File extension:', ext);
      console.log('File ID:', fileId);

      try {
        if (ext === 'json') {
          console.log('Parsing JSON...');
          const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          const rows = Array.isArray(data) ? data : [data];
          const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

          console.log('JSON parsed, rows:', rows.length);

          saveFileInfo(fileId, {
            name: sanitizedName,
            path: filePath,
            rowCount: rows.length,
            columns: columns
          });

          sendResponse(200, {
            success: true,
            fileId: fileId,
            file: {
              name: fileName,
              path: filePath,
              sizeBytes: fs.statSync(filePath).size,
              sizeMB: (fs.statSync(filePath).size / 1024 / 1024).toFixed(2)
            },
            data: {
              rowCount: rows.length,
              columns: columns
            },
            memory: {
              heapUsedMB: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2),
              heapTotalMB: (process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2)
            }
          });

          console.log('File saved:', sanitizedName);
        } else if (ext === 'csv') {
          console.log('Parsing CSV...');
          CSVParser.parseFile(filePath).then(({ headers, rows }) => {
            console.log('CSV parsed, rows:', rows.length);

            saveFileInfo(fileId, {
              name: sanitizedName,
              path: filePath,
              rowCount: rows.length,
              columns: headers
            });

            sendResponse(200, {
              success: true,
              fileId: fileId,
              file: {
                name: fileName,
                path: filePath,
                sizeBytes: fs.statSync(filePath).size,
                sizeMB: (fs.statSync(filePath).size / 1024 / 1024).toFixed(2)
              },
              data: {
                rowCount: rows.length,
                columns: headers
              },
              memory: {
                heapUsedMB: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2),
                heapTotalMB: (process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2)
              }
            });

            console.log('File saved:', sanitizedName);
          }).catch((error) => {
            console.error('CSV parse error:', error.message);
            fs.unlinkSync(filePath);
            sendResponse(400, { error: 'The CSV file could not be read. Check its format.' });
          });
        }
      } catch (error) {
        console.error('Processing error:', error.message);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        sendResponse(400, { error: 'The file could not be processed.' });
      }
    });

    writeStream.on('error', (error) => {
      console.error('Write error:', error.message);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      sendResponse(500, { error: 'The file could not be saved.' });
    });
  });

  bb.on('error', (error) => {
    console.error('Upload error:', error.message);
    sendResponse(400, { error: 'Upload failed.' });
  });

  req.pipe(bb);
});

module.exports = router;
