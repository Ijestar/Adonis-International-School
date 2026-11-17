# Contact form Google Sheets setup

1. Create a Google Sheet for contact submissions and copy its spreadsheet ID from the URL.
2. Open **Extensions > Apps Script** from the sheet, replace the starter code with `Code.gs`, and save.
3. In Apps Script **Project Settings > Script Properties**, add:
   - `SPREADSHEET_ID`: the spreadsheet ID from step 1.
   - `CONTACT_FORM_SECRET`: a randomly generated secret with at least 32 characters.
   - `SHEET_NAME`: `Contact submissions` (optional; this is the default).
4. Deploy the Apps Script project as a **Web app**, running as you and allowing access to anyone. Copy the deployment URL ending in `/exec`.
5. In Vercel, add these environment variables for the project:
   - `GOOGLE_APPS_SCRIPT_URL`: the deployed `/exec` URL.
   - `CONTACT_FORM_SECRET`: the exact same secret set in Apps Script.
6. Redeploy the Vercel project. The contact page submits to `/api/contact`; secrets remain server-side.

The Apps Script validates the shared secret and submission fields. It prefixes formula-like text before writing it to a cell so submitted values cannot be interpreted as spreadsheet formulas.