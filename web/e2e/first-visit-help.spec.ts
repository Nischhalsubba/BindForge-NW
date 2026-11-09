import {expect,test} from '@playwright/test';
test('first visit offers a nonblocking guide, remembers completion and allows replay',async({page})=>{
 await page.goto('/');
 await expect(page.locator('#welcomeGuide')).toBeVisible();
 await expect(page.getByLabel('Search keybind library')).toBeEditable();
 await page.locator('#startGuide').click();
 for(let n=1;n<=4;n++){
  await expect(page.locator('#guideProgress')).toHaveText(`Step ${n} of 4`);
  await page.locator('#guideNext').click();
 }
 await expect(page.locator('#guidePanel')).toBeHidden();
 await page.reload();await expect(page.locator('#welcomeGuide')).toBeHidden();
 await page.locator('#openGuide').click();await expect(page.locator('#guideTitle')).toBeFocused();
 await page.locator('#guideNext').click();await page.locator('#guideBack').click();
 await expect(page.locator('#guideProgress')).toHaveText('Step 1 of 4');
 await page.locator('#guideClose').click();await expect(page.locator('#openGuide')).toBeFocused();
});
test('first visit can be skipped without blocking copying',async({page})=>{
 await page.goto('/');await page.locator('#skipGuide').click();await expect(page.locator('#welcomeGuide')).toBeHidden();
 await expect(page.getByRole('button',{name:'Copy bind for Summon VIP Bank Portal',exact:true})).toBeEnabled();
 await page.reload();await expect(page.locator('#welcomeGuide')).toBeHidden();
});
