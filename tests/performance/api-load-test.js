import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 },  // Ramp up to 20 users
    { duration: '1m', target: 20 },   // Stay at 20 users
    { duration: '30s', target: 0 },   // Ramp down
  ],
};

const BASE_URL = 'http://localhost:3000';

export default function () {
  // Test health endpoint
  const healthRes = http.get(`${BASE_URL}/api/health`);
  check(healthRes, {
    'health endpoint responds': (r) => r.status === 200,
    'health response time < 500ms': (r) => r.timings.duration < 500,
  });

  // Test prices endpoint
  const pricesRes = http.get(`${BASE_URL}/api/prices?symbols=BTC,ETH`);
  check(pricesRes, {
    'prices endpoint responds': (r) => r.status === 200 || r.status === 400,
    'prices response time < 2s': (r) => r.timings.duration < 2000,
  });

  sleep(1);
}
