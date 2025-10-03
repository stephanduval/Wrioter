# Manual SSH Setup for StormWeb

## Quick Setup Commands

Run these commands in your terminal:

### 1. Copy your SSH key to the server
```bash
ssh-copy-id sduvalssh@23.180.104.108
```
**When prompted for password, enter:** `qOLxXsp8C1punbLrfw81`

### 2. Test the connection
```bash
ssh sduvalssh@23.180.104.108 "echo 'SSH setup successful!'"
```

This should connect without asking for a password.

### 3. Deploy your application
```bash
yarn stormweb:deploy
```

## Alternative: Using sshpass (if you want to install it)

```bash
# Install sshpass
sudo apt-get install sshpass

# Copy SSH key automatically
sshpass -p "qOLxXsp8C1punbLrfw81" ssh-copy-id sduvalssh@23.180.104.108

# Test connection
ssh sduvalssh@23.180.104.108 "echo 'Connected!'"
```

## Troubleshooting

If SSH key doesn't work:

1. **Check if your key exists:**
   ```bash
   ls -la ~/.ssh/id_rsa.pub
   ```

2. **Generate a new key if needed:**
   ```bash
   ssh-keygen -t rsa -b 4096
   ```

3. **Check CloudPanel SSH settings:**
   - Log into https://sduval.stormweb.cloud
   - Go to SSH Keys section
   - Verify your key is added

4. **Try verbose mode to debug:**
   ```bash
   ssh -vvv sduval@23.180.104.108
   ```

## Server Details
- **IP**: 23.180.104.108
- **User**: sduvalssh
- **Home Directory**: /home/sduvalssh/
- **Password**: qOLxXsp8C1punbLrfw81
- **CloudPanel**: https://sduval.stormweb.cloud
- **CloudPanel Password**: ShGb5NAqtq