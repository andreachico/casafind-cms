# CasaFind CMS

This is the admin dashboard for CasaFind. It is used to manage property listings, users, and the content that appears on the public site.

The CMS connects to the same backend database as the website, so property updates show up on the live CasaFind pages.

## What this app does

- Add and edit property listings
- Upload and manage property images
- Set listing type, price, room count, and other details
- Manage admin and user accounts
- Keep the public CasaFind site updated from the CMS

## Tech stack

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- React Hook Form
- TanStack Query

## Requirements

- Node.js 18+
- npm

## Local setup

1. Open the project folder
   ```bash
   cd CasaFindCMS
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start the app
   ```bash
   npm run dev
   ```

4. Open the app in the browser
   ```text
   http://localhost:5173
   ```

## Available scripts

```bash
npm run dev
npm run build
npm run preview
npm run lint
npm test
```

## Notes

- This app is meant to be used with the CasaFind backend and database.
- Property images are uploaded through the backend and stored in the shared property records.
- The main table only shows the header image. The full detail image is managed from the add/edit property modal.

## License

This project is private.
