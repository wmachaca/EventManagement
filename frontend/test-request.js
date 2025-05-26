import https from 'https';
import { HttpsProxyAgent } from 'https-proxy-agent';

const proxyUrl = 'http://proxy.cnea.gob.ar:1280';
const agent = new HttpsProxyAgent(proxyUrl);

const options = {
  hostname: 'accounts.google.com',
  port: 443,
  path: '/',
  method: 'GET',
  agent: agent,
};

const req = https.request(options, res => {
  console.log(`Status: ${res.statusCode}`);
  res.on('data', chunk => {
    console.log(`BODY: ${chunk}`);
  });
});

req.on('error', e => {
  console.error(`Request error: ${e.message}`);
});

req.end();
