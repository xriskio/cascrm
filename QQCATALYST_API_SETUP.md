# 🔌 QQCatalyst API Integration Setup Guide

## ✅ Step 1: API Credentials Added

Your QQCatalyst API credentials have been securely stored in Replit Secrets:

- ✅ **QQCATALYST_CLIENT_ID**: `44c42186-c1b7-49ae-afd4-73d77527acc1`
- ✅ **QQCATALYST_CLIENT_SECRET**: `f3f28807-ed94-409c-9e99-6e69cbec5e3e`
- ✅ **Callback URL**: `https://login.qqcatalyst.com/winformcallback/completed.htm`

## 🔧 Authentication Implementation

The system has been updated to use **OAuth 2.0 client_credentials** grant type for QQCatalyst API authentication.

### Updated Files:
1. **lib/qqcatalyst/auth.ts** - Handles OAuth token requests
2. **lib/qqcatalyst/client.ts** - API client with automatic token refresh
3. **app/api/qqcatalyst/test-connection/route.ts** - Connection test endpoint

## 📋 Current Status

### ⚠️ API Connection Issue Detected

The token endpoint returned HTML instead of JSON, which typically means:

1. **Token URL may need adjustment** - Currently using: `https://login.qqcatalyst.com/oauth/token`
2. **Grant type may need verification** - Currently using: `client_credentials`
3. **Credentials may require activation** - Contact QQCatalyst support if needed

### Next Steps to Resolve:

#### Option 1: Verify Token Endpoint
Contact QQCatalyst support to confirm:
- ✓ Is the token URL correct: `https://login.qqcatalyst.com/oauth/token`?
- ✓ Should we use `client_credentials` grant type?
- ✓ Are there any additional required parameters?

#### Option 2: Check API Documentation
Visit the QQCatalyst API help page:
- **API Reference**: https://api.qqcatalyst.com/help
- Look for "Authentication" or "Getting Started" section
- Confirm OAuth 2.0 flow requirements

#### Option 3: Test with Postman/cURL
Test the authentication directly:

```bash
curl -X POST https://login.qqcatalyst.com/oauth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -H "Authorization: Basic NDRjNDIxODYtYzFiNy00OWFlLWFmZDQtNzNkNzc1MjdhY2MxOmYzZjI4ODA3LWVkOTQtNDA5Yy05ZTk5LTZlNjljYmVjNWUzZQ==" \
  -d "grant_type=client_credentials"
```

If this works, the integration is ready. If not, the credentials may need activation.

## 🧪 Testing the Connection

Once authentication is working, test the connection:

### Test Endpoint:
```
GET https://csrr.casurance.net/api/qqcatalyst/test-connection
```

### Expected Response (Success):
```json
{
  "success": true,
  "message": "QQCatalyst API connection successful!",
  "hasToken": true,
  "apiCallSuccessful": true,
  "sampleData": {
    "carriers": 25
  }
}
```

## 📊 Available QQCatalyst API Endpoints

Once connected, you can use these endpoints to fetch data:

### Policies
- `GET /v1/Policies` - List all policies
- `GET /v1/Policies/{policyID}` - Get specific policy details

### Carriers
- `GET /v1/Carriers` - List all carriers

### Contacts/Customers
- `GET /v1/CommercialCustomers` - Commercial customers
- `GET /v1/PersonalCustomers` - Personal customers

### Billing
- `GET /v1/Billing/LastModifiedCreated` - Billing information

## 🔄 Renewals Import Integration

The renewals import has been configured to use the QQCatalyst API:

### File Import (Currently Working):
- ✅ Upload CSV/Excel files at `/renewals/import`
- ✅ Intelligent field mapping
- ✅ Auto-generated tracking numbers
- ✅ Supports QQCatalyst export format

### API Import (Pending Authentication):
Once the QQCatalyst API connection is working:
- Fetch policies directly from QQCatalyst
- Filter by expiration date range
- Automatic field mapping
- Real-time sync

### API Import Route:
```
POST /api/qqcatalyst/renewals/import-filtered
Body: {
  "startDate": "2025-05-01",
  "endDate": "2025-09-01"
}
```

## 🐛 Troubleshooting

### Issue: HTML response instead of JSON
**Solution**: Verify token URL and credentials with QQCatalyst support

### Issue: 401 Unauthorized
**Solution**: Check if credentials need to be activated in QQCatalyst dashboard

### Issue: 403 Forbidden
**Solution**: Verify API access is enabled for your account

### Issue: Connection timeout
**Solution**: Check firewall settings and network connectivity

## 📞 QQCatalyst Support

If you encounter issues:
1. Email QQCatalyst support with your Client Identifier
2. Request confirmation of:
   - OAuth token endpoint URL
   - Required grant type
   - Any additional authentication parameters
3. Verify API access is enabled for your account

## 📖 Resources

- **API Documentation**: https://api.qqcatalyst.com/help
- **Your Client ID**: `44c42186-c1b7-49ae-afd4-73d77527acc1`
- **Callback URL**: `https://login.qqcatalyst.com/winformcallback/completed.htm`

---

## ⚡ Quick Checklist

- [x] QQCATALYST_CLIENT_ID added to Replit Secrets
- [x] QQCATALYST_CLIENT_SECRET added to Replit Secrets
- [x] Authentication code implemented (lib/qqcatalyst/auth.ts)
- [x] API client created (lib/qqcatalyst/client.ts)
- [x] Test endpoint created (/api/qqcatalyst/test-connection)
- [x] Renewals import routes configured
- [ ] Verify token endpoint with QQCatalyst
- [ ] Test authentication successfully
- [ ] Test renewals API import

Once authentication is working, the QQCatalyst integration will be fully operational! 🎉
