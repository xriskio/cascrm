# QQCatalyst API Reference

## Overview

This document summarizes the QQCatalyst API integration based on the official sample application and Postman collection.

## Authentication Methods

QQCatalyst supports two OAuth 2.0 grant types:

### 1. Password Grant (Currently Implemented) ✅
**Used for:** Server-to-server API access with service accounts

```javascript
POST https://login.qqcatalyst.com/oauth/token
Content-Type: application/x-www-form-urlencoded

client_id={QQCATALYST_CLIENT_ID}
&client_secret={QQCATALYST_CLIENT_SECRET}
&grant_type=password
&username={QQ_USERNAME}
&password={QQ_PASSWORD}
```

**Response:**
```json
{
  "access_token": "gAAAA...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

### 2. Authorization Code Grant (Sample App)
**Used for:** User-facing applications requiring login

```javascript
// Step 1: Redirect user to authorization URL
https://logindev.qqcatalyst.com/oauth/authorize?
  client_id={CLIENT_ID}
  &redirect_uri={REDIRECT_URI}
  &response_type=code
  &scope=openid

// Step 2: Exchange code for token
POST https://logindev.qqcatalyst.com/oauth/token
Content-Type: application/x-www-form-urlencoded

client_id={CLIENT_ID}
&client_secret={CLIENT_SECRET}
&grant_type=authorization_code
&code={CODE}
&redirect_uri={REDIRECT_URI}
&scope=openid
```

## API Endpoints

### Base URLs
- **Production:** `https://api.qqcatalyst.com/v1`
- **Development:** `http://apidev.qqcatalyst.com/v1`

### Authentication Header
All API requests require Bearer token:
```
Authorization: Bearer {access_token}
```

### Key Endpoints from Documentation

#### Locations
```
GET /v1/Locations/UserLocationsV2
GET /v1/Locations/{locationId}
GET /v1/Locations/{locationId}/Contacts/AddressInfo
```

#### Policies
```
GET /v1/Policies/{policyId}/PolicyInfo
GET /v1/Policies/LastModifiedCreated?startDate={YYYY-MM-DD}&endDate={YYYY-MM-DD}&pageNumber={int}&pageSize={int}
```
**Note:** Max pageSize is **500** (QQCatalyst API limit)

#### Contacts
```
PUT /v1/Contacts
```
Creates or updates contact information.

**Request Body:**
```json
{
  "ContactSubType": "C",
  "FirstName": "John",
  "MiddleName": "",
  "LastName": "Doe",
  "Phone": "7203166062",
  "Email": "john@example.com",
  "Line1": "200 suite",
  "Line2": "19th lane",
  "City": "Denver",
  "State": "CO",
  "County": "US",
  "Zip": "80072",
  "Country": "USA",
  "LocationID": 1084,
  "Status": "A",
  "ContactType": "C",
  "BusinessName": "Example Corp",
  "AdditionalActivityNote": "Import notes"
}
```

#### Carriers
```
GET /v1/Carriers
```
Returns list of all carriers.

## API Response Format

QQCatalyst uses a standard response wrapper:

```json
{
  "Data": [...],           // Array of results or null
  "PageNumber": 1,         // Current page (0 if no pagination)
  "PagesTotal": 5,         // Total pages available
  "TotalItems": 243,       // Total number of items
  "IsSuccess": true,       // Request success status
  "ErrorCode": null,       // Error code if failed
  "ErrorMessage": null,    // Error message if failed
  "DisplayMessage": null,  // User-facing message
  "Links": [],             // HATEOAS links
  "Href": "..."            // Self link
}
```

## Current Implementation Status

### ✅ Completed
- Password grant OAuth 2.0 authentication
- Token management with auto-refresh (5 min safety margin)
- Carriers endpoint integration (1,226 carriers fetched successfully)
- Policies/LastModifiedCreated endpoint with pagination (500 max page size)
- Bearer token authentication for all API requests

### 📋 Available for Implementation
Based on the sample app and Postman collection, these endpoints are available:

- User locations and location details
- Policy detailed information (PolicyInfo)
- Contact management (create/update)
- Address information retrieval

## Integration Notes

1. **HTTP Method:** Most endpoints use GET, but some like `Policies/{id}/PolicyInfo` may require POST based on our client implementation
2. **Page Size Limit:** Maximum 500 records per page for paginated endpoints
3. **Token Expiry:** Tokens expire after 1 hour (3600 seconds)
4. **SSL Verification:** Sample app disables SSL verification for dev environment (`NODE_TLS_REJECT_UNAUTHORIZED=0`)
5. **Date Format:** Use YYYY-MM-DD for date parameters

## Environment Variables

```bash
QQCATALYST_CLIENT_ID=your-client-id
QQCATALYST_CLIENT_SECRET=your-client-secret
QQ_USERNAME=your-username
QQ_PASSWORD=your-password
```

## Error Handling

Common error responses:
- **405 Method Not Allowed:** Wrong HTTP method for endpoint
- **401 Unauthorized:** Invalid or expired token
- **400 Bad Request:** Invalid parameters (e.g., pageSize > 500)
- **404 Not Found:** Resource doesn't exist

## References

- Sample Application: See `attached_assets/qqcatalyst_docs/`
- Postman Collection: `attached_assets/qqcatalyst_docs/ui/3rdParty API DEV.postman_collection.json`
- Production API: https://api.qqcatalyst.com/v1
- Token Endpoint: https://login.qqcatalyst.com/oauth/token
