# NickolasGames — development and release guide

## Current production scope

The public site at https://games.nickolasspace.com/ is a static React/Vite application with six local games: Who Am I, Crocodile, Alias, Truth or Dare, Checkers and Spy. Supported locales are uk, en, sv, de and es. No deployed API is required to play. ASP.NET Core session infrastructure exists in the repository but is not part of the GitHub Pages deployment.

## Local development

Use Node.js 22 and .NET SDK 10. For reproducible optimized media, install Python 3.12 and Pillow 11.3.0.

```sh
cd NickolasGames/ClientApp
npm ci
npm run dev
```

For a production-like build:

```sh
npm run build
npm test
npm run preview
```

The build performs type checking, Vite bundling and static-page preparation. Output is NickolasGames/wwwroot. Run the build before the tests because some tests inspect generated pages and assets.

The ASP.NET Core service can be checked separately from the repository root:

```sh
dotnet build NickolasGames/NickolasGames.csproj --configuration Release
dotnet run --project tests/SessionSmoke/SessionSmoke.csproj --configuration Release
```

## Architecture

- ClientApp/src/NickolasGames.jsx: application shell, routing integration and lazy game boundaries.
- ClientApp/src/components/HomeScreen.jsx: lazy home-only UI.
- ClientApp/src/features/: individual game implementations.
- ClientApp/src/locales/: five-language content, privacy notice, guides and FAQs.
- ClientApp/src/utils/: local persistence, history, preferences and offline helpers.
- ClientApp/scripts/prepare-pages.mjs: localized static pages, canonical URLs, hreflang, structured data and CSP.
- ClientApp/scripts/finalize-offline.mjs: final hashed asset inventory for offline play.
- NickolasGames/Sessions/: server-side session coordination, not deployed to the static host.

## Privacy and persistence

The current client stores application records in localStorage under the nickolasgames- prefix. The privacy panel inspects and clears these records only; unrelated storage, cached site resources and previously exported files are not deleted by this operation. Keep privacy wording aligned with actual behavior in all five locales. Do not add telemetry, third-party requests or credentials to frontend bundles without a separate review.

The service worker and explicit offline download use browser caches for application resources. Test the offline download again whenever chunk boundaries, routing or the asset inventory change.

## Release process

1. Make changes on a dedicated branch and open a pull request.
2. Require successful feature checks on push and pull request, plus Lighthouse runs for performance changes where configured.
3. Review the diff, verify the branch is up to date and squash merge through the protected main branch.
4. Check the GitHub Pages deployment and verify the live site.

The feature workflow builds the .NET session service, runs its smoke tests, checks npm advisories at high severity, builds the frontend, runs unit/build tests and Chrome/WebKit browser tests. The deploy workflow repeats core checks before publishing static output.

Lighthouse runs cover the home page and six game routes on mobile and desktop. Compare results from the same environment; lab scores are not real-user field metrics. Target CLS at or below 0.1. Do not trade working offline behavior or accessibility for a higher score.

## Deferred work

Backend activation, hosting migration, private repository transition, runtime feature flags and online multiplayer require separate approval and implementation. Preserve the independent local-only mode. No paid infrastructure is required for the current static deployment.
