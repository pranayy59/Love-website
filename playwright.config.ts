import { defineConfig, devices } from '@playwright/test';
export default defineConfig({testDir:'./tests',timeout:120000,workers:1,use:{baseURL:process.env.TEST_BASE_URL || 'http://localhost:3000',trace:'retain-on-failure'},projects:[{name:'desktop',use:{...devices['Desktop Chrome']}},{name:'mobile',use:{...devices['iPhone 13'],defaultBrowserType:'chromium'}}]});
