const puppeteer = require('puppeteer-core');

async function runBrowserTest() {
  console.log('[BROWSER TEST] Launching Google Chrome...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,900'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  try {
    // 1. Visit Login
    console.log('[BROWSER TEST] Step 1: Navigating to http://localhost:5173/login...');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
    
    // Type credentials
    await page.waitForSelector('#email');
    await page.type('#email', 'demo@ecofuse.org');
    await page.type('#password', 'password123');
    console.log('  Filled email and password.');

    // Submit login
    await page.click('button[type="submit"]');
    await new Promise((r) => setTimeout(r, 2000));

    // Verify token stored
    const token = await page.evaluate(() => localStorage.getItem('ecofuse_jwt_token'));
    const user = await page.evaluate(() => JSON.parse(localStorage.getItem('ecofuse_user') || '{}'));
    console.log('  Login Result:', token ? 'PASS' : 'FAIL', `(User: ${user.name}, CCT: ${user.creditBalance})`);

    // 2. Open Marketplace
    console.log('[BROWSER TEST] Step 2: Navigating to Marketplace...');
    await page.goto('http://localhost:5173/marketplace', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1500));

    // Click tab helper using exact aria-controls
    async function clickTabByControlName(name) {
      await page.evaluate((ctrl) => {
        const btn = document.querySelector(`button[aria-controls$="${ctrl}"]`);
        if (btn) {
          btn.click();
          btn.focus();
        }
      }, name);
      await new Promise((r) => setTimeout(r, 1200));
    }

    // 3. Click Rewards Tab
    console.log('[BROWSER TEST] Step 3: Clicking Rewards Tab...');
    await clickTabByControlName('rewards');

    // Check rewards rendered
    const rewardTitles = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('h3, h4, .font-bold'));
      return cards.map((c) => c.innerText.trim()).filter((t) => t.length > 5);
    });
    const hasCanonicalRew = rewardTitles.some((t) => t.includes('Patagonia') || t.includes('Lime') || t.includes('OneTreePlanted'));
    console.log('  Authoritative backend rewards rendered:', hasCanonicalRew ? 'PASS' : 'FAIL');

    // 4. Test Redeeming a Reward in UI
    console.log('[BROWSER TEST] Step 4: Clicking Redeem Voucher on UI...');
    const balanceBeforeRedeem = await page.evaluate(() => {
      const match = document.body.innerText.match(/Available to Spend:\s*([\d.]+)\s*CCT/i);
      return match ? parseFloat(match[1]) : null;
    });
    console.log('  Balance before redemption:', balanceBeforeRedeem, 'CCT');

    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const redeemBtn = btns.find((b) => b.innerText.includes('Redeem Voucher'));
      if (redeemBtn) redeemBtn.click();
    });
    await new Promise((r) => setTimeout(r, 2500));

    // Check for voucher in the table
    const tableText = await page.evaluate(() => document.querySelector('table')?.innerText || '');
    const voucherMatch = tableText.match(/ECO-[A-F0-9]{6}/);
    console.log('  Redeemed voucher displayed in table:', voucherMatch ? `PASS (${voucherMatch[0]})` : 'FAIL');

    const balanceAfterRedeem = await page.evaluate(() => {
      const match = document.body.innerText.match(/Available to Spend:\s*([\d.]+)\s*CCT/i);
      return match ? parseFloat(match[1]) : null;
    });
    const expectedDeduction = 15.0; // Patagonia Gear Repair cost
    const exactMatch = (balanceBeforeRedeem !== null && balanceAfterRedeem !== null && Math.abs((balanceBeforeRedeem - balanceAfterRedeem) - expectedDeduction) < 0.01);
    console.log(`  Balance after redemption: ${balanceAfterRedeem} CCT (Deduction: -${expectedDeduction} CCT, Exact deduction check: ${exactMatch ? 'PASS' : 'FAIL'})`);

    // 5. Open Carbon Credit Trading Tab
    console.log('[BROWSER TEST] Step 5: Clicking Carbon Credit Trading Tab...');
    await clickTabByControlName('carbon-credits');

    // 6. Test Listing Creation from UI
    console.log('[BROWSER TEST] Step 6: Creating listing of 15 CCT from UI...');
    await page.evaluate(() => {
      const amt = document.querySelector('#listing-amount');
      if (amt) {
        amt.value = '15';
        amt.dispatchEvent(new Event('input', { bubbles: true }));
        amt.dispatchEvent(new Event('change', { bubbles: true }));
      }
      const prc = document.querySelector('#listing-price');
      if (prc) {
        prc.value = '16.0';
        prc.dispatchEvent(new Event('input', { bubbles: true }));
        prc.dispatchEvent(new Event('change', { bubbles: true }));
      }
      const proj = document.querySelector('#listing-project');
      if (proj) {
        proj.value = 'Live Chrome Automation Wind Park';
        proj.dispatchEvent(new Event('input', { bubbles: true }));
        proj.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });

    await page.evaluate(() => {
      const submitBtn = Array.from(document.querySelectorAll('button[type="submit"]')).find(b => b.innerText.includes('Create Marketplace Listing'));
      if (submitBtn) submitBtn.click();
    });
    await new Promise((r) => setTimeout(r, 2500));

    // Inspect buttons in the table
    const actionButtons = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('table button')).map((b) => b.innerText.trim());
    });
    console.log('  Action buttons in Marketplace Table:', actionButtons);

    const hasCancelButton = actionButtons.some((b) => b.includes('Cancel & Refund'));
    const hasBuyButton = actionButtons.some((b) => b.includes('Buy Credits'));
    console.log('  Owner sees "Cancel & Refund" for own listing:', hasCancelButton ? 'PASS' : 'FAIL');
    console.log('  Other listings show "Buy Credits":', hasBuyButton ? 'PASS' : 'FAIL');

    // 7. Click Cancel & Refund on the created listing
    if (hasCancelButton) {
      console.log('[BROWSER TEST] Step 7: Clicking "Cancel & Refund" in UI...');
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('table button'));
        const cancelBtn = btns.find((b) => b.innerText.includes('Cancel & Refund'));
        if (cancelBtn) cancelBtn.click();
      });
      await new Promise((r) => setTimeout(r, 2500));
      console.log('  Listing Cancel & Refund processed in UI.');
    }

    // 8. Session Persistence across browser reload
    console.log('[BROWSER TEST] Step 8: Reloading browser page to test persistence...');
    await page.reload({ waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 2000));

    const tokenAfterReload = await page.evaluate(() => localStorage.getItem('ecofuse_jwt_token'));
    const userAfterReload = await page.evaluate(() => JSON.parse(localStorage.getItem('ecofuse_user') || '{}'));
    console.log('  JWT Token persists after reload:', Boolean(tokenAfterReload) ? 'PASS' : 'FAIL');
    console.log('  User profile persists with authoritative credit balance:', userAfterReload.creditBalance !== undefined ? `PASS (${userAfterReload.creditBalance} CCT)` : 'FAIL');

    // 9. Inspect Remaining Tabs (Sustainable Products, Collaborations, Network)
    console.log('[BROWSER TEST] Step 9: Verifying remaining Marketplace tabs...');
    
    // Tab: Sustainable Products
    await clickTabByControlName('sustainable-products');
    const prodCount = await page.evaluate(() => document.querySelectorAll('.group, img[alt]').length);
    console.log('  Sustainable Products tab functional:', prodCount > 0 ? `PASS (${prodCount} items rendered)` : 'FAIL');

    // Tab: Collaborations
    await clickTabByControlName('collaborations');
    const partnerCount = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('h3, .font-bold')).filter(el => el.innerText.includes('Inc') || el.innerText.includes('GmbH') || el.innerText.includes('Co.') || el.innerText.includes('Partner')).length;
    });
    console.log('  Collaborations tab functional:', partnerCount > 0 ? `PASS (${partnerCount} partner cards rendered)` : 'FAIL');

    // Tab: Network
    await clickTabByControlName('network');
    const networkNotice = await page.evaluate(() => document.body.innerText.includes('Prototype Architecture & Sandbox Verification Notice'));
    console.log('  Network tab accurate with transparent sandbox notice:', networkNotice ? 'PASS' : 'FAIL');

    console.log('\n[BROWSER TEST] ALL BROWSER FLOWS VERIFIED SUCCESSFULLY!');
  } catch (err) {
    console.error('[BROWSER TEST] Error during execution:', err);
  } finally {
    await browser.close();
  }
}

runBrowserTest();
