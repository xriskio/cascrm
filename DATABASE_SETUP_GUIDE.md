# 📊 Database Setup Guide for Renewals Import

## Quick Setup (5 minutes)

### Step 1: Access Supabase SQL Editor

1. Go to **https://supabase.com/dashboard**
2. Select your **InsureTrac project**
3. Click **SQL Editor** in the left sidebar (icon looks like `</>`)

### Step 2: Run the Setup SQL

1. Click **+ New Query** button
2. Copy **ALL** the contents from `SETUP_RENEWALS_DATABASE.sql` file
3. Paste into the SQL editor
4. Click **Run** button (or press Ctrl/Cmd + Enter)
5. Wait for success message: ✅ "Database setup complete! You can now import renewals."

### Step 3: Verify Tables Created

In the Supabase dashboard:
1. Click **Table Editor** in left sidebar
2. You should see these tables:
   - ✅ `users` - For authentication
   - ✅ `renewals` - For storing renewal data

### Step 4: Test the Import

1. Go to your app: **https://csrr.casurance.net/renewals/import**
2. Download the CSV template
3. Fill in some sample data
4. Upload and import!

---

## 📋 Database Tables Created

### `renewals` Table Structure

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL | Auto-incrementing primary key |
| `renewal_number` | VARCHAR(255) | Unique tracking number (e.g., RNW-1234567890-ABCD) |
| `renewal_id` | TEXT | Unique renewal identifier |
| `insured_name` | TEXT | Customer name (required) |
| `retail_agency_name` | TEXT | Agency/location name |
| `producer` | TEXT | Agent assigned to policy |
| `policy_type` | TEXT | Line of business |
| `policy_number` | TEXT | Policy number |
| `effective_date` | DATE | Policy effective date |
| `expiration_date` | DATE | Policy expiration date (required) |
| `insurance_carrier` | TEXT | Carrier name (required) |
| `expiring_premium` | DECIMAL(10,2) | Premium amount |
| `expiring_commission` | DECIMAL(10,2) | Commission amount |
| `status` | TEXT | Status (pending, active, completed, cancelled) |
| `notes` | TEXT | Additional notes, contact info |
| `created_at` | TIMESTAMP | Record creation time |
| `updated_at` | TIMESTAMP | Last update time |

---

## 🔄 CSV Import Field Mapping

When you upload a CSV, these fields are automatically mapped:

| CSV Column | Database Field |
|------------|----------------|
| Customer First Name + Last Name | `insured_name` |
| Location | `retail_agency_name` |
| Agent On Policy | `producer` |
| Line of Business | `policy_type` |
| Policy Number | `policy_number` |
| Effective Date | `effective_date` |
| Expiration Date | `expiration_date` |
| Writing Carrier | `insurance_carrier` |
| Policy Premium | `expiring_premium` |
| Agency Commission Total | `expiring_commission` |
| Policy Status | `status` |
| Phone/Email/CSR | `notes` |

---

## ✅ Checklist

- [ ] Opened Supabase SQL Editor
- [ ] Ran `SETUP_RENEWALS_DATABASE.sql`
- [ ] Verified `renewals` table exists in Table Editor
- [ ] Tested CSV import at `/renewals/import`
- [ ] Confirmed renewals are showing in the database

---

## 🚨 Troubleshooting

**Problem: "Unauthorized" error when importing**
- **Solution**: Make sure you're logged into the app

**Problem: "No valid renewals found in file"**
- **Solution**: Check CSV format matches the template, ensure headers are correct

**Problem: Database insert errors**
- **Solution**: Check server logs for specific error messages, verify required fields are filled

**Problem: Table already exists**
- **Solution**: This is fine! The SQL uses `CREATE TABLE IF NOT EXISTS` so it won't overwrite existing data

---

## 📞 Need Help?

If you encounter any issues:
1. Check the browser console for errors (F12)
2. Check the server logs in Replit
3. Verify your Supabase connection in Replit Secrets:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
