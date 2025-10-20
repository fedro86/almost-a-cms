#!/bin/bash

#
# Prepare Admin Bundle for Templates
#
# This script builds the React admin app in embed mode and prepares
# it for inclusion in template repositories.
#
# Usage:
#   ./scripts/prepare-admin-bundle.sh [version]
#
# Example:
#   ./scripts/prepare-admin-bundle.sh 1.0.0
#

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
REACT_CMS_DIR="./react-cms"
OUTPUT_DIR="./admin-bundle"
VERSION="${1:-dev}"

echo -e "${BLUE}╔══════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  AlmostaCMS Admin Bundle Preparation ${NC}"
echo -e "${BLUE}╚══════════════════════════════════════╝${NC}"
echo ""

# Step 1: Clean previous builds
echo -e "${YELLOW}[1/5]${NC} Cleaning previous builds..."
if [ -d "$REACT_CMS_DIR/dist-embed" ]; then
    rm -rf "$REACT_CMS_DIR/dist-embed"
    echo "  ✓ Cleaned dist-embed directory"
fi

if [ -d "$OUTPUT_DIR" ]; then
    rm -rf "$OUTPUT_DIR"
    echo "  ✓ Cleaned admin-bundle directory"
fi

# Step 2: Build admin in embed mode
echo ""
echo -e "${YELLOW}[2/5]${NC} Building admin in embed mode..."
cd "$REACT_CMS_DIR"
npm run build:embed
cd ..
echo -e "${GREEN}  ✓ Admin built successfully${NC}"

# Step 3: Copy build to output directory
echo ""
echo -e "${YELLOW}[3/5]${NC} Preparing admin bundle..."
mkdir -p "$OUTPUT_DIR"
cp -r "$REACT_CMS_DIR/dist-embed/"* "$OUTPUT_DIR/"
echo "  ✓ Copied build files to $OUTPUT_DIR"

# Step 4: Create version marker file
echo ""
echo -e "${YELLOW}[4/5]${NC} Creating version marker..."
cat > "$OUTPUT_DIR/.almostacms-admin" <<EOF
{
  "version": "$VERSION",
  "buildDate": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "adminVersion": "$VERSION",
  "description": "AlmostaCMS embedded admin panel"
}
EOF
echo "  ✓ Version marker created: v$VERSION"

# Step 5: Calculate bundle size
echo ""
echo -e "${YELLOW}[5/5]${NC} Bundle statistics..."
BUNDLE_SIZE=$(du -sh "$OUTPUT_DIR" | cut -f1)
JS_SIZE=$(find "$OUTPUT_DIR/assets" -name "*.js" -exec du -ch {} + | tail -1 | cut -f1)
CSS_SIZE=$(find "$OUTPUT_DIR/assets" -name "*.css" -exec du -ch {} + | tail -1 | cut -f1)

echo "  Total bundle size: $BUNDLE_SIZE"
echo "  JavaScript size:   $JS_SIZE"
echo "  CSS size:          $CSS_SIZE"

# Summary
echo ""
echo -e "${GREEN}╔══════════════════════════════════════╗${NC}"
echo -e "${GREEN}║           Build Complete!             ${NC}"
echo -e "${GREEN}╚══════════════════════════════════════╝${NC}"
echo ""
echo -e "Admin bundle prepared at: ${BLUE}$OUTPUT_DIR${NC}"
echo -e "Version: ${BLUE}v$VERSION${NC}"
echo ""
echo "Next steps:"
echo "  1. Copy $OUTPUT_DIR/* to your template repository's /admin directory"
echo "  2. Test the admin in the template context"
echo "  3. Commit and push the template"
echo ""
echo "Example:"
echo -e "  ${BLUE}cp -r $OUTPUT_DIR/* ../vcard-portfolio-template/admin/${NC}"
echo ""
