# FitNova — merged frontend

This folder combines the supplied FitNova page bundles into one React + Vite website.

## Pages in the sidebar
- Dashboard
- Nutrition
- Workout
- Calendar (dynamic calendar page)
- Progress
- Body Stats
- Water Intake
- Sleep
- Supplements
- Goals (dynamic goals page)
- Reports
- Photos
- Settings
- About FitNova
- Contact

## Run locally
1. Install Node.js 20 or newer.
2. Open this folder in VS Code / terminal.
3. Run `npm install`.
4. Run `npm run dev`.
5. Open the local URL printed by Vite.

To make a production build, run `npm run build`.

## Notes
- The water and sleep modules use local browser storage for their logs.
- Calendar and goals use React state/localStorage where implemented in the supplied pages.
- The supplied bundles did not include a single shared backend/API, so this merge is a frontend integration; API-backed features may still need backend endpoints and environment configuration.
- Dependencies are declared in `package.json`. Run `npm install` to regenerate the lockfile for this merged project.

## Merged pages

This version keeps the existing FitNova application as the base and adds the Home page, full Dashboard page, and Progress Photos page from the supplied page projects. The Home page uses the existing sidebar navigation, and the existing Calendar, Goals, Body Stats, Progress, Water, Sleep, Supplements, Reports, Nutrition, Workout, About, Contact, and Settings page integrations are retained.

Existing CSS files were not edited. The new Home, Dashboard, and Photos stylesheets were added as separate files. The Settings component was adjusted to use the shared application sidebar instead of rendering a second internal sidebar.

## Run locally

1. Extract this project folder.
2. Open a terminal in the project folder.
3. Run `npm install`.
4. Run `npm run dev`.


## Frontend source structure

The source has been organized by responsibility:

- `src/components/` — reusable UI components, charts, and modals
- `src/pages/` — route/page-level components, including Calendar, Goals, Progress, Body Stats, About, and Contact
- `src/hooks/` — reusable React hooks
- `src/services/` — API clients and data/configuration modules
- `src/layouts/` — shared page layouts and navigation
- `src/context/` — React context providers and navigation state
- `src/assets/` — images and other imported assets
- `src/styles/` — global and page-specific stylesheets
- `src/utils/` — formatting and chart helpers

The former `src/merged/` and `src/merged-about/` folders were consolidated into the relevant folders above. Imports were updated to match the new locations. Unused Vite/React starter SVG assets were removed.
