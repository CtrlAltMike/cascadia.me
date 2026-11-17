import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import {loadSignalsRegistry} from '../signals/scripts/registry-loader.mjs';
import {validateEditorialReviews,editorialFingerprint} from '../signals/scripts/editorial-review-validation.mjs';
const root=new URL('../',import.meta.url);
const ledger=JSON.parse(fs.readFileSync(new URL('docs/signals-reviews/2026-11-17-oregon-oem-editorial.json',root)));
const clone=x=>JSON.parse(JSON.stringify(x));
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
test('scoped metadata preserves historical records and audits and matches browser assembly',()=>{
 const {records}=loadSignalsRegistry();
 expect(validateEditorialReviews(records)).toEqual([]);
 expect(records.filter(r=>r.editorialReview).map(r=>r.id)).toEqual(['oregon-oem']);
 const oem=records.find(r=>r.id==='oregon-oem');
 expect(editorialFingerprint(oem)).toBe(ledger.recordSha256);
 expect(oem.verifiedOn).toBe('2026-07-15');
 for(const item of ledger.untouchedRecords) expect(hash(JSON.stringify(records.find(r=>r.id===item.id)))).toBe(item.sha256);
 for(const item of ledger.preservedFiles) expect(hash(fs.readFileSync(new URL(item.path,root)))).toBe(item.sha256);
 const source=fs.readFileSync(new URL('signals/app.js',root),'utf8');
 const context={window:{SIGNALS_AUTHORITY_RECORDS:[]}};
 vm.createContext(context);vm.runInContext(source.slice(0,source.indexOf('const DIRECTORY_UPDATED_ON'))+'\nresult=resources;',context);
 expect(clone(context.result.find(r=>r.id==='oregon-oem'))).toEqual(clone(oem));
 expect(source).toContain('const DIRECTORY_UPDATED_ON = "2026-07-15"');
});
test('invalid review evidence cannot silently certify edited or unknown records',()=>{
 const original=clone(loadSignalsRegistry().records.find(r=>r.id==='oregon-oem'));
 const verify=r=>validateEditorialReviews([r],()=>ledger);
 for(const date of ['2026-02-30','invalid','2999-01-01','2020-01-01']) {const r=clone(original);r.editorialReview.reviewedOn=date;expect(verify(r).length).toBeGreaterThan(0);}
 for(const field of ['summary','coverageNote','verifiedOn','id']) {const r=clone(original);r[field]='changed';expect(verify(r).length).toBeGreaterThan(0);}
 const r=clone(original);r.editorialReview.evidencePath='../bad.json';expect(verify(r).length).toBeGreaterThan(0);
 expect(validateEditorialReviews([original],()=>{throw Error('missing');}).length).toBeGreaterThan(0);
 const wrong={...ledger,scope:'changed'};expect(validateEditorialReviews([original],()=>wrong).length).toBeGreaterThan(0);
});
test('editorial review displays scope without clearing directory overdue status',async({page})=>{
 await page.route(/^https?:\/\/(?!127\.0\.0\.1:4173)/,r=>r.abort());
 await page.goto('/signals/?q=Oregon%20Department%20of%20Emergency%20Management');
 await expect(page.locator('.directory-freshness')).toContainText('review overdue');
 await expect(page.locator('#directory-last-updated')).toHaveAttribute('datetime','2026-07-15');
 await page.getByRole('button',{name:'Show details for Oregon Department of Emergency Management',exact:true}).click();
 await expect(page.locator('#card-meta')).toContainText('July 15, 2026');
 await expect(page.locator('#card-meta')).toContainText('Editorial review: November 17, 2026');
 await expect(page.locator('#card-meta')).toContainText(ledger.scope);
 // Exercise the actual text/HTML sharing and print formatters without publishing.
 const outputs=await page.evaluate(()=>{ window.print=()=>{}; preparePrint(); renderViewDialog(); return {share:buildLinkedList(), print:document.querySelector('#print-records').textContent, view:Array.from(document.querySelectorAll('.view-record')).find(article => article.querySelector('.view-record-heading strong')?.textContent === 'Oregon Department of Emergency Management')?.querySelector('.view-record-review').textContent}; });
 expect(JSON.stringify(outputs.share)).toContain(ledger.scope);
 expect(JSON.stringify(outputs.share)).toContain('July 15, 2026');
 expect(outputs.print).toContain(ledger.scope);
 expect(outputs.view).toContain(ledger.scope);
});
