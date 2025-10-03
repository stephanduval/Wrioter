# Claude TODO - Wrioter Project

*This file tracks high-level tasks for multi-session work. Use Claude Code's built-in todo system for active task management.*

## 🚀 **IN PROGRESS: StormWeb CloudPanel Deployment**

### **Current Status (2025-10-01):**
- ✅ SSH access configured for deployment user (sduval)
- ✅ Created deployment script: `deploy-stormweb-cloudpanel.sh`
- ✅ Updated package.json with correct SSH commands
- ⚠️ Deployment partially complete (upload timeout due to 496MB archive)

### **Next Session Tasks:**
1. **Clean up partial upload**: `ssh sduval@23.180.104.108 "rm ~/deploy.tar.gz"`
2. **Optimize deployment** (choose one):
   - Option A: Exclude vendor directory, rebuild on server
   - Option B: Use rsync instead of tar archive
   - Option C: Split deployment into smaller parts
3. **Get CloudPanel database credentials**
4. **Complete deployment and configuration**
5. **Set up queue workers for file processing**
6. **Test site**: https://stephandouglasduval.com

### **Server Quick Reference:**
- **IP**: 23.180.104.108
- **SSH**: `yarn stormweb:ssh` (sduval) or `yarn stormweb:ssh:root`
- **Site Dir**: `/home/sduval/htdocs/stephandouglasduval.com/`
- **Details**: See `STORMWEB_DEPLOYMENT_PROGRESS.md`

---

## ✅ **COMPLETED: Application Core Features**

### **Navigation System (2025-07-02)**
- Fixed "Select Manuscript" button functionality
- Implemented custom navigation item pattern
- Enhanced navigation documentation

### **Scrivener Import Module**
- Horizon queue processing implemented
- File upload with error handling
- Progress tracking for imports

### **Manuscript Management**
- Navigation tree with drag and drop
- State management with Pinia
- Real-time updates

---

## 📋 **Future Enhancements**
- [ ] Add export functionality
- [ ] Implement version history
- [ ] Add collaborative editing features
- [ ] Multi-user support with permissions

---

## 📍 **Important Notes**
- Queue workers MUST run for file processing
- Local dev: `yarn dev:full` (includes queue worker)
- StormWeb uses CloudPanel with Nginx
- DigitalOcean server (138.197.142.132) is legacy

---
*Last updated: 2025-10-01*
*Status: StormWeb deployment in progress*