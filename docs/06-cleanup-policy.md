# IE237 API - Data Retention & Cleanup Policy

## Subscriber Data Retention

### Policy
- **Retention period**: 3 years from `created_at` timestamp
- **Automated cleanup**: Scheduled database maintenance
- **Compliance**: GDPR (right to be forgotten) and CAN-SPAM
- **Purpose**: Balance data utility with privacy obligations

### Cleanup Job Specifications

| Frequency | Trigger | Action |
|-----------|---------|--------|
| Weekly | Cron job (Sunday 02:00 UTC) | Check for 3-year-old records |
| Monthly | Deep clean | Full retention-period deletion |
| On-request | API trigger | Manual cleanup for specific accounts |

### SQL Cleanup Example

```sql
-- Step 1: Identify subscribers past 3-year retention
SELECT id, email, created_at 
FROM subscribers 
WHERE created_at < NOW() - INTERVAL '3 years'
  AND status = 'unsubscribed';

-- Step 2: Delete identified records (with logging)
DELETE FROM subscribers 
WHERE created_at < NOW() - INTERVAL '3 years'
  AND status = 'unsubscribed';

-- Step 3: Log deletion for audit
INSERT INTO cleanup_log (
  table_name,
  operation,
  record_count,
  ran_at
) VALUES (
  'subscribers',
  'delete_3yr_retention',
  15,
  NOW()
);
```

### Data Before Deletion (Export)

Before automated deletion, offer export:
- `GET /api/subscriber/export?email=x@y.com`
- Returns: All subscriber data in JSON/CSV
- Valid for 7 days (download link)
- GDPR data portability requirement

### Unsubscribed Data Handling
- **Keep**: Email + unsubscribed_at timestamp (minimum)
- **Delete**: Preferences, subscription source, metadata
- **Rationale**: Prove consent was given, but minimize stored data

## Content Table Cleanup

### Policy
- **Published content**: No automatic deletion (archival)
- **Draft content**: Delete after 90 days of inactivity
- **Rationale**: Prevent database bloat, keep only active work

### Draft Cleanup Query
```sql
DELETE FROM content 
WHERE status = 'draft'
  AND created_at < NOW() - INTERVAL '90 days';
```

## Audit Logging

### Cleanup Log Table
```sql
CREATE TABLE cleanup_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL,
  record_count INTEGER NOT NULL DEFAULT 0,
  ran_at TIMESTAMP NOT NULL DEFAULT NOW(),
  initiated_by TEXT, -- 'cron', 'admin', 'api'
  notes TEXT
);
```

### Logging Every Cleanup Run
- Record what was deleted
- Record count
- Who/what triggered it
- Timestamp
- Reason/policy reference

## Compliance Checklist

### GDPR
- [ ] Right to be forgotten implemented
- [ ] Data export functionality
- [ ] Retention policy documented
- [ ] Minimal data storage principle

### CAN-SPAM
- [ ] Unsubscribe link in every newsletter
- [ ] Unprocessed within 10 days
- [ ] Physical address in emails
- [ ] No deceptive subject lines

### Internal
- [ ] 3-year retention documented
- [ ] Automated cleanup verified
- [ ] Audit logs complete
- [ ] Backup before deletion