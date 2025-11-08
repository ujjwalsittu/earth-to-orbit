# 🚨 URGENT: Login Fix - Deployment Instructions

## Problem Identified

The web container was built with an **OLD environment variable** that doesn't include `/api` in the API URL. Since Next.js bakes `NEXT_PUBLIC_*` variables into the build at **build-time** (not runtime), the running container has the wrong API URL compiled into the JavaScript bundle.

### Symptoms:
- ❌ Login button does nothing
- ❌ 503 errors for JavaScript files (`/_next/static/chunks/*.js`)
- ❌ No POST requests sent to API
- ❌ Console shows wrong API URL without `/api` suffix

## Root Cause

**Next.js Build-Time Variables:**
- `NEXT_PUBLIC_API_URL` is baked into the build during `docker build`
- Updating `.env` file alone doesn't fix it - container must be **REBUILT**
- Current container has old value: `https://apiato.ujjwalsittu.in` (missing `/api`)
- Required value: `https://apiato.ujjwalsittu.in/api` (with `/api` suffix)

---

## ✅ STEP-BY-STEP FIX

### Step 1: Stop All Containers

```bash
cd /path/to/earth-to-orbit
docker-compose down
```

### Step 2: Verify .env File Has Correct API URL

```bash
# Check current value
grep NEXT_PUBLIC_API_URL .env

# It should show:
# NEXT_PUBLIC_API_URL=https://apiato.ujjwalsittu.in/api
#                                                    ^^^^ Must have /api suffix!

# If it doesn't have /api, update it:
nano .env
# OR
vim .env
```

**Make sure this line exists in `.env`:**
```
NEXT_PUBLIC_API_URL=https://apiato.ujjwalsittu.in/api
```

### Step 3: Rebuild Web Container (CRITICAL!)

```bash
# Remove old web image to ensure clean rebuild
docker-compose build --no-cache web
```

**This will take a few minutes** - it's installing dependencies and building Next.js from scratch.

### Step 4: Start All Services

```bash
docker-compose up -d
```

### Step 5: Verify Container Health

Wait 30-60 seconds for containers to start, then check status:

```bash
docker-compose ps
```

**Expected output - ALL should show "healthy":**
```
NAME           STATUS
e2o-mongodb    Up (healthy)
e2o-api        Up (healthy)
e2o-web        Up (healthy)
e2o-nginx      Up (healthy)
```

**If web shows "starting" or "unhealthy"**, check logs:

```bash
docker-compose logs web
```

### Step 6: Check Web Container Logs

```bash
# View last 50 lines of web logs
docker-compose logs --tail=50 web

# Look for these GOOD signs:
# ✓ "Ready in X ms"
# ✓ "- Local: http://localhost:3000"
# ✓ No error messages

# Bad signs (means rebuild failed):
# ✗ "Error: Cannot find module..."
# ✗ "ENOENT: no such file..."
# ✗ Any stack traces
```

### Step 7: Test in Browser

1. **Clear browser cache** (CTRL+SHIFT+DELETE) - Important!
2. Go to: `https://ato.ujjwalsittu.in/login`
3. **Open browser console** (F12 → Console tab)
4. **Refresh the page** (CTRL+F5 for hard refresh)

**Look for these indicators:**

✅ **GOOD SIGNS:**
```
API Client initialized with baseURL: https://apiato.ujjwalsittu.in/api
                                                                    ^^^^
```

✅ No 503 errors for JavaScript files
✅ Page loads completely, login form is interactive
✅ When you click login, console shows: "Button clicked" and "Form submitted"

❌ **BAD SIGNS:**
```
API Client initialized with baseURL: https://apiato.ujjwalsittu.in
                                                                    ^^^^^ Missing /api!
```
❌ 503 errors for `/_next/static/chunks/*.js`
❌ Page appears broken or unstyled

### Step 8: Test Login

Use the demo credentials to test login:

**Platform Admin:**
- Email: `admin@ujjwalsittu.in`
- Password: `Admin@123`

**What should happen:**
1. Click "Sign in" button
2. Console shows: "Button clicked" → "Form submitted" → "Attempting login with: admin@ujjwalsittu.in"
3. POST request to: `https://apiato.ujjwalsittu.in/api/auth/login`
4. Success response → redirect to `/admin` dashboard

---

## 🔧 Troubleshooting

### Problem: Web container shows "unhealthy"

```bash
# Check detailed health check logs
docker inspect e2o-web | grep -A 10 Health

# Check if port 3000 is responding inside container
docker exec e2o-web wget -O- http://localhost:3000

# Restart just the web container
docker-compose restart web
```

### Problem: Still seeing old API URL in console

This means the browser is **caching old JavaScript files**:

1. **Hard refresh:** CTRL+SHIFT+R (Chrome/Firefox)
2. **Clear cache:** CTRL+SHIFT+DELETE → Clear cached images and files
3. **Try incognito/private window**
4. **Disable cache in DevTools:** F12 → Network tab → Check "Disable cache"

### Problem: Build fails during rebuild

```bash
# Check build logs
docker-compose build web 2>&1 | tee build.log

# If out of disk space
docker system prune -a
# WARNING: This removes ALL unused images, be careful!

# Then retry build
docker-compose build --no-cache web
```

### Problem: NEXT_PUBLIC_API_URL not set in build

```bash
# Verify it's in .env file
cat .env | grep NEXT_PUBLIC_API_URL

# Verify docker-compose can read it
docker-compose config | grep NEXT_PUBLIC_API_URL

# Should show:
# NEXT_PUBLIC_API_URL: https://apiato.ujjwalsittu.in/api
```

---

## 📋 Quick Checklist

Before asking for help, verify:

- [ ] `.env` file has `NEXT_PUBLIC_API_URL=https://apiato.ujjwalsittu.in/api`
- [ ] Ran `docker-compose build --no-cache web`
- [ ] Ran `docker-compose up -d`
- [ ] All containers show "healthy" in `docker-compose ps`
- [ ] Cleared browser cache
- [ ] Hard refreshed the login page (CTRL+SHIFT+R)
- [ ] Console shows correct API URL with `/api` suffix
- [ ] No 503 errors for JavaScript files

---

## 🎯 Expected Result After Fix

**Browser Console:**
```javascript
API Client initialized with baseURL: https://apiato.ujjwalsittu.in/api
```

**Network Tab (when clicking login):**
```
POST https://apiato.ujjwalsittu.in/api/auth/login
Status: 200 OK (or 401 for wrong credentials)
```

**Container Status:**
```
NAME           STATUS
e2o-web        Up 2 minutes (healthy)
```

---

## 📞 If Still Not Working

Collect this information:

1. Output of: `docker-compose ps`
2. Output of: `docker-compose logs --tail=100 web`
3. Output of: `cat .env | grep NEXT_PUBLIC_API_URL`
4. Screenshot of browser console showing API URL
5. Screenshot of Network tab showing requests

This will help diagnose the issue faster.
