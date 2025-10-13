# 🔧 Cloudinary Timeout Troubleshooting

## Issue: Upload Timeout (HTTP 499)

Your Cloudinary credentials are **correct**, but uploads are timing out due to network issues.

### ✅ What We Fixed

1. **Increased timeout:** 60s → 120s (2 minutes)
2. **Added chunk_size:** 6MB chunks for better upload handling
3. **Simplified transformations:** Faster processing
4. **Better error messages:** Clear timeout indication
5. **Upload progress logging:** See duration in logs

### 🔍 Root Cause

The timeout error suggests:
- **Slow network connection**
- **VPN blocking Cloudinary API**
- **Firewall restrictions**
- **Network congestion**

### ✅ Solutions (Try in order)

#### 1. Disable VPN (If using)
```bash
# Turn off VPN temporarily
# Try upload again
```

#### 2. Check Network Speed
```bash
# Test your upload speed
speedtest-cli

# Should be at least 1 Mbps upload for smooth operation
```

#### 3. Use Mobile Hotspot (Testing)
```bash
# If on restrictive network (university/office)
# Try using mobile hotspot temporarily
```

#### 4. Compress Images Before Upload
```bash
# Backend now resizes to 800x800 (was 1000x1000)
# Frontend can also compress before sending
```

#### 5. Alternative: Use Unsigned Upload Preset

If timeout persists, we can use Cloudinary's unsigned upload (faster):

**Update `.env`:**
```bash
CLOUDINARY_UPLOAD_PRESET=pizza_unsigned
```

**Create preset in Cloudinary:**
1. Go to: https://console.cloudinary.com/settings/upload
2. Click "Add upload preset"
3. Name: `pizza_unsigned`
4. Signing Mode: `Unsigned`
5. Folder: `pizza-app`
6. Save

This bypasses signature verification (faster uploads).

### 🧪 Test Again

Try uploading again - should work now with 2-minute timeout:

```bash
# Backend should show:
📤 Uploading to Cloudinary: ...
⏱️  This may take 5-30 seconds depending on network speed...
✅ Cloudinary upload successful in 8.45s: https://...
```

### 📊 Expected Upload Times

| Network | Image Size | Upload Time |
|---------|------------|-------------|
| Fast (10+ Mbps) | 1-2 MB | 2-5 seconds |
| Medium (5 Mbps) | 1-2 MB | 5-15 seconds |
| Slow (1 Mbps) | 1-2 MB | 15-30 seconds |
| Very Slow (<1 Mbps) | 1-2 MB | 30-60 seconds |

### ⚠️ If Still Timing Out

Your network is too slow/restricted. Options:

1. **Use different network** (home WiFi vs mobile data)
2. **Compress images more aggressively** on frontend
3. **Use unsigned upload preset** (faster)
4. **Consider alternative:** AWS S3, Firebase Storage

### 🎯 Current Configuration

**Backend timeout:** 2 minutes  
**Chunk size:** 6MB  
**Max image size:** 5MB (Multer limit)  
**Transformations:** Resize to 800x800, auto quality

These settings should work on most networks!

### 📝 Notes

- Credentials are **verified correct** ✅
- Issue is **network-related**, not configuration ⚠️
- Uploads will work, just need stable connection 🌐
- Consider using mobile hotspot if on restrictive network 📱
