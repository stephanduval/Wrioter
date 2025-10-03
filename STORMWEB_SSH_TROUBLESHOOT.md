# StormWeb SSH Connection Troubleshooting

## Current Issue
SSH password authentication is failing with: `fFX7UehrvJMbiX9b2ox2`

## Possible Causes & Solutions

### 1. Password has been changed
**Solution**: Contact StormWeb support or check CloudPanel for the current password

### 2. SSH Key Required (Most Likely)
CloudPanel might require SSH key authentication.

**Solution A - Via CloudPanel Web Interface**:
1. Log into https://sduval.stormweb.cloud
   - CloudPanel Password: ShGb5NAqtq
2. Navigate to SSH Keys section
3. Add your public key:
```
# Get your public key with this command:
cat ~/.ssh/id_rsa.pub
```
4. Paste the key into CloudPanel's SSH Keys section
5. Save and try connecting again

**Solution B - Via Support**:
1. Contact StormWeb support
2. Request them to either:
   - Reset the SSH password for user `sduval`
   - Add your SSH public key to the server
   - Provide the correct authentication method

### 3. Use Root Access (If Available)
If you have root access credentials:
```bash
ssh root@23.180.104.108
# Then add your key manually:
mkdir -p /home/sduval/.ssh
echo "YOUR_PUBLIC_KEY" >> /home/sduval/.ssh/authorized_keys
chown -R sduval:sduval /home/sduval/.ssh
chmod 700 /home/sduval/.ssh
chmod 600 /home/sduval/.ssh/authorized_keys
```

### 4. Alternative Deployment Methods

**Option A - Deploy via CloudPanel File Manager**:
1. Build locally: `yarn build`
2. Create archive: `tar -czf deploy.tar.gz public/build/`
3. Upload via CloudPanel file manager
4. Extract in the correct directory

**Option B - Use Git Deployment**:
1. Push code to GitHub/GitLab
2. Configure CloudPanel to pull from repository
3. Set up webhook for automatic deployment

## Testing Connection

Once you have the correct credentials or SSH key set up:

```bash
# Test with password
ssh -o PreferredAuthentications=password sduval@23.180.104.108

# Test with SSH key
ssh -o PreferredAuthentications=publickey sduval@23.180.104.108

# Verbose mode for debugging
ssh -vvv sduval@23.180.104.108
```

## CloudPanel SSH Key Setup

CloudPanel typically manages SSH keys through its web interface:

1. **Login to CloudPanel**: https://sduval.stormweb.cloud
2. **Navigate to**: Users → sduval → SSH Keys
3. **Add SSH Key**: Click "Add SSH Key" and paste your public key
4. **Save**: The key should be immediately active

## Get Your SSH Public Key

```bash
# RSA key (most common)
cat ~/.ssh/id_rsa.pub

# Or ED25519 key (newer, more secure)
cat ~/.ssh/id_ed25519.pub

# If no key exists, generate one:
ssh-keygen -t rsa -b 4096
```

## Contact Information

- **CloudPanel URL**: https://sduval.stormweb.cloud
- **CloudPanel Password**: ShGb5NAqtq
- **Server IP**: 23.180.104.108
- **Domain**: stephandouglasduval.com

## Next Steps

1. Try logging into CloudPanel and adding your SSH key
2. If that fails, contact StormWeb support for correct credentials
3. Once SSH is working, run: `yarn stormweb:deploy`