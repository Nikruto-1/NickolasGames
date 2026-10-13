# NickolasGames redesign audit

Date: 2026-10-13.

## Preserved behavior
Game engines, dictionaries, five languages, scoring bonuses and existing
`nickolasgames-` storage keys are retained. The original Holmes hero and game selection layout were restored at the user request after the initial redesign.
Optional Holmes animation remains available in the footer.

## Privacy inventory
Names, custom words, assignments, scores, timers, selected language and game
progress are saved in localStorage, not sent by this application to the owner.
Storage has no automatic expiry. Users can inspect, export and delete these
application keys without removing unrelated site data. Exports contain hidden
words. New empty progress may be saved after deletion. Offline assets are
stored separately by the service worker.

No application analytics, ads or optional trackers were found or added.
Google Fonts was removed; fonts use the system stack. Media is same-origin.
GitHub Pages may process visitor IP addresses and technical information.
Local-only game storage does not mean hosting processes no personal data.
The contact address is a mailto link, not an application form.

Owner/contact provided by the user: Mykola Kosmachevskyi,
kkosmacevskij@gmail.com. Policy translations are available in five languages.
The owner must still determine applicable jurisdiction, legal bases and
retention for correspondence, and assess hosting/provider transfers.
This is not a GDPR compliance certification. No banner was added for
nonexistent optional tracking.

## SEO
The build generates real home URLs /, /uk/, /sv/, /de/, /es/ and a privacy URL
for each. HTML includes localized visible startup content, title, description,
canonical, Open Graph and factual structured data. Home hreflang points only
to these URLs. Robots and sitemap use the same URL set. No invented reviews,
ratings or statistics are published. Sharing uses the existing local icon.

## Security and hosting limitations
React escapes user strings; exports are JSON, not HTML. Production HTML uses
same-origin CSP with inline-script hashes. Inline styles remain allowed for
existing animations and React style props. GitHub Pages cannot apply ASP.NET
response headers: CSP/referrer meta policies apply there. Header-only policies
such as frame-ancestors and HSTS need a supporting host or reverse proxy.
ASP.NET adds nosniff, frame denial, referrer/permissions policies and HSTS.
Mutable metadata and service workers no longer have year-long .NET caching.

npm audit --omit=dev reported zero known production dependency vulnerabilities
at audit time, not proof of absence of all vulnerabilities. Startup recovery,
complete-build offline caching, version/update handling and deployment
preservation of old hashed assets remain in place.

## Verification
99 Node tests, React production build and .NET build passed. Production output
was tested in WebKit/iPhone viewport and Chromium/Edge: five locale URLs,
privacy keyboard/modal/export/delete, restored home layout, no overflow,
no CSP/runtime errors or third-party application requests, charades bonus and
score restoration, hidden Who Am I cards, Alias and Truth. Contrast tests cover
main text/action/success/error tokens. This is targeted accessibility testing,
not a full WCAG conformance audit. Telegram/iPhone hardware needs owner testing;
desktop WebKit emulation cannot guarantee all embedded-browser behavior.

## Official references
- GDPR: https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng/
- EU rights: https://commission.europa.eu/law/law-topic/data-protection/information-individuals_en
- IMY: https://www.imy.se/en/organisations/data-protection/this-applies-accordning-to-gdpr/data-controllers-and-data-processors/
- PTS cookies: https://www.pts.se/internet-och-telefoni/kakor-cookies/
- GitHub Pages: https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages
- GitHub privacy: https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement

## Design restoration
The original game styles, warm Holmes palette, hero and game selection cards are restored. Privacy dialog styles are scoped and do not override the game design. SEO, CSP, local data tools, system fonts and game behavior remain unchanged.
