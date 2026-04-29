# Deployment

This site deploys to Cloudflare Pages with Wrangler from GitHub Actions.

## Cloudflare setup

Create the Pages project once:

```bash
wrangler pages project create chorecraft --production-branch=main
```

Attach the custom domain in Cloudflare:

- Project: `chorecraft`
- Production branch: `main`
- Custom domain: `chorecraft.artems.net`

## GitHub secrets

Add these repository secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

The token needs permission to deploy Cloudflare Pages projects for the account.

## Local commands

```bash
bun install
bun run build
bun run deploy
```
