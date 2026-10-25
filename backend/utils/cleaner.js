const isEmpty = (value) => {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string') return value.trim() === '';
  return false;
};

const cleanRows = (rows, options = {}) => {
  const report = {
    inputRows: rows.length,
    removedEmptyRequired: 0,
    filledCells: 0,
    removedDuplicates: 0,
    trimmedCells: 0,
    outputRows: 0
  };

  let result = rows;

  if (options.removeEmptyRequired && options.removeEmptyRequired.column) {
    const column = options.removeEmptyRequired.column;
    result = result.filter((row) => {
      if (isEmpty(row[column])) {
        report.removedEmptyRequired += 1;
        return false;
      }
      return true;
    });
  }

  if (options.fillEmpty && options.fillEmpty.column) {
    const { column, value } = options.fillEmpty;
    result = result.map((row) => {
      if (isEmpty(row[column])) {
        report.filledCells += 1;
        return { ...row, [column]: value ?? 'N/A' };
      }
      return row;
    });
  }

  if (options.trimSpaces) {
    result = result.map((row) => {
      const trimmed = { ...row };
      for (const key of Object.keys(trimmed)) {
        if (typeof trimmed[key] === 'string') {
          const next = trimmed[key].trim();
          if (next !== trimmed[key]) {
            report.trimmedCells += 1;
            trimmed[key] = next;
          }
        }
      }
      return trimmed;
    });
  }

  if (options.removeDuplicates) {
    const seen = new Set();
    result = result.filter((row) => {
      const key = JSON.stringify(row);
      if (seen.has(key)) {
        report.removedDuplicates += 1;
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  report.outputRows = result.length;
  return { rows: result, report };
};

module.exports = { cleanRows };
