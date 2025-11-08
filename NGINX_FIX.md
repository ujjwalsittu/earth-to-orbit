# 🚨 URGENT: nginx 503 Errors Fix

## Problems Identified

### 1. Connection Limit Too Restrictive ❌
Your nginx had `limit_conn conn_limit 10` which means **only 10 concurrent connections per IP**.

When a browser loads your Next.js app:
- It tries to load 15-20 JavaScript files **simultaneously**
- HTTP/2 opens multiple parallel connections
- nginx hits the limit of 10 and returns **503 Service Unavailable**

**From your logs:**
```
2025/11/08 14:58:04 [error] 21#21: *64 limiting connections by zone "conn_limit"
GET /_next/static/chunks/559-63b6d25af299e701.js HTTP/2.0" 503
GET /_next/static/chunks/386-ca47acbecb85d154.js HTTP/2.0" 503
GET /_next/static/chunks/app/layout-18f684e354baf645.js HTTP/2.0" 503
```

### 2. nginx Healthcheck Failing ❌
nginx container showed "unhealthy" because the healthcheck tried `GET /health` but the web domain didn't have that endpoint.

---

## ✅ FIXES APPLIED

I've made the following changes to `nginx/conf.d/default.conf`:

1. **Increased connection limit from 10 to 100**
   ```nginx
   limit_conn conn_limit 100;  # Was: 10
   ```

2. **Added /health endpoint to web server block**
   ```nginx
   location /health {
       access_log off;
       return 200 "healthy\n";
       add_header Content-Type text/plain;
   }
   ```

---

## 🔧 DEPLOYMENT STEPS

**On your server, run these commands:**

```bash
cd /home/ubuntu/earth-to-orbit

# 1. Pull the latest changes
git pull origin claude/docker-compose-startup-logs-011CUvVd1pnJATqqKWb5kueM

# 2. Restart nginx to apply new configuration
docker compose restart nginx

# 3. Wait 10 seconds for restart
sleep 10

# 4. Verify nginx is now healthy
docker compose ps
```

**Expected output after restart:**
```
NAME           STATUS
e2o-nginx      Up X seconds (healthy)     ✅
e2o-web        Up X minutes (healthy)     ✅
e2o-api        Up X minutes (healthy)     ✅
e2o-mongodb    Up X minutes (healthy)     ✅
```

---

## 🧪 TESTING

**1. Check nginx logs (should be clean):**
```bash
docker compose logs --tail=50 nginx
```

**2. Test in browser:**
1. Go to: `https://ato.ujjwalsittu.in/login`
2. **Clear browser cache** (CTRL+SHIFT+DELETE)
3. **Hard refresh** (CTRL+SHIFT+R)
4. Open DevTools (F12) → Network tab
5. Reload page

**✅ Expected results:**
- All JavaScript files return **200 OK** (no more 503 errors!)
- Page loads completely with no errors
- Login button is interactive

**❌ If you still see 503 errors:**
```bash
# Check if nginx config reloaded
docker exec e2o-nginx nginx -t

# Check connection limit in running config
docker exec e2o-nginx cat /etc/nginx/conf.d/default.conf | grep limit_conn

# Should show: limit_conn conn_limit 100;
```

---

## 📊 What Changed?

### Before (Broken):
```nginx
limit_conn conn_limit 10;  # Too restrictive!
```
- Browser requests 20 files
- nginx allows only 10 concurrent connections
- Remaining 10 requests get 503 errors
- JavaScript doesn't load → Login button doesn't work

### After (Fixed):
```nginx
limit_conn conn_limit 100;  # Enough for HTTP/2 parallel loading
```
- Browser requests 20 files
- nginx allows 100 concurrent connections
- All 20 requests succeed with 200 OK
- JavaScript loads → Login button works!

---

## 🎯 Next Steps After nginx Fix

**Once nginx is healthy and 503 errors are gone:**

1. **Verify web container is healthy:**
   ```bash
   docker compose ps e2o-web
   ```

   If web container is **NOT healthy**, run:
   ```bash
   docker compose logs --tail=100 web
   ```
   And share the output.

2. **Check if web container has correct API URL:**
   ```bash
   docker exec e2o-web sh -c 'echo $NEXT_PUBLIC_API_URL'
   ```

   Should show: `https://apiato.ujjwalsittu.in/api`

   If it shows anything else (like missing `/api`), you need to rebuild:
   ```bash
   # Make sure .env has correct value
   grep NEXT_PUBLIC_API_URL .env

   # Should show: NEXT_PUBLIC_API_URL=https://apiato.ujjwalsittu.in/api

   # If not, update .env then rebuild web:
   docker compose down
   docker compose build --no-cache web
   docker compose up -d
   ```

3. **Test login:**
   - Go to: `https://ato.ujjwalsittu.in/login`
   - Clear cache and hard refresh
   - Try logging in with:
     - Email: `admin@ujjwalsittu.in`
     - Password: `Admin@123`

---

## ❓ Still Having Issues?

**Provide these outputs:**

1. Container status:
   ```bash
   docker compose ps
   ```

2. Web container logs:
   ```bash
   docker compose logs --tail=100 web
   ```

3. Web container environment:
   ```bash
   docker exec e2o-web sh -c 'echo $NEXT_PUBLIC_API_URL'
   ```

4. Browser console screenshot showing:
   - API URL initialization message
   - Any errors in console
   - Network tab showing JavaScript file requests
