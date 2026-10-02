import { test, expect } from '@playwright/test';
import { defaultLoveMeter, activeSegments, messageIndex } from '../lib/love-meter';

test('meter boundaries, needle geometry, milestones and input controls', async ({ page }, info) => {
  await page.goto('/demo');
  await page.getByRole('button',{name:/Start the Love Test/}).click();
  const slider=page.getByRole('slider');
  await expect(slider).toHaveAttribute('step','1');
  for(const value of [0,10,11,20,21,25,30,31,40,41,50,51,60,61,70,71,75,80,81,90,91,99,100]) {
    await slider.fill(String(value));
    if ([25,50,75,100].includes(value)) await expect(page.getByTestId(`milestone-${value}`)).toHaveCount(1);
    await expect(page.locator('.gauge-number')).toHaveText(`${value}%`);
    await expect(page.getByRole('status')).toHaveText(defaultLoveMeter.messages[messageIndex(value)]);
    await expect(page.locator('[data-testid="gauge-segment"][data-active="true"]')).toHaveCount(activeSegments(value));
  }
  await expect(page.getByRole('button',{name:'Continue →'})).toBeVisible();
  await expect(page.locator('.meter-correct')).toHaveText(defaultLoveMeter.completionMessage);
  await expect(page.getByTestId('milestone-100')).toHaveCount(0);
  await slider.fill('99');await slider.fill('100');
  await expect(page.getByTestId('milestone-100')).toHaveCount(0);
  // Test rendered SVG geometry, not only the requested rotation property.
  for(const [value,x,y] of [[0,-108,0],[50,0,-108],[100,108,0]]) {
    await slider.fill(String(value));
    await expect.poll(async()=>page.getByTestId('meter-needle').evaluate(element=>{
      const line=element as SVGLineElement;
      const matrix=line.getCTM()!;
      const start=new DOMPoint(0,0).matrixTransform(matrix);
      const end=new DOMPoint(0,-108).matrixTransform(matrix);
      const scale=Math.hypot(matrix.a,matrix.b);
      return [Math.round((end.x-start.x)/scale),Math.round((end.y-start.y)/scale)];
    })).toEqual([x,y]);
  }
  await slider.fill('0');await slider.focus();await page.keyboard.press('ArrowRight');await expect(slider).toHaveValue('1');
  await page.keyboard.press('End');await expect(slider).toHaveValue('100');
  const box=(await slider.boundingBox())!;
  if(info.project.name==='desktop'){
    await page.mouse.move(box.x+box.width-4,box.y+box.height/2);await page.mouse.down();
    await page.mouse.move(box.x+box.width*.5,box.y+box.height/2,{steps:10});await page.mouse.up();
  }else{
    const session=await page.context().newCDPSession(page);
    await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:box.x+box.width-4,y:box.y+box.height/2}]});
    await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:box.x+box.width*.5,y:box.y+box.height/2}]});
    await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  }
  expect(Number(await slider.inputValue())).toBeGreaterThanOrEqual(45);
  expect(Number(await slider.inputValue())).toBeLessThanOrEqual(55);
  await expect(page.getByRole('button',{name:'Continue →'})).toHaveCount(0);
  await expect(page.locator('body')).toHaveJSProperty('scrollWidth',await page.evaluate(()=>innerWidth));
  await page.screenshot({path:`test-results/${info.project.name}-meter-updated.png`,fullPage:true});
});

