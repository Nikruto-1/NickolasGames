# NickolasGames multiplayer architecture

The browser continues to run the existing single-device games unchanged.

## Shared game core
`packages/game-core` contains only JavaScript data, rules, and pure transitions;
it imports neither React nor browser APIs. The existing game imports are temporary
compatibility re-exports, so existing save schemas and tests continue working.

## Multiplayer API foundation
ASP.NET Core hosts an **in-memory, ephemeral** lobby and turn coordinator:

- `POST /api/sessions` creates a session and the host membership.
- `POST /api/sessions/{id}/join` joins as a participant (up to 6).
- `GET /api/sessions/{id}` requires a session member token in `X-Session-Token`.
- SignalR at `/hubs/game` pushes authoritative state changes.
- `JoinSession(id, token)`, `Start(version)`, `NextTurn(version)`,
  `ChooseTruthDare(choice, version)`, and `LeaveSession()` are Hub methods.

Tokens are secret random capabilities; do not expose them in URLs, logs, or
Discord public activity metadata. Data is stored only in server memory and is
lost on process restart; it is not production-persistent or horizontally scalable.

Discord Activities need one additional, important integration stage: perform
Discord Embedded App SDK authorization on the client, verify the Discord user
and Activity instance on the server, then automatically resolve the Activity
instance to its server session. **Never trust a client-provided instance ID
without checking Discord authorization.** Do not infer that an Activity is
published, registered, or currently usable from this backend alone.

For the actual synchronized games, command-level game rules must run on a
server-authoritative runtime, and the .NET API must validate every command.
The game-core JavaScript module cannot run natively inside ASP.NET Core:
use an independently hosted JS runtime for those reducers or a deliberately
tested equivalent .NET implementation. This foundation only implements
session membership, turn selection and transport — **not complete
multiplayer scoring, cards or Discord authentication**.

## Local development
Run `dotnet run --project NickolasGames/NickolasGames.csproj` from the
repository root. API currently runs separately from the static GitHub Pages
frontend, so configure the client with the secure backend URL before using
multiplayer features. No public secrets should be embedded in the Vite app.
