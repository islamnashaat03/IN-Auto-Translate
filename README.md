# IN Auto Translate – Translation Toolkit for WPML

This folder contains the public landing page, privacy policy, and the Google Apps Script endpoint used to record optional email-storage consent.

## Publish the site with GitHub Pages

1. Open **Settings → Pages**.
2. Under **Build and deployment**, select **GitHub Actions** as the source.
3. Run the `Deploy GitHub Pages` workflow if it does not start automatically.
4. The site will be available at:
   `https://islamnashaat03.github.io/IN-Auto-Translate/`
5. The privacy policy will be available at:
   `https://islamnashaat03.github.io/IN-Auto-Translate/privacy.html`

The public owner, contact email, retention period, and repository URLs are already configured.

## Set up Google Sheets

See `apps-script/README.md`.

## WordPress plugin integration

After the Apps Script Web App and privacy page are live, add both URLs to the plugin. The plugin should:

- send the email to MyMemory when the user requests the documented higher allowance;
- store the email in Google Sheets only when the separate storage checkbox is selected;
- provide the privacy-policy link beside that checkbox;
- never describe the checkbox as a newsletter subscription;
- allow the MyMemory request to continue when storage consent is declined.
