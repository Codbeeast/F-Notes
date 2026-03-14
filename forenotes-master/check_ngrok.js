const http = require('http');

http.get('http://127.0.0.1:4040/api/requests/http', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log(`\n================================`);
      console.log(` Found ${json.requests.length} requests in Ngrok history`);
      console.log(`================================\n`);
      
      json.requests.forEach(r => {
          console.log(`[${r.request.method}] ${r.request.uri}`);
          console.log(`   Status: ${r.response.status_code}`);
          console.log('--------------------------------');
      });
    } catch (e) {
      console.log('Failed to parse:', e.message);
    }
  });
}).on('error', (err) => {
  console.log('Error fetching from Ngrok API:', err.message);
});
