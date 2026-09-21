const fileStore = {};

function saveFileInfo(fileId, fileInfo) {
  fileStore[fileId] = fileInfo;
}

function getFileInfo(fileId) {
  return fileStore[fileId];
}

module.exports = { saveFileInfo, getFileInfo };
