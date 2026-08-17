# Google Sheets setup

## What you need

- A Google account dedicated to the plugin is recommended.
- A new, private Google Sheet.
- Permission to deploy a Google Apps Script Web App.

## Create the endpoint

1. Create a new Google Sheet named `IN Auto Translate consent records`.
2. Copy the Sheet ID from its URL. It is the value between `/d/` and `/edit`.
3. In the Sheet, open **Extensions → Apps Script**.
4. Replace the editor content with `Code.gs` from this folder and save.
5. Open **Project Settings → Script properties**.
6. Add a property named `SHEET_ID` and paste the Sheet ID as its value.
7. In the editor, select `setupSheet` and click **Run** once. Approve Google's requested permissions.
8. Click **Deploy → New deployment → Web app**.
9. Set **Execute as** to **Me**.
10. Set **Who has access** to **Anyone** so WordPress servers can submit consent records.
11. Deploy and copy the Web App URL ending in `/exec`.

## Test request

Send a JSON POST body like this from a server-side client:

```json
{
  "email": "person@example.com",
  "consent": true,
  "consent_at": "2026-08-17T12:00:00Z",
  "plugin_version": "0.1.0",
  "privacy_version": "1.0",
  "source": "wordpress-plugin",
  "website": ""
}
```

Expected response:

```json
{"ok":true}
```

## Security and maintenance notes

- Keep the Sheet private and restrict access to the minimum number of people.
- The endpoint stores no translation text, website URL, or IP address intentionally.
- The `website` field is a honeypot; the plugin should always send it empty.
- Duplicate emails are updated rather than appended repeatedly.
- Apps Script is a public endpoint and offers only basic abuse resistance. Review the Sheet regularly and use a dedicated Google account.
- If the privacy text changes materially, update `PRIVACY_VERSION` in both the script and plugin and redeploy the Web App.
- Do not place a reusable secret in the public WordPress plugin source; it would not remain secret.

