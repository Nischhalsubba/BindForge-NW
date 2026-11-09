import {expect,test} from '@playwright/test';
test('guide actions focus the real controls and remain in the responsive page',async({page})=>{
 await page.goto('/#help');await expect(page.locator('#guidePanel')).toBeVisible();
 await page.locator('#guideTry').click();await expect(page.locator('#search')).toBeFocused();
 await page.locator('#guideNext').click();await page.locator('#guideNext').click();
 await expect(page.locator('#guideText')).toContainText('does not restore an older command');
 await page.locator('#guideNext').click();await page.locator('#guideTry').click();
 await expect(page.locator('#setupView')).toBeVisible();
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
 expect(overflow).toBeLessThanOrEqual(1);
});
test('advanced glossary links back to the shared guide',async({page})=>{
 await page.goto('/advanced');await page.locator('#bindforge-help summary').click();
 await page.getByRole('link',{name:'Open the workbench guide'}).click();
 await expect(page.locator('#guidePanel')).toBeVisible();
});
