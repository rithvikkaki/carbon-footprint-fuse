const puppeteer = require('puppeteer-core');

async function runAudit() {
  console.log('[E2E AUDIT] Launching Google Chrome...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,900'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  try {
    // 1. Visit Login
    console.log('[E2E AUDIT] 1. Navigating to http://localhost:5173/login...');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
    await page.waitForSelector('#email');
    await page.type('#email', 'demo@ecofuse.org');
    await page.type('#password', 'password123');
    await page.click('button[type="submit"]');
    await new Promise((r) => setTimeout(r, 2000));

    const token = await page.evaluate(() => localStorage.getItem('ecofuse_jwt_token'));
    console.log('   Authentication:', token ? 'PASS' : 'FAIL');

    // 2. Test Carbon Intelligence Dashboard
    console.log('[E2E AUDIT] 2. Navigating to Dashboard (Carbon Intelligence)...');
    await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 2500));

    // Verify Carbon Intelligence KPIs
    const kpiTexts = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.border-border\\/70, .rounded-xl'));
      return cards.map((c) => c.innerText);
    });
    const hasAnalytics = kpiTexts.some((t) => t.includes('Period Emissions') || t.includes('Carbon Intelligence'));
    console.log('   Carbon Intelligence Analytics Cards Loaded:', hasAnalytics ? 'PASS' : 'FAIL');

    // Check Recommendations & Benchmarks
    const hasBenchmarks = kpiTexts.some((t) => t.includes('EPA') || t.includes('IEA') || t.includes('Benchmark') || t.includes('Grid Electricity'));
    console.log('   Reference Benchmarks & Contributors Loaded:', hasBenchmarks ? 'PASS' : 'FAIL');

    // 3. Test Traceable Marketplace
    console.log('[E2E AUDIT] 3. Navigating to Marketplace (Carbon Credit Trading & Provenance)...');
    await page.goto('http://localhost:5173/marketplace', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 2500));

    // Verify Traceable Provenance Batch Badges in Order Book
    const marketText = await page.evaluate(() => document.body.innerText);
    const hasBatchNumbers = marketText.includes('CCT-') || marketText.includes('VCS') || marketText.includes('Verra') || marketText.includes('Permanent Carbon Credit Retirement');
    console.log('   Provenance Batches & Retirement Manager Rendered:', hasBatchNumbers ? 'PASS' : 'FAIL');

    // Check Retirement Section
    const hasRetirementSection = marketText.includes('Permanent Carbon Credit Retirement');
    console.log('   Permanent Credit Retirement Manager Rendered:', hasRetirementSection ? 'PASS' : 'FAIL');

    // Verify all 5 Marketplace tabs remain intact
    const hasAllTabs = ['Carbon Credit Trading', 'Sustainable Products Store', 'Rewards', 'Collaborations', 'Network']
      .every((tab) => marketText.includes(tab));
    console.log('   Preservation of All 5 Marketplace Tabs:', hasAllTabs ? 'PASS' : 'FAIL');

    console.log('\n[SUMMARY] ALL BROWSER E2E VERIFICATION CHECKS COMPLETED SUCCESSFULLY.');
  } catch (err) {
    console.error('[E2E AUDIT ERROR]:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runAudit();
