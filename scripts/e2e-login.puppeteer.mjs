import puppeteer from 'puppeteer';

(async () => {
  const base = process.env.APP_URL || 'https://nohvex-nextjs-exchange.vercel.app';
  const username = process.env.NX_USERNAME;
  const password = process.env.NX_PASSWORD;
  if (!username || !password) {
    console.error('NX_USERNAME/NX_PASSWORD must be set as environment variables.');
    process.exit(1);
  }

  const browser = await puppeteer.launch({ headless: 'new' });
  try {
    const page = await browser.newPage();
    page.setDefaultTimeout(30000);

    // 1) Go to NextAuth sign-in page (adjust if you have a custom signin route)
    await page.goto(`${base}/api/auth/signin`, { waitUntil: 'networkidle0' });

    // 2) Try to fill either username or email field
    const hasUsername = await page.$('input[name="username"]');
    const hasEmail = await page.$('input[name="email"]');

    if (hasUsername) {
      await page.type('input[name="username"]', username);
    } else if (hasEmail) {
      await page.type('input[name="email"]', username);
    } else {
      console.error('Could not find username/email input on the sign-in page.');
      process.exit(2);
    }

    // 3) Fill password
    const hasPassword = await page.$('input[name="password"]');
    if (!hasPassword) {
      console.error('Could not find password input on the sign-in page.');
      process.exit(2);
    }
    await page.type('input[name="password"]', password);

    // 4) Submit form
    const submit = await page.$('button[type="submit"], button[name="submit"]');
    if (!submit) {
      console.error('Could not find submit button on the sign-in page.');
      process.exit(2);
    }
    await Promise.all([
      submit.click(),
      page.waitForNavigation({ waitUntil: 'networkidle0' })
    ]);

    // 5) Check session endpoint
    const resp = await page.goto(`${base}/api/auth/session`, { waitUntil: 'networkidle0' });
    const text = await resp.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      console.error('Session response is not JSON:', text.slice(0, 300));
      process.exit(3);
    }

    if (json && json.user && json.user.email) {
      console.log(`Authenticated as: ${json.user.email}`);
      if (json.expires) console.log(`Session expires: ${json.expires}`);
      process.exit(0);
    } else {
      console.error('Not authenticated. Session payload:', JSON.stringify(json).slice(0, 300));
      process.exit(4);
    }
  } catch (err) {
    console.error('E2E login error:', err?.message || err);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();

