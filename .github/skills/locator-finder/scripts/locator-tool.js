#!/usr/bin/env node
// Usage:
//   node locator-tool.js snapshot <url> [--wait <ms>] [--timeout <ms>]
//   node locator-tool.js check <url> "<locator expression using page>" [--wait <ms>] [--timeout <ms>]
const { chromium } = require('@playwright/test');

function parseArgs(argv) {
  const args = [];
  let wait = 0;
  let timeout = 60000;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--wait') {
      wait = Number(argv[++i]) || 0;
    } else if (argv[i] === '--timeout') {
      timeout = Number(argv[++i]) || timeout;
    } else {
      args.push(argv[i]);
    }
  }
  return { args, wait, timeout };
}

async function main() {
  const { args, wait, timeout } = parseArgs(process.argv.slice(2));
  const [mode, url, expression] = args;

  if (!['snapshot', 'check'].includes(mode) || !url || (mode === 'check' && !expression)) {
    console.error('Usage: locator-tool.js snapshot <url> | check <url> "<locator expression>" [--wait <ms>] [--timeout <ms>]');
    process.exit(2);
  }

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout });
    await page.waitForLoadState('networkidle').catch(() => {});
    if (wait) await page.waitForTimeout(wait);

    if (mode === 'snapshot') {
      console.log(await page.locator('body').ariaSnapshot());
      return;
    }

    // The expression runs locally on the developer's machine against their own page.
    const locator = new Function('page', `return (${expression});`)(page);
    const count = await locator.count();
    console.log(`count: ${count}`);
    if (count > 0) {
      const shown = Math.min(count, 5);
      for (let i = 0; i < shown; i++) {
        const html = await locator.nth(i).evaluate((el) => el.outerHTML.slice(0, 200));
        console.log(`  [${i}] ${html}`);
      }
    }
    process.exitCode = count === 1 ? 0 : 1;
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(2);
});
