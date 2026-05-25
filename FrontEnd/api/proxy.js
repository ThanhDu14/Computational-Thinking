const http = require('http');

module.exports = async (req, res) => {
  // Lấy path thực tế sau "/api" (ví dụ: /auth/local/register)
  const path = req.url.replace(/^\/api/, '');
  const targetUrl = `http://13.229.155.181:8080/api${path}`;

  const url = new URL(targetUrl);

  // Thiết lập các thông số request gửi đến Go backend
  const options = {
    hostname: url.hostname,
    port: url.port || 80,
    path: url.pathname + url.search,
    method: req.method,
    headers: {
      ...req.headers,
      host: url.host, // Ghi đè host header thành IP backend
    },
  };

  // Tạo request chuyển tiếp
  const proxyReq = http.request(options, (proxyRes) => {
    // Trả về Header và Status Code y hệt như backend trả về
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    // Chuyển tiếp luồng dữ liệu (Stream) từ backend về client
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error('Lỗi Proxy:', err);
    res.status(500).json({ error: 'Proxy failed', details: err.message });
  });

  // Chuyển tiếp luồng dữ liệu từ Client (request body, files...) đến backend
  req.pipe(proxyReq);
};
