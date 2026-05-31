const { createStream } = require('rotating-file-stream');
const path = require('path');

module.exports = (opts) => {
  const filePath = opts.file || 'logs/api.log';
  const directory = path.dirname(filePath);
  const filename = path.basename(filePath);
  return createStream(filename, {
    interval: opts.interval,
    maxFiles: opts.maxFiles,
    path: directory,
  });
};
