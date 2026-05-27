import http from 'http';

// Tắt tự động parse body để giữ luồng dữ liệu (stream) nguyên vẹn,
// hỗ trợ cả việc chuyển tiếp JSON và upload file lớn (multipart/form-data).
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  try {
    // Phân tích URL của request đến proxy
    const url = new URL(req.url, 'http://localhost');
    const pathParam = url.searchParams.get('path') || '';
    
    // Xóa tham số 'path' để không bị chuyển tiếp sang backend
    url.searchParams.delete('path');

    // Tạo URL đích chuyển tiếp sang backend
    const targetUrl = `http://13.229.155.181:8080/api/${pathParam}${url.search}`;
    const target = new URL(targetUrl);

    // Cấu hình request gửi tới Go backend
    const options = {
      hostname: target.hostname,
      port: target.port || 80,
      path: target.pathname + target.search,
      method: req.method,
      headers: {
        ...req.headers,
        host: target.host, // Ghi đè host thành host của backend
      },
    };

    // Tạo request chuyển tiếp đến Go backend
    const proxyReq = http.request(options, (proxyRes) => {
      // Gửi Header và Status Code của backend về client
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      // Pipe dữ liệu từ backend về client
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
      console.error('Lỗi Proxy:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Proxy failed', details: err.message }));
    });

    // Chuyển tiếp stream body của client đến backend
    req.pipe(proxyReq);
  } catch (error) {
    console.error('Lỗi xử lý Proxy:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Proxy initialization error', details: error.message }));
  }
}
