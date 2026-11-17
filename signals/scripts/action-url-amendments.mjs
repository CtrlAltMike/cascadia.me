// Validate narrow URL corrections while checking all other action fields against
// the unchanged historical batch snapshot. Never reseal a whole batch for a URL fix.
export function applyActionUrlAmendments(records, ledger) {
  const errors = [];
  const byId = new Map();
  const https = /^https:\/\//;
  const date = /^\d{4}-\d{2}-\d{2}$/;
  if (ledger?.schemaVersion !== 1 || !Array.isArray(ledger?.amendments)) {
    return { records, errors: ['Invalid action URL amendment ledger'] };
  }
  for (const item of ledger.amendments) {
    const record = records.find(record => record.id === item.recordId);
    if (!record || byId.has(item.recordId) ||
        !date.test(item.checkedOn || '') || !date.test(item.priorVerifiedOn || '') ||
        !https.test(item.previousActionUrl || '') || !https.test(item.actionUrl || '') ||
        !https.test(item.informationUrl || '') || item.previousActionUrl === item.actionUrl ||
        !Array.isArray(item.evidenceUrls) || !item.evidenceUrls.length ||
        item.evidenceUrls.some(url => !https.test(url)) || !item.evidence ||
        item.recordReviewStatus !== 'partial-source-review' ||
        record?.verifiedOn !== item.priorVerifiedOn || record?.url !== item.informationUrl ||
        record?.primaryAction?.url !== item.actionUrl) {
      errors.push(`Invalid action URL amendment: ${item.recordId || '(missing id)'}`);
      continue;
    }
    byId.set(item.recordId, item);
  }
  return {
    errors,
    records: records.map(record => byId.has(record.id) ? {
      ...record,
      primaryAction: { ...record.primaryAction, url: byId.get(record.id).previousActionUrl }
    } : record)
  };
}
