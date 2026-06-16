# QQCatalyst API Integrations

This document describes all available QQCatalyst API integrations in InsureTrac.

## Available Endpoints

### 1. Renewals Import
**Endpoint:** `/api/qqcatalyst/policies/fetch-renewals`  
**Method:** POST  
**Purpose:** Import policy renewals from QQCatalyst

**Request Body:**
```json
{
  "startDate": "2024-01-01",
  "endDate": "2024-12-31"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully imported 150 of 150 renewals from QQCatalyst",
  "imported": 150,
  "total": 150,
  "errors": []
}
```

**Features:**
- Fetches policies modified/created within date range
- Max 500 policies per request (QQCatalyst API limit)
- Auto-generates RNW-* tracking numbers
- Maps QQCatalyst fields to InsureTrac renewals table
- Handles duplicate policies
- Returns detailed error messages

**Field Mapping:**
- `CustomerName` → `insured_name`
- `PolicyNumber` → `policy_number`
- `LOB` (Line of Business) → `policy_type`
- `WritingCarrier` → `insurance_carrier`
- `TotalPremium` → `expiring_premium`
- `EffectiveDate` / `ExpirationDate` → date fields
- `AgentName` → `producer`
- `MGA` → `wholesaler_mga`
- `Status` → mapped to internal status values

---

### 2. Clients/Contacts Import
**Endpoint:** `/api/qqcatalyst/contacts/import`  
**Method:** GET  
**Purpose:** Import customer contacts from QQCatalyst locations

**Response:**
```json
{
  "success": true,
  "message": "Successfully imported/updated 45 of 47 clients from QQCatalyst",
  "imported": 45,
  "total": 47,
  "errors": []
}
```

**Features:**
- Fetches contacts from all user locations (limited to 5 locations to prevent timeout)
- Auto-generates CLI-* tracking numbers
- Updates existing clients if QQ Contact ID matches
- Maps QQCatalyst contact fields to InsureTrac clients table
- Stores full QQ contact data in `json_raw` field for reference

**Field Mapping:**
- `FirstName` + `LastName` / `BusinessName` → `name`
- `Email` → `email`
- `Phone` → `phone`
- `Line1` + `Line2` → `address`
- `City`, `State`, `Zip` → respective fields
- `ContactID` → `qq_contact_id`
- `Status` (A/Active) → `status` (active/inactive)
- `LocationID` → `location_id`

**Usage in UI:**
- Navigate to `/clients` page
- Click "Import from QQCatalyst" button
- Wait for import to complete (may take 30-60 seconds)
- Refresh page to see imported clients

---

### 3. Policy Details
**Endpoint:** `/api/qqcatalyst/policies/get-details`  
**Method:** POST  
**Purpose:** Fetch detailed information for a specific policy

**Request Body:**
```json
{
  "policyId": "12345"
}
```

**Response:**
```json
{
  "success": true,
  "policy": {
    // Full policy details from QQCatalyst PolicyInfo endpoint
    "PolicyNumber": "ABC123",
    "CustomerName": "John Doe",
    "EffectiveDate": "2024-01-01",
    "ExpirationDate": "2025-01-01",
    "TotalPremium": 5000,
    // ... additional policy fields
  }
}
```

**Features:**
- Fetches comprehensive policy information from QQCatalyst
- Returns full policy object for detailed analysis
- Can be used to supplement imported renewal data

---

## Database Requirements

### Renewals Table
Must have the following columns (run `FIX_RENEWALS_IMPORT.sql` in Supabase):
- `renewal_number` (TEXT, UNIQUE) - Auto-generated tracking number
- `insured_name` (TEXT)
- `policy_number` (TEXT)
- `policy_type` (TEXT)
- `insurance_carrier` (TEXT)
- `expiring_premium` (DECIMAL) - **CRITICAL COLUMN**
- `expiring_commission` (DECIMAL)
- `effective_date` (DATE)
- `expiration_date` (DATE)
- `producer` (TEXT)
- `wholesaler_mga` (TEXT)
- `status` (TEXT)
- `notes` (TEXT)
- `created_at`, `updated_at` (TIMESTAMP)

### Clients Table
Must have the following columns:
- `id` (UUID PRIMARY KEY)
- `client_number` (TEXT, UNIQUE) - Auto-generated tracking number
- `name` (TEXT)
- `first_name` (TEXT)
- `last_name` (TEXT)
- `business_name` (TEXT)
- `email` (TEXT)
- `phone` (TEXT)
- `address` (TEXT)
- `city` (TEXT)
- `state` (TEXT)
- `zip_code` (TEXT)
- `qq_contact_id` (TEXT) - Links to QQCatalyst contact
- `status` (TEXT)
- `contact_type` (TEXT)
- `location_id` (TEXT)
- `json_raw` (JSONB) - Stores full QQ contact data
- `created_at`, `updated_at` (TIMESTAMP)

---

## API Authentication

All QQCatalyst API calls use OAuth 2.0 password grant authentication configured in `lib/qqcatalyst/client.ts`:

**Required Environment Variables:**
```bash
QQCATALYST_CLIENT_ID=your-client-id
QQCATALYST_CLIENT_SECRET=your-client-secret
QQ_USERNAME=your-username
QQ_PASSWORD=your-password
```

**Token Management:**
- Tokens automatically obtained on first request
- Tokens cached with 1-hour expiration (5-minute safety margin)
- Auto-refresh when expired
- All requests include `Authorization: Bearer {token}` header

---

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message describing what went wrong",
  "imported": 0,
  "total": 0
}
```

**Common Errors:**
- **405 Method Not Allowed**: Wrong HTTP method for endpoint
- **401 Unauthorized**: Invalid or expired QQCatalyst token
- **400 Bad Request**: Invalid parameters (e.g., pageSize > 500)
- **500 Server Error**: Database or API communication failure

**Database Errors:**
- `PGRST204: Could not find column`: Missing column in database (run migration script)
- `PGRST116: Unique constraint violation`: Duplicate data (check tracking numbers)

---

## Usage Examples

### Import Renewals for 2024
```typescript
const response = await fetch("/api/qqcatalyst/policies/fetch-renewals", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    startDate: "2024-01-01",
    endDate: "2024-12-31"
  })
});

const data = await response.json();
console.log(`Imported ${data.imported} renewals`);
```

### Import All Clients
```typescript
const response = await fetch("/api/qqcatalyst/contacts/import", {
  method: "GET"
});

const data = await response.json();
console.log(`Imported ${data.imported} clients`);
```

### Get Policy Details
```typescript
const response = await fetch("/api/qqcatalyst/policies/get-details", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ policyId: "12345" })
});

const data = await response.json();
console.log("Policy details:", data.policy);
```

---

## Future Enhancements

Potential additional endpoints:

1. **Locations Import** - Import all agency locations
2. **Documents Fetch** - Retrieve policy documents
3. **Activity Log Sync** - Sync activity logs from QQCatalyst
4. **Bulk Policy Update** - Update multiple policies at once
5. **Real-time Webhooks** - Listen for QQCatalyst changes

---

## Troubleshooting

### Import returns 0 results
1. Check QQCatalyst credentials in Replit Secrets
2. Verify date range contains policies
3. Check QQCatalyst API limits (500 max per request)

### Database errors during import
1. Run `FIX_RENEWALS_IMPORT.sql` in Supabase SQL Editor
2. Verify all required columns exist
3. Check Row Level Security policies allow inserts

### Timeout errors
1. Reduce date range for renewals import
2. Clients import limited to 5 locations (may need pagination)
3. Increase `maxDuration` in route.ts if needed

---

## Rate Limits

**QQCatalyst API Limits:**
- Max 500 records per page
- Token expires after 1 hour
- No documented request rate limits

**InsureTrac Limits:**
- Renewals import: 60 second timeout
- Clients import: 60 second timeout (fetches 5 locations)
- Policy details: 30 second timeout

---

## Support

For QQCatalyst API issues, contact QQCatalyst support.  
For InsureTrac integration issues, check the server logs or contact the development team.
