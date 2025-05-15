// Importing axios and HttpsProxyAgent using CommonJS syntax
import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';

// Retrieve the proxy from environment variables (HTTPS_PROXY or https_proxy)
const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
console.error('this is the proxy:', proxy);

// Check if proxy is defined, and if so, create an agent for it
const agent = proxy ? new HttpsProxyAgent(proxy) : null;

// Test the proxy by making a GET request to google.com
axios
  .get('https://www.google.com', { httpsAgent: agent })
  .then(response => {
    console.log('Response data:', response.data);
  })
  .catch(error => {
    console.error('Proxy test error:', error.message);
    if (error.response) {
      console.error('Response error:', error.response.data);
    }
    if (error.config) {
      console.error('Error config:', error.config);
    }
  });
