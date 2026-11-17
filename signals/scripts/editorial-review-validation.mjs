import fs from 'node:fs';
import crypto from 'node:crypto';
export const editorialFingerprint = record => {
  const {editorialReview, ...historical} = record;
  return crypto.createHash('sha256').update(JSON.stringify(historical)).digest('hex');
};
export function validateEditorialReviews(records, readEvidence = path => JSON.parse(fs.readFileSync(new URL('../../'+path, import.meta.url)))) {
  const errors=[];
  for(const record of records) {
    const review=record.editorialReview;
    if(review===undefined) continue;
    const fail=message=>errors.push(`${record.id}: editorial review ${message}`);
    if(!review || typeof review!=='object' || Array.isArray(review)) {fail('must be an object');continue;}
    if(Object.keys(review).sort().join(',')!=='evidencePath,reviewedOn,scope') fail('has unexpected or missing fields');
    const date=review.reviewedOn;
    if(typeof date!=='string' || !/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date)) || new Date(date).toISOString().slice(0,10)!==date || date<record.verifiedOn || date>new Date().toISOString().slice(0,10)) fail('has invalid date');
    if(typeof review.scope!=='string' || !review.scope.trim() || review.scope.length>400) fail('needs concise scope');
    if(typeof review.evidencePath!=='string' || !/^docs\/signals-reviews\/[a-z0-9-]+\.json$/.test(review.evidencePath)) {fail('has invalid evidence path');continue;}
    try {
      const evidence=readEvidence(review.evidencePath);
      if(evidence.schemaVersion!==1 || evidence.recordId!==record.id || evidence.reviewedOn!==date || evidence.scope!==review.scope || evidence.evidencePath!==review.evidencePath) fail('evidence identity/date/scope mismatch');
      if(evidence.recordSha256!==editorialFingerprint(record)) fail('fingerprint mismatch');
      if(!Array.isArray(evidence.evidenceUrls) || !evidence.evidenceUrls.length || evidence.evidenceUrls.some(url=>typeof url!=='string'||!url.startsWith('https://'))) fail('needs official evidence URLs');
      if(!Array.isArray(evidence.findings)||!evidence.findings.length) fail('needs findings');
    } catch {fail('evidence missing or unreadable');}
  }
  return errors;
}
