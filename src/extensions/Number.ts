Number.prototype.toDuration = function (unit: 'seconds' | 'milliseconds' = 'seconds') {
  let seconds: number;
  if (unit === 'milliseconds') {
    seconds = this.valueOf() / 1000;
  } else {
    seconds = this.valueOf();
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  const secs = (seconds % 60).toFixed(3);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};
Number.prototype.toFileSize = function () {
  if (this.valueOf() === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(this.valueOf()) / Math.log(k));
  return parseFloat((this.valueOf() / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
