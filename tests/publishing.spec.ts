import { test,expect } from '@playwright/test';
import { newExperience } from '../lib/experience';
test.skip(!process.env.TEST_PUBLISHING,'Requires the isolated Supabase HTTP test double.');
test('server ownership, secret hashing, guarded content, update and deletion',async({playwright,page,baseURL})=>{
 const origin=baseURL!;const creator=await playwright.request.newContext({baseURL:origin,extraHTTPHeaders:{Origin:origin}});
 const stranger=await playwright.request.newContext({baseURL:origin,extraHTTPHeaders:{Origin:origin}});
 const config=newExperience();config.recipientName='Sky';config.senderName='River';config.secretEnabled=true;
 const created=await creator.post('/api/tests',{data:{config,secret:'our-moon'}});expect(created.status()).toBe(201);const {id}=await created.json();
 const locked=await stranger.get(`/api/love/${id}`);expect(await locked.json()).toEqual({locked:true});
 expect((await stranger.get(`/api/tests/${id}`)).status()).toBe(401);
 expect((await stranger.put(`/api/tests/${id}`,{data:{config}})).status()).toBe(401);
 expect((await stranger.delete(`/api/tests/${id}`)).status()).toBe(401);
 expect((await stranger.post(`/api/love/${id}`,{data:{secret:'wrong'}})).status()).toBe(403);
 const unlocked=await stranger.post(`/api/love/${id}`,{data:{secret:'our-moon'}});expect(unlocked.status()).toBe(200);expect((await unlocked.json()).config.recipientName).toBe('Sky');
 const state=await (await creator.get('http://localhost:5055/__state')).json();const row=state.love_tests.find((test:{id:string})=>test.id===id);expect(row.secret_hash).not.toContain('our-moon');expect(row.secret_hash).toMatch(/^[a-f0-9]{32}:[a-f0-9]{128}$/);
 config.finalMessage='A universe of us';expect((await creator.put(`/api/tests/${id}`,{data:{config,secret:'new-moon'}})).status()).toBe(200);
 expect(await (await stranger.get(`/api/love/${id}`)).json()).toEqual({locked:true});
 expect((await creator.post('/api/tests',{headers:{Origin:'https://other.example'},data:{config,secret:'test'}})).status()).toBe(403);
 await page.goto(`/love/${id}`);await expect(page.getByRole('heading',{name:"What's our secret word? 💕"})).toBeVisible();await page.getByLabel('Our secret word',{exact:true}).fill('new-moon');await page.getByRole('button',{name:'Open my surprise ♡'}).click();await expect(page.getByRole('button',{name:/Start the Love Test/})).toBeVisible();await expect(page.getByText('My love tests')).toHaveCount(0);
 expect((await creator.delete(`/api/tests/${id}`)).status()).toBe(200);expect((await stranger.get(`/api/love/${id}`)).status()).toBe(404);
 await creator.dispose();await stranger.dispose();
});

test('creator publishes uploaded photo, shares QR, edits and deletes through dashboard',async({page,baseURL})=>{
 await page.goto('/create?new=1');await page.getByLabel("Recipient's name").fill('Moon');await page.getByLabel('Your name',{exact:true}).fill('Sun');
 await page.locator('summary').filter({hasText:'Add Your Memories 📸'}).click();await page.getByLabel('Upload photo').setInputFiles({name:'memory.png',mimeType:'image/png',buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aF9kAAAAASUVORK5CYII=','base64')});await page.getByLabel('Caption for photo 1').fill('Our favorite day');
 await page.getByRole('button',{name:'Create My Love Test 💗',exact:true}).click();await expect(page.getByRole('heading',{name:'Your Love Test is Ready! 💕'})).toBeVisible();
 const url=await page.getByLabel('Your link',{exact:true}).inputValue();expect(url).toMatch(/\/love\/[a-f0-9-]{36}$/);await expect(page.getByRole('link',{name:'Download QR Code'})).toHaveAttribute('href',/^data:image\/png/);
 await page.goto('/dashboard');await expect(page.getByText('for Moon',{exact:true})).toBeVisible();await page.getByRole('link',{name:'Edit',exact:true}).click();await expect(page.getByLabel("Recipient's name")).toHaveValue('Moon');
 await page.getByLabel("Recipient's name").fill('Moonbeam');await page.getByRole('button',{name:'Update My Love Test 💗'}).click();await expect(page.getByRole('heading',{name:'Your Love Test is Ready! 💕'})).toBeVisible();
 const recipient=await page.request.get(url.replace(baseURL!,'/').replace('//love','/love').replace('/love/','/api/love/'));expect(recipient.status()).toBe(200);const data=await recipient.json();expect(data.config.photos[0].url).toContain('/object/sign/');expect(data.config.recipientName).toBe('Moonbeam');
 await page.goto('/dashboard');await page.getByRole('button',{name:'Delete',exact:true}).click();await page.getByRole('button',{name:'Delete permanently'}).click();await expect(page.getByText('for Moonbeam',{exact:true})).toHaveCount(0);
});
