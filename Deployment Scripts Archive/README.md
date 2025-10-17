# Archived Deployment Scripts

These deployment scripts are **no longer in use** and have been archived for reference only.

## Current Deployment

**Use the following script for deploying to production:**
```bash
# From project root
yarn stormweb:deploy

# Or directly
./deploy-stormweb-fixed.sh
```

See [docs/deployment/stormweb/deploy.md](../docs/deployment/stormweb/deploy.md) for full deployment documentation.

---

## Archived Scripts

### deploy-stormweb.sh
- **Status**: Replaced by `deploy-stormweb-fixed.sh`
- **Reason**: Generic version, lacked specific CloudPanel configuration
- **Date Archived**: October 2025

### deploy-stormweb-cloudpanel.sh
- **Status**: Replaced by `deploy-stormweb-fixed.sh`
- **Reason**: Previous CloudPanel version with incorrect paths
- **Date Archived**: October 2025

### deploy-stormweb-docker.sh
- **Status**: Not used
- **Reason**: Docker deployment not implemented on StormWeb
- **Date Archived**: October 2025

### deploy-stormweb-rsync.sh
- **Status**: Not used
- **Reason**: SCP/tar method preferred over rsync for CloudPanel
- **Date Archived**: October 2025

### deploy-docker-stormweb.sh
- **Status**: Not used
- **Reason**: Docker variant not implemented
- **Date Archived**: October 2025

---

## Migration History

### DigitalOcean → StormWeb CloudPanel
- **Old Server**: 138.197.142.132 (DigitalOcean)
- **New Server**: 23.180.104.108 (StormWeb CloudPanel)
- **Migration Date**: September 2025
- **Old Scripts**: `deploy:prod`, `deploy:full` (removed from package.json)

### Why StormWeb?
- Managed CloudPanel hosting
- Better resource allocation
- Simplified server management
- Included SSL certificates
- CloudPanel UI for easy administration

---

## If You Need to Reference These Scripts

These scripts are kept for historical reference. If you need to understand how deployment worked previously or migrate to a different hosting setup, you can review these files.

**Do not use these scripts for current deployments.** They may have incorrect paths, credentials, or deployment logic.

---

## Questions?

See the main deployment documentation:
- [StormWeb Deployment Guide](../docs/deployment/stormweb/deploy.md)
- [Production Deployment Guide](../docs/deployment/production-deployment.md)
