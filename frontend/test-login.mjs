import { chromium } from 'playwright';

async function testLogin() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('🔍 Starting login test...\n');

    // Navigate to login page
    console.log('📍 Navigating to http://localhost:5173/login');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });

    // Wait for form to be visible
    await page.waitForSelector('input[type="email"]', { timeout: 5000 });
    console.log('✅ Login form loaded\n');

    // Fill in credentials
    console.log('📝 Filling in credentials...');
    await page.fill('input[type="email"]', 'admin@printingpress.com');
    await page.fill('input[type="password"]', 'admin123');
    console.log('✅ Credentials entered\n');

    // Click login button
    console.log('🔐 Clicking login button...');
    await page.click('button[type="submit"]');

    // Wait for navigation
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 10000 });
    console.log('✅ Navigation complete\n');

    // Get current URL
    const currentUrl = page.url();
    console.log(`📍 Current URL: ${currentUrl}\n`);

    // Check localStorage
    const isSuperAdmin = await page.evaluate(() => localStorage.getItem('isSuperAdmin'));
    const companyId = await page.evaluate(() => localStorage.getItem('selectedCompanyId'));
    const token = await page.evaluate(() => localStorage.getItem('access_token'));

    console.log('📊 LocalStorage State:');
    console.log(`  - isSuperAdmin: ${isSuperAdmin}`);
    console.log(`  - selectedCompanyId: ${companyId}`);
    console.log(`  - access_token: ${token ? '✅ Present' : '❌ Missing'}\n`);

    // Get page title and heading
    const title = await page.title();
    const heading = await page.textContent('h1, h2');

    console.log('📄 Page Content:');
    console.log(`  - Title: ${title}`);
    console.log(`  - Heading: ${heading}\n`);

    // Check if we're on company selector or dashboard
    const companySelector = await page.$('.company-selector, [data-testid="company-selector"]');
    const dashboard = await page.$('[data-testid="dashboard"], .dashboard');

    if (companySelector) {
      console.log('✅ Super-admin flow: Company selector page displayed');
    } else if (dashboard) {
      console.log('✅ Regular user flow: Dashboard displayed');
    } else {
      console.log('⚠️  Unknown page state');
    }

    // Take screenshot
    await page.screenshot({ path: '/tmp/login-test-screenshot.png' });
    console.log('\n📸 Screenshot saved to /tmp/login-test-screenshot.png');

  } catch (error) {
    console.error('❌ Error during test:', error.message);
  } finally {
    await browser.close();
  }
}

testLogin();
