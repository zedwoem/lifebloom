const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/travel/rates?origin=CGK&destination=DPS&depart_date=2026-10-10',
  method: 'GET',
};

const req = http.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`);
  let data = '';
  res.on('data', d => {
    data += d;
  });
  res.on('end', () => {
    console.log(data.substring(0, 500));
  })
});

req.on('error', error => {
  console.error(error);
});

req.end();
