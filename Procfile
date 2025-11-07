# Railway Procfile for Earth To Orbit API

# Main API Server (single process only)
api: cd apps/api && node dist/server.js

# Note: Seed and migrations should be run manually via Railway CLI or dashboard.
# Keeping them out of Procfile prevents Railway from creating extra services.
# To seed: railway run pnpm seed
# To migrate (future): railway run pnpm migrate
