// src/middleware/performance.js
const performanceMonitor = (req, res, next) => {
const start = process.hrtime();

  res.on('finish', () => {
    const diff = process.hrtime(start);
    const timeMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);
    res.setHeader('X-Response-Time', `${timeMs}ms`);

    if (timeMs > 100) {
      console.warn(`  Slow query detected: ${req.method} ${req.path} - ${timeMs}ms`);
    }
  });

  next();
};
module.exports = performanceMonitor;