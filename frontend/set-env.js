import { writeFileSync } from 'fs';
import { networkInterfaces } from 'os';

const nets = networkInterfaces();
let ip = 'localhost';
const ips = [];

for (const name of Object.keys(nets)) {
  for (const net of nets[name]) {
    if (net.family === 'IPv4' && !net.internal) {
      ips.push(net.address);
    }
  }
}

ip = ips.find(addr => addr.startsWith('192.168.100.')) ||
  ips.find(addr => addr.startsWith('192.168.1.')) ||
  ips.find(addr => addr.startsWith('192.168.')) ||
  ips[0] || 'localhost';

writeFileSync('.env', `VITE_BACKEND_URL=http://${ip}:3000\n`);
console.log(`Backend URL set to: http://${ip}:3000`);
