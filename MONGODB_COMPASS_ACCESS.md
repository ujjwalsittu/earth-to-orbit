# 🗄️ MongoDB Compass Access Guide

MongoDB has been configured to be accessible externally via port 27017 so you can connect using MongoDB Compass from your local machine.

---

## 🚀 DEPLOYMENT

**Deploy the updated docker-compose configuration:**

```bash
cd /home/ubuntu/earth-to-orbit

# Pull latest changes
git pull origin claude/docker-compose-startup-logs-011CUvVd1pnJATqqKWb5kueM

# Restart MongoDB with exposed port
docker compose up -d mongodb

# Verify MongoDB is accessible
docker compose ps mongodb
```

---

## 📱 CONNECTING WITH MONGODB COMPASS

### Step 1: Get Your Connection Details

**Find your MongoDB password:**
```bash
# On your server
cd /home/ubuntu/earth-to-orbit
grep MONGODB_PASSWORD .env
```

Copy the password value.

### Step 2: Connection String

Use this connection string in MongoDB Compass:

```
mongodb://admin:<YOUR_PASSWORD>@<YOUR_SERVER_IP>:27017/earth-to-orbit?authSource=admin
```

**Replace:**
- `<YOUR_PASSWORD>` - The password from your `.env` file
- `<YOUR_SERVER_IP>` - Your server's public IP address

**Example:**
```
mongodb://admin:MySecurePassword123@18.142.88.55:27017/earth-to-orbit?authSource=admin
```

### Step 3: Connect in Compass

1. **Open MongoDB Compass**
2. **Click "New Connection"**
3. **Paste your connection string**
4. **Click "Connect"**

You should now see:
- Database: `earth-to-orbit`
- Collections: `users`, `organizations`, `sites`, `labs`, `components`, etc.

---

## 🔍 USEFUL COMPASS OPERATIONS

### View All Users
```
Database: earth-to-orbit
Collection: users
```

### View All Components with Sites
```javascript
// In Compass aggregation pipeline:
[
  {
    $lookup: {
      from: "sites",
      localField: "site",
      foreignField: "_id",
      as: "siteDetails"
    }
  }
]
```

### Find Components Without Sites
```javascript
// In Compass filter:
{ site: { $exists: false } }
```

### Update All Components to Have a Site
```javascript
// First, get a site ID
// Go to "sites" collection and copy an _id

// Then in "components" collection, use Update:
// Filter:
{}

// Update:
{
  $set: {
    site: ObjectId("paste-site-id-here")
  }
}
```

---

## 🔒 SECURITY CONSIDERATIONS

### ⚠️ IMPORTANT: Port 27017 is Now Publicly Accessible

**Risks:**
- MongoDB is exposed to the internet
- Anyone with credentials can access your database
- Potential for brute force attacks

**Recommended Security Measures:**

### Option 1: Use SSH Tunnel (Most Secure - Recommended)

Instead of exposing port 27017, use an SSH tunnel:

1. **Remove port exposure from docker-compose.yml:**
   ```yaml
   mongodb:
     # Remove or comment this line:
     # ports:
     #   - "27017:27017"
   ```

2. **Create SSH tunnel from your local machine:**
   ```bash
   # On your local machine (Mac/Linux):
   ssh -L 27017:localhost:27017 root@<YOUR_SERVER_IP>

   # Keep this terminal open while using Compass
   ```

3. **Connect Compass to localhost:**
   ```
   mongodb://admin:<PASSWORD>@localhost:27017/earth-to-orbit?authSource=admin
   ```

This way, MongoDB is only accessible through the encrypted SSH tunnel!

### Option 2: Firewall Rules (Moderate Security)

Allow only your IP address to access port 27017:

```bash
# On your server (AWS Security Group or UFW):

# If using UFW:
sudo ufw allow from <YOUR_LOCAL_IP> to any port 27017

# If using AWS:
# Go to EC2 → Security Groups → Your instance's security group
# Add inbound rule:
# - Type: Custom TCP
# - Port: 27017
# - Source: My IP (or your specific IP address)
```

### Option 3: Strong Password (Minimum Security)

Ensure MongoDB has a very strong password:

```bash
# Generate a strong password:
openssl rand -base64 32

# Update .env file:
MONGODB_PASSWORD=<generated-strong-password>

# Rebuild containers:
docker compose down
docker compose up -d
```

---

## 🧪 TESTING CONNECTION

### Test from Server

```bash
# On your server:
docker exec -it e2o-mongodb mongosh -u admin -p <password>

# Should see MongoDB shell
# Type: show dbs
# Should list: earth-to-orbit
```

### Test from Local Machine

```bash
# Install mongosh locally (if not installed):
# Mac: brew install mongosh
# Windows: Download from mongodb.com

# Connect:
mongosh "mongodb://admin:<password>@<server-ip>:27017/earth-to-orbit?authSource=admin"

# Should connect successfully
```

---

## 📋 QUICK REFERENCE

| Item | Value |
|------|-------|
| Host | `<your-server-ip>` or `localhost` (if using SSH tunnel) |
| Port | `27017` |
| Username | `admin` (from `.env` MONGODB_USER) |
| Password | Check `.env` file → MONGODB_PASSWORD |
| Authentication Database | `admin` |
| Database | `earth-to-orbit` |

---

## 🚨 TROUBLESHOOTING

### Cannot Connect - Connection Timeout

**Check firewall:**
```bash
# On server:
sudo ufw status

# If port 27017 is not allowed:
sudo ufw allow 27017/tcp
sudo ufw reload
```

**Check AWS Security Group:**
- Go to EC2 console
- Find your instance
- Check Security Groups
- Ensure port 27017 is open to your IP

### Cannot Connect - Authentication Failed

**Verify credentials:**
```bash
# On server:
cat /home/ubuntu/earth-to-orbit/.env | grep MONGODB

# Make sure you're using the exact password
```

### Connection Works but No Data

**Verify database name:**
```bash
# Connect to MongoDB:
docker exec -it e2o-mongodb mongosh -u admin -p <password>

# List databases:
show dbs

# Switch to correct database:
use earth-to-orbit

# List collections:
show collections
```

---

## 🔄 TO DISABLE EXTERNAL ACCESS

If you want to disable external MongoDB access:

```bash
# Edit docker-compose.yml
# Remove or comment out the ports section:
# ports:
#   - "27017:27017"

# Restart:
docker compose up -d mongodb
```

MongoDB will only be accessible from within the Docker network.

---

## 📞 SUPPORT

If you encounter issues:
1. Check MongoDB container logs: `docker compose logs mongodb`
2. Check firewall rules: `sudo ufw status`
3. Check AWS Security Groups in EC2 console
4. Verify credentials in `.env` file
