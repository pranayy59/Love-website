import { test,expect } from '@playwright/test';
const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aF9kAAAAASUVORK5CYII=','base64');
test('complete creator draft, media persistence, preview and themes',async({page},info)=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/create?new=1');
 await page.getByLabel("Recipient's name").fill('Avery');await page.getByLabel('Your name',{exact:true}).fill('Jamie');
 await page.getByLabel('Nickname / pet name').fill('Starlight');
 await page.getByLabel('Intro message',{exact:true}).fill('This is our own little universe.');
 await page.locator('summary').filter({hasText:'Write Your Love Letter 💌'}).click();
 await page.getByLabel('Your love letter').fill('My favorite person,\n\nEvery day with you is a little brighter.');
 await page.getByLabel('Letter heading').fill('From our little universe');
 await page.getByRole('button',{name:'Preview Letter'}).click();
 if(info.project.name==='mobile'){
   await expect(page.locator('dialog[open]')).toBeVisible();
   await expect(page.locator('dialog').getByRole('heading',{name:'From our little universe'})).toBeVisible();
   await page.getByRole('button',{name:'Close preview'}).click();
 }else await expect(page.locator('.phone-preview').getByRole('heading',{name:'From our little universe'})).toBeVisible();
 await page.locator('summary').filter({hasText:'Add Your Memories 📸'}).click();
 await page.getByLabel('Upload photo',{exact:true}).setInputFiles([{name:'first.png',mimeType:'image/png',buffer:png},{name:'second.png',mimeType:'image/png',buffer:png}]);
 await page.getByLabel('Caption for photo 1').fill('Our favorite day');await page.getByLabel('Caption for photo 2').fill('Us being us');
 await page.getByRole('button',{name:'Move photo 2 up',exact:true}).click();await expect(page.getByLabel('Caption for photo 1')).toHaveValue('Us being us');
 await page.locator('summary').filter({hasText:'Create Your Questions 💕'}).click();
 for(let i=0;i<6;i++)await page.getByRole('button',{name:'+ Add Question',exact:true}).click();
 await expect(page.getByLabel('Question 10',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Move question 10 up',exact:true}).click();
 await page.getByRole('button',{name:'Remove question 10',exact:true}).click();
 await page.locator('summary').filter({hasText:'Choose Your Style 🎨'}).click();await page.getByRole('button',{name:'Lavender Love',exact:true}).click();
 await page.getByRole('button',{name:'Save Draft',exact:true}).click();await expect(page.locator('.setup-meta')).toContainText('Saved ✓');
 await page.goto('/create');await expect(page.getByLabel("Recipient's name")).toHaveValue('Avery');
 await page.locator('summary').filter({hasText:'Add Your Memories 📸'}).click();await expect(page.getByLabel('Caption for photo 1')).toHaveValue('Us being us');
 await expect(page.locator('.media-row img').first()).toHaveJSProperty('naturalWidth',1);
 await page.getByRole('button',{name:'Remove photo 2',exact:true}).click();await expect(page.locator('.media-row img')).toHaveCount(1);
 await page.screenshot({path:`test-results/${info.project.name}-creator.png`,fullPage:true});
 await expect(page.locator('body')).toHaveJSProperty('scrollWidth',await page.evaluate(()=>innerWidth));
 expect(errors).toEqual([]);
});

test('uploads reject unsupported formats and optional sections are skipped',async({page})=>{
 await page.goto('/create?new=1');await page.locator('summary').filter({hasText:'Add Your Memories 📸'}).click();
 await page.getByLabel('Upload photo').setInputFiles({name:'unsafe.svg',mimeType:'image/svg+xml',buffer:Buffer.from('<svg/>')});
 await expect(page.locator('.media-editor [role=alert]').first()).toContainText('supported file type');
 await page.goto('/demo');await expect(page.getByRole('navigation',{name:'Your love story progress'})).not.toContainText('Memories');
 await expect(page.getByRole('navigation',{name:'Your love story progress'}).locator('[aria-label*="Video"]')).toHaveCount(0);
});
