# needyHelpApp_1.0

A platform to help people in need — post a request, browse requests, fulfill them.

## 📍 Resume work / current state

- **What's done & what's next →** [docs/PROJECT_STATUS.md](docs/PROJECT_STATUS.md)
- **Vision & milestones →** [docs/ROADMAP.md](docs/ROADMAP.md)
- **Conventions / how the codebase is wired (also auto-loaded by Copilot) →** [.github/copilot-instructions.md](.github/copilot-instructions.md)

> When starting a new chat session with Copilot, you don't need to re-explain the project — it auto-reads `.github/copilot-instructions.md`. Just say "read project status and continue with the next item" and it will pick up where we left off.

## Stack

- **UI:** React 18, react-router-dom v6, SCSS (CRA) — `needyhelp-ui/`
- **API:** Node + Express + Mongoose + JWT — `needyHelpBackend/` (HTTPS on port 4000)
- **DB:** MongoDB Atlas

## Run locally

```bash
npm run install   # install both apps
npm run dev       # run backend + frontend together
```

Frontend → http://localhost:3000  
Backend → https://localhost:4000 _(self-signed cert; accept the warning once)_

Copy `needyHelpBackend/.env.example` to `needyHelpBackend/.env` and fill in real values.
