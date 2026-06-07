const { chromium } = require('playwright');

(async () => {
  console.log('🚀 Launching browser to verify updated responsiveness and auth bindings...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const consoleErrors = [];
  const pageErrors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(`[Console Error] ${msg.text()}`);
    } else {
      console.log(`[Console ${msg.type()}] ${msg.text()}`);
    }
  });

  page.on('pageerror', err => {
    pageErrors.push(`[Page Error] ${err.toString()}`);
  });

  try {
    console.log('🌐 Navigating to http://localhost:8000...');
    await page.goto('http://localhost:8000');
    
    console.log('⌛ Waiting for loading screen...');
    await page.waitForSelector('#loadingScreen', { state: 'hidden', timeout: 5000 });
    
    const isAuthVisible = await page.isVisible('#authOverlay');
    console.log(`Auth overlay visible: ${isAuthVisible}`);
    
    if (isAuthVisible) {
      console.log('🔑 Performing Quick Admin Login...');
      await page.click('.admin-quick-login-btn');
      
      console.log('⌛ Waiting for dashboard transition...');
      await page.waitForSelector('#mainApp', { state: 'visible', timeout: 5000 });
    }
    
    await page.waitForTimeout(1000);
    
    console.log('🧭 Clicking Dashboard...');
    await page.click('text=Dashboard');
    await page.waitForTimeout(1000);
    
    console.log('🧭 Clicking Home...');
    await page.click('text=Home');
    await page.waitForTimeout(1000);
    
    console.log('🏁 UI testing finished.');

  } catch (err) {
    console.error('❌ Test execution failed:', err);
    pageErrors.push(`[Test Exec Error] ${err.message}`);
  } finally {
    await browser.close();
  }

  console.log('--- TEST RESULTS ---');
  if (consoleErrors.length > 0) {
    console.log(`⚠️ Console errors found (${consoleErrors.length}):`);
    consoleErrors.forEach(err => console.log(err));
  } else {
    console.log('✅ No console errors detected.');
  }

  if (pageErrors.length > 0) {
    console.log(`❌ Page errors / exceptions found (${pageErrors.length}):`);
    pageErrors.forEach(err => console.log(err));
    process.exit(1);
  } else {
    console.log('✅ No page exceptions detected.');
    process.exit(0);
  }
})();
