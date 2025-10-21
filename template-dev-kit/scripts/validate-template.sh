#!/bin/bash

# AlmostaCMS Template Validator
# Validates template structure and completeness

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
CHECKS_PASSED=0
CHECKS_FAILED=0
WARNINGS=0

# Helper functions
print_check() {
    echo -n "Checking $1... "
}

print_pass() {
    echo -e "${GREEN}✓ PASS${NC}"
    ((CHECKS_PASSED++))
}

print_fail() {
    echo -e "${RED}✗ FAIL${NC}"
    if [ -n "$1" ]; then
        echo -e "${RED}  → $1${NC}"
    fi
    ((CHECKS_FAILED++))
}

print_warning() {
    echo -e "${YELLOW}  ⚠ WARNING: $1${NC}"
    ((WARNINGS++))
}

print_info() {
    echo -e "${BLUE}  ℹ $1${NC}"
}

# Header
echo -e "${BLUE}"
echo "======================================"
echo "  AlmostaCMS Template Validator"
echo "======================================"
echo -e "${NC}"
echo ""

# Determine deployment mode
if [ -d "docs/admin" ]; then
    DEPLOY_MODE="docs"
    ADMIN_PATH="docs/admin"
    DATA_PATH="docs/data"
    INDEX_PATH="docs/index.html"
    ASSETS_PATH="docs/assets"
else
    DEPLOY_MODE="root"
    ADMIN_PATH="admin"
    DATA_PATH="data"
    INDEX_PATH="index.html"
    ASSETS_PATH="assets"
fi

echo -e "${BLUE}Detected deployment mode: $DEPLOY_MODE${NC}"
echo ""

# Check 1: Admin bundle exists
print_check "admin bundle exists"
if [ -d "$ADMIN_PATH" ]; then
    print_pass
else
    print_fail "Admin bundle not found at $ADMIN_PATH"
fi

# Check 2: Admin bundle has version marker
print_check "admin version marker"
if [ -f "$ADMIN_PATH/.almostacms-admin" ]; then
    print_pass
    VERSION=$(grep -oP '"version":\s*"\K[^"]+' "$ADMIN_PATH/.almostacms-admin" 2>/dev/null || echo "unknown")
    print_info "Admin version: $VERSION"
else
    print_fail "Version marker not found at $ADMIN_PATH/.almostacms-admin"
fi

# Check 3: Admin index.html exists
print_check "admin entry point"
if [ -f "$ADMIN_PATH/index.html" ]; then
    print_pass
else
    print_fail "Admin index.html not found"
fi

# Check 4: .almostacms.json exists
print_check ".almostacms.json exists"
if [ -f ".almostacms.json" ]; then
    print_pass
else
    print_fail "Configuration file not found"
fi

# Check 5: .almostacms.json is valid JSON
print_check ".almostacms.json is valid JSON"
if [ -f ".almostacms.json" ]; then
    if python3 -m json.tool .almostacms.json > /dev/null 2>&1; then
        print_pass
    else
        print_fail "Invalid JSON in .almostacms.json"
    fi
else
    print_fail "File not found"
fi

# Check 6: Required config fields
print_check "required config fields"
if [ -f ".almostacms.json" ]; then
    MISSING_FIELDS=()

    grep -q '"version"' .almostacms.json || MISSING_FIELDS+=("version")
    grep -q '"deployment"' .almostacms.json || MISSING_FIELDS+=("deployment")
    grep -q '"content"' .almostacms.json || MISSING_FIELDS+=("content")

    if [ ${#MISSING_FIELDS[@]} -eq 0 ]; then
        print_pass
    else
        print_fail "Missing fields: ${MISSING_FIELDS[*]}"
    fi
else
    print_fail "File not found"
fi

# Check 7: GitHub Actions workflow exists
print_check "GitHub Actions workflow"
if [ -f ".github/workflows/deploy.yml" ]; then
    print_pass
else
    print_fail "Workflow not found at .github/workflows/deploy.yml"
fi

# Check 8: Data directory exists
print_check "data directory"
if [ -d "$DATA_PATH" ]; then
    print_pass
else
    print_fail "Data directory not found at $DATA_PATH"
fi

# Check 9: At least one data file exists
print_check "data files"
if [ -d "$DATA_PATH" ]; then
    DATA_FILE_COUNT=$(find "$DATA_PATH" -name "*.json" | wc -l)
    if [ "$DATA_FILE_COUNT" -gt 0 ]; then
        print_pass
        print_info "Found $DATA_FILE_COUNT JSON file(s)"
    else
        print_fail "No JSON files found in $DATA_PATH"
    fi
else
    print_fail "Data directory not found"
fi

# Check 10: All data files are valid JSON
if [ -d "$DATA_PATH" ]; then
    print_check "data files are valid JSON"
    INVALID_JSON=0
    for json_file in "$DATA_PATH"/*.json; do
        if [ -f "$json_file" ]; then
            if ! python3 -m json.tool "$json_file" > /dev/null 2>&1; then
                print_warning "Invalid JSON in $(basename "$json_file")"
                ((INVALID_JSON++))
            fi
        fi
    done

    if [ $INVALID_JSON -eq 0 ]; then
        print_pass
    else
        print_fail "$INVALID_JSON file(s) with invalid JSON"
    fi
fi

# Check 11: index.html exists
print_check "index.html"
if [ -f "$INDEX_PATH" ]; then
    print_pass
else
    print_fail "index.html not found at $INDEX_PATH"
fi

# Check 12: data-loader.js exists
print_check "data-loader.js"
if [ -f "$ASSETS_PATH/js/data-loader.js" ]; then
    print_pass
else
    print_fail "data-loader.js not found at $ASSETS_PATH/js/"
fi

# Check 13: CSS files exist
print_check "CSS files"
if [ -f "$ASSETS_PATH/css/reset.css" ] && [ -f "$ASSETS_PATH/css/base.css" ]; then
    print_pass
else
    print_fail "CSS files not found in $ASSETS_PATH/css/"
fi

# Check 14: .gitignore exists
print_check ".gitignore"
if [ -f ".gitignore" ]; then
    print_pass
else
    print_warning ".gitignore not found (recommended)"
fi

# Check 15: README.md exists
print_check "README.md"
if [ -f "README.md" ]; then
    print_pass
else
    print_warning "README.md not found (recommended)"
fi

# Check 16: Check for hardcoded content (warning)
if [ -f "$INDEX_PATH" ]; then
    print_check "hardcoded content in HTML"
    HARDCODED_WARNINGS=0

    # Check for common hardcoded patterns
    if grep -q "John Doe\|Jane Doe\|hello@example.com\|placeholder" "$INDEX_PATH"; then
        print_warning "Possible hardcoded placeholder content found"
        ((HARDCODED_WARNINGS++))
    fi

    if [ $HARDCODED_WARNINGS -eq 0 ]; then
        echo -e "${GREEN}✓ No obvious hardcoded content${NC}"
    fi
fi

# Check 17: Deployment path matches mode
print_check "deployment configuration"
if [ -f ".almostacms.json" ]; then
    SOURCE_PATH=$(grep -oP '"path":\s*"\K[^"]+' .almostacms.json | head -1)

    if [ "$DEPLOY_MODE" = "docs" ]; then
        if grep -q '"path": "/docs"' .almostacms.json; then
            print_pass
        else
            print_warning "Deployment mode is 'docs' but config may not match"
        fi
    else
        print_pass
    fi
else
    print_fail "File not found"
fi

# Summary
echo ""
echo -e "${BLUE}======================================"
echo "  Validation Summary"
echo "======================================${NC}"
echo ""
echo -e "  ${GREEN}Passed:${NC}  $CHECKS_PASSED"
echo -e "  ${RED}Failed:${NC}  $CHECKS_FAILED"
echo -e "  ${YELLOW}Warnings:${NC} $WARNINGS"
echo ""

if [ $CHECKS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ Template validation PASSED!${NC}"
    echo ""
    print_info "Your template is ready to publish"
    print_info "Next steps:"
    echo "  1. git add ."
    echo "  2. git commit -m \"Initial template\""
    echo "  3. gh repo create your-template-name --public --source=. --push"
    echo "  4. Enable 'Template repository' in GitHub settings"
    echo ""
    exit 0
else
    echo -e "${RED}✗ Template validation FAILED${NC}"
    echo ""
    print_info "Please fix the errors above before publishing"
    echo ""
    exit 1
fi
