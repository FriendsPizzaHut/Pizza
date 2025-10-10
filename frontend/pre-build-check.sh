#!/bin/bash

echo "🔍 Pre-Build Validation Check"
echo "================================"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Check 1: SDK Configuration
echo "✓ Checking SDK Configuration..."
if grep -q "compileSdk.*35" android/gradle.properties && \
   grep -q "targetSdk.*35" android/gradle.properties && \
   grep -q "buildToolsVersion.*35" android/gradle.properties; then
    echo -e "${GREEN}✓ SDK 35 configured correctly${NC}"
else
    echo -e "${RED}✗ SDK configuration issue detected${NC}"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Check 2: Package Name Consistency
echo "✓ Checking package name consistency..."
PKG_GRADLE=$(grep "namespace" android/app/build.gradle | sed "s/.*'\(.*\)'.*/\1/")
PKG_MANIFEST=$(grep "package=" android/app/src/main/AndroidManifest.xml | head -1 | sed 's/.*package="\([^"]*\)".*/\1/')
PKG_GOOGLE=$(grep "package_name" google-services.json | sed 's/.*: "\(.*\)".*/\1/')

echo "  - build.gradle: $PKG_GRADLE"
echo "  - google-services.json: $PKG_GOOGLE"

if [ "$PKG_GRADLE" == "$PKG_GOOGLE" ]; then
    echo -e "${GREEN}✓ Package names match${NC}"
else
    echo -e "${RED}✗ Package name mismatch${NC}"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Check 3: Google Services File
echo "✓ Checking google-services.json..."
if [ -f "google-services.json" ]; then
    echo -e "${GREEN}✓ google-services.json found in root${NC}"
else
    echo -e "${RED}✗ google-services.json missing${NC}"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Check 4: AndroidManifest.xml validation
echo "✓ Checking AndroidManifest.xml..."
MANIFEST_ERRORS=$(xmllint --noout android/app/src/main/AndroidManifest.xml 2>&1)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ AndroidManifest.xml is valid XML${NC}"
else
    echo -e "${RED}✗ AndroidManifest.xml has XML errors:${NC}"
    echo "$MANIFEST_ERRORS"
    ERRORS=$((ERRORS + 1))
fi

# Check tools:replace attributes
if grep -q "tools:replace" android/app/src/main/AndroidManifest.xml; then
    echo -e "${GREEN}✓ Manifest merger conflict overrides present${NC}"
else
    echo -e "${YELLOW}⚠ No tools:replace attributes found (may cause conflicts)${NC}"
    WARNINGS=$((WARNINGS + 1))
fi
echo ""

# Check 5: Required permissions
echo "✓ Checking Firebase permissions..."
REQUIRED_PERMS=("INTERNET" "NOTIFICATIONS")
for perm in "${REQUIRED_PERMS[@]}"; do
    if grep -q "android.permission.$perm" android/app/src/main/AndroidManifest.xml; then
        echo -e "${GREEN}✓ $perm permission present${NC}"
    else
        echo -e "${RED}✗ Missing $perm permission${NC}"
        ERRORS=$((ERRORS + 1))
    fi
done
echo ""

# Check 6: EAS configuration
echo "✓ Checking EAS configuration..."
if [ -f "eas.json" ]; then
    if grep -q "EXPO_ANDROID_COMPILE_SDK_VERSION" eas.json && \
       grep -q "EXPO_ANDROID_TARGET_SDK_VERSION" eas.json && \
       grep -q "EXPO_ANDROID_BUILD_TOOLS_VERSION" eas.json; then
        echo -e "${GREEN}✓ EAS environment variables configured${NC}"
    else
        echo -e "${YELLOW}⚠ SDK environment variables missing in eas.json${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "${RED}✗ eas.json not found${NC}"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Check 7: Node modules
echo "✓ Checking node_modules..."
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓ node_modules directory exists${NC}"
    
    # Check critical packages
    CRITICAL_PACKAGES=("@react-native-firebase/app" "@react-native-firebase/messaging" "expo" "react-native")
    for pkg in "${CRITICAL_PACKAGES[@]}"; do
        if [ -d "node_modules/$pkg" ]; then
            echo -e "${GREEN}✓ $pkg installed${NC}"
        else
            echo -e "${RED}✗ $pkg not installed${NC}"
            ERRORS=$((ERRORS + 1))
        fi
    done
else
    echo -e "${RED}✗ node_modules directory missing. Run: npm install${NC}"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Check 8: App resources
echo "✓ Checking app resources..."
if [ -f "android/app/src/main/res/values/colors.xml" ]; then
    if grep -q "notification_icon_color" android/app/src/main/res/values/colors.xml; then
        echo -e "${GREEN}✓ notification_icon_color defined${NC}"
    else
        echo -e "${RED}✗ notification_icon_color missing in colors.xml${NC}"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo -e "${RED}✗ colors.xml not found${NC}"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Summary
echo "================================"
echo "Summary:"
echo "================================"
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed! Ready to build.${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ $WARNINGS warning(s) found. Build may succeed but review warnings.${NC}"
    exit 0
else
    echo -e "${RED}✗ $ERRORS error(s) and $WARNINGS warning(s) found.${NC}"
    echo -e "${RED}Please fix errors before building.${NC}"
    exit 1
fi
