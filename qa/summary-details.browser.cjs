const assert = require('node:assert/strict');
const fs = require('node:fs');
const {chromium} = require(process.argv[2] || 'playwright');
const url = process.env.PROTOTYPE_URL || 'http://127.0.0.1:4187';
const out = process.env.QA_OUTPUT || '/tmp/ofx-summary-details';
fs.mkdirSync(out,{recursive:true});
(async()=>{
  const browser=await chromium.launch({headless:true,channel:'chrome'});
  try {
    const context=await browser.newContext({deviceScaleFactor:1});
    for(const viewport of [{width:375,height:667},{width:390,height:844},{width:1280,height:900}]) {
      const page=await context.newPage(); await page.setViewportSize(viewport);
      const errors=[];page.on('pageerror',e=>errors.push(e.message));
      await page.goto(url);await page.locator('#loader').waitFor({state:'hidden',timeout:120000});
      await page.getByRole('button',{name:'Купить',exact:true}).click();
      const total=()=>page.locator('[data-total]').getAttribute('data-total');
      const shot=async name=>{
        await page.locator('.checkout-scroll').evaluate(el=>{el.scrollTop=el.querySelector('.totals').offsetTop-16;});
        await page.locator('.totals').screenshot({path:`${out}/${viewport.width}-${name}.png`});
      };
      assert.equal(await page.locator('[data-summary-products] .summary-arrow').count(),0,'Single item has no disclosure chevron');
      assert.equal(await page.locator('button[data-action=summary-products]').count(),0,'Single item is static');
      const original=await total();
      await page.locator('[data-action=toggle-discounts]').click();
      assert.equal(await page.locator('#discount-details > .total-row').first().evaluate(el=>getComputedStyle(el).marginTop),'0px','Discount details keep the same spacing');
      await page.locator('[data-action=toggle-discounts]').click();
      await page.locator('[data-action=summary-delivery]').click();
      assert(await page.locator('#delivery-details').isVisible());
      assert.deepEqual(await page.locator('#delivery-details [data-detail-amount]').evaluateAll(els=>els.map(el=>Number(el.dataset.detailAmount))),[169,300,-294]);
      assert.equal(await total(),original,'Disclosure does not change the price');
      await shot('delivery');
      await page.locator('[data-action=summary-delivery]').click();
      await page.locator('.seller-groups [data-action=increase][data-id=sneakers]').click();
      await page.locator('[data-action=summary-products]').click();
      assert.match(await page.locator('#product-details').innerText(),/× 2/);
      assert.deepEqual(await page.locator('#product-details [data-detail-amount]').evaluateAll(els=>els.map(el=>Number(el.dataset.detailAmount))),[7180]);
      await page.locator('[data-action=bundle]').click();
      await page.locator('[data-action=bundle-add][data-id=premiataLaces]').click();
      await page.locator('.bundle-close').click();
      assert(await page.locator('#product-details').isVisible());
      const amounts=await page.locator('#product-details [data-detail-amount]').evaluateAll(els=>els.map(el=>Number(el.dataset.detailAmount)));
      assert.deepEqual(amounts,[7180,396]);
      assert.equal(amounts.reduce((a,b)=>a+b,0),7576);
      await page.locator('[data-action=toggle-discounts]').click();
      await shot('products');
      await page.locator('[data-action=summary-delivery]').click();
      assert(await page.locator('#product-details').isVisible(),'Disclosures are independent');
      await page.locator('[data-action=summary-products]').click();
      assert(await page.locator('#delivery-details').isVisible());
      await page.locator('[data-action=promo-edit]').click();await page.locator('#promo-code').fill('DETAILS');await page.locator('#promo-code').press('Enter');
      assert(await page.locator('#delivery-details').isVisible(),'Promo preserves disclosure state');
      await page.locator('[data-action=delivery-mode][data-method=courier]').click();
      assert.match(await page.locator('#delivery-details').innerText(),/Доставка курьером/);
      assert.deepEqual(await page.locator('#delivery-details [data-detail-amount]').evaluateAll(els=>els.map(el=>Number(el.dataset.detailAmount))),[169,300,-115]);
      await page.locator('[data-action=delivery-mode][data-method=self]').click();
      assert.deepEqual(await page.locator('#delivery-details [data-detail-amount]').evaluateAll(els=>els.map(el=>Number(el.dataset.detailAmount))),[169,0,-168]);
      await page.locator('[data-action=toggle-checkout-item][data-id=premiataLaces]').click();
      await page.locator('.seller-groups [data-action=decrease][data-id=sneakers]').click();
      assert.equal(await page.locator('button[data-action=summary-products]').count(),0);
      assert.equal(await page.locator('#product-details').count(),0);
      await page.locator('[data-action=toggle-checkout-item][data-id=sneakers]').click();
      assert.equal(await total(),'0');
      assert.deepEqual(await page.locator('#delivery-details [data-detail-amount]').evaluateAll(els=>els.map(el=>Number(el.dataset.detailAmount))),[0,0,0]);
      assert.equal(await page.locator('.totals').evaluate(el=>el.scrollWidth>el.clientWidth),false);
      assert.deepEqual(errors,[]);await page.close();
    }
    console.log('PASS: product/delivery disclosures at 3 viewports, quantities, selected items, independent state, promo, delivery modes and unchanged totals');
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
