# ⚡ Cloudinary Setup Checklist

## Step 1: Get Cloudinary Credentials (2 min)

1. Visit: https://cloudinary.com/users/register/free
2. Sign up (free account)
3. Go to Dashboard: https://console.cloudinary.com/console
4. Copy these 3 values from the "Account Details" section:

```
Cloud Name: _________________
API Key: _________________
API Secret: _________________
```

## Step 2: Configure Backend (.env file) (1 min)

Open `backend/.env` and add:

```bash
CLOUDINARY_CLOUD_NAME=your-cloud-name-here
CLOUDINARY_API_KEY=your-api-key-here
CLOUDINARY_API_SECRET=your-api-secret-here
```

**Important:** Replace with your actual values from Step 1!

## Step 3: Create Upload Directory (30 sec)

```bash
mkdir -p backend/uploads/temp
```

## Step 4: Restart Backend Server (30 sec)

```bash
cd backend
npm run dev
```

**Expected output:**
```
✅ MongoDB connection established
✅ Redis Connected
🚀 Server running on port 5000
```

## Step 5: Test Upload (2 min)

### Option A: Test with Postman/Thunder Client

1. **Create request:**
   - Method: `POST`
   - URL: `http://localhost:5000/api/v1/upload/product-image`

2. **Add headers:**
   - Key: `Authorization`
   - Value: `Bearer <your-jwt-token>`

3. **Add body:**
   - Type: `form-data`
   - Key: `image`
   - Type: `File`
   - Value: Select any image file (JPG, PNG, GIF, or WebP)

4. **Send request**

5. **Expected response:**
```json
{
  "success": true,
  "message": "Product image uploaded successfully",
  "data": {
    "url": "https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/pizza-app/products/abc123.jpg",
    "publicId": "pizza-app/products/abc123"
  }
}
```

✅ If you see `"success": true` and a Cloudinary URL, **it's working!**

### Option B: Test with AddMenuItemScreen

1. Open your app
2. Go to: Admin → Menu Management → Add Item
3. Tap "Pick Image" → Select an image
4. Fill in: Name, Category, Price(s)
5. Tap "Save Menu Item"
6. Watch button states:
   - "Uploading Image..." (with spinner)
   - "Creating..."
   - Success alert

7. Verify in MongoDB:
```bash
# Connect to MongoDB
mongosh

# Use your database
use pizza-db

# Find the product
db.products.findOne({ name: "Your Product Name" })

# Check imageUrl field - should be:
# "imageUrl": "https://res.cloudinary.com/..."
```

✅ If `imageUrl` starts with `https://res.cloudinary.com/`, **it's working!**

## Common Issues

### ❌ "CLOUDINARY_CLOUD_NAME is not defined"
**Fix:** Check `.env` file has correct variable names (no typos)

### ❌ "Invalid signature"
**Fix:** Check `CLOUDINARY_API_SECRET` is correct

### ❌ "Network error"
**Fix:** 
- Check backend is running on port 5000
- Check firewall isn't blocking connection

### ❌ "Invalid file type"
**Fix:** Only JPEG, PNG, GIF, WebP allowed

### ❌ "File too large"
**Fix:** Max 5MB per image

### ❌ Still getting file:// URIs in database
**Fix:**
- Clear app cache and restart
- Make sure you're using updated AddMenuItemScreen code
- Check frontend console for upload errors

## Verification

✅ Backend Setup
- [ ] Added Cloudinary credentials to `.env`
- [ ] Created `/uploads/temp/` directory
- [ ] Backend restarts without errors
- [ ] Can access: `http://localhost:5000/api/v1/upload`

✅ Upload Working
- [ ] Postman test returns Cloudinary URL
- [ ] OR AddMenuItemScreen upload works
- [ ] MongoDB has `https://` URLs (not `file://`)
- [ ] Images display in MenuManagementScreen

✅ Production Ready
- [ ] Images load fast (CDN)
- [ ] Images accessible from different devices
- [ ] No temp files accumulating in `/uploads/temp/`

## Next Steps

Once working:

1. **Update DeliveryBoySignup** to upload documents to Cloudinary
2. **Test thoroughly** with multiple images
3. **Monitor Cloudinary dashboard** for usage stats
4. **Deploy to production** with confidence!

## Resources

- **Full Documentation:** `CLOUDINARY_SETUP_COMPLETE.md`
- **Quick Reference:** `CLOUDINARY_QUICK_START.md`
- **Implementation Summary:** `IMAGE_UPLOAD_FIX_SUMMARY.md`
- **Cloudinary Dashboard:** https://console.cloudinary.com

## Need Help?

1. Check logs in terminal (backend)
2. Check React Native debugger (frontend)
3. Check Cloudinary dashboard for upload attempts
4. Review error messages carefully

---

**Total Setup Time:** ~5 minutes ⏱️  
**Status:** Ready to go! 🚀
