#!/bin/bash

# AlmostaCMS Template Setup Wizard
# Interactive script to create a new template from the dev kit

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_header() {
    echo -e "${BLUE}"
    echo "======================================"
    echo "  AlmostaCMS Template Development Kit"
    echo "======================================"
    echo -e "${NC}"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
KIT_DIR="$(dirname "$SCRIPT_DIR")"

# Validate kit structure
if [ ! -d "$KIT_DIR/admin" ] || [ ! -d "$KIT_DIR/boilerplate" ]; then
    print_error "Invalid template dev kit structure"
    print_info "Please ensure you're running this from the scripts/ directory"
    exit 1
fi

print_header
echo ""

# Collect template information
echo "Let's create your new AlmostaCMS template!"
echo ""

# Template name
while true; do
    read -p "Template name (lowercase, hyphens only): " TEMPLATE_NAME

    # Validate template name
    if [[ ! "$TEMPLATE_NAME" =~ ^[a-z0-9-]+$ ]]; then
        print_error "Template name must contain only lowercase letters, numbers, and hyphens"
        continue
    fi

    # Check if directory exists
    if [ -d "../$TEMPLATE_NAME" ]; then
        print_warning "Directory '../$TEMPLATE_NAME' already exists"
        read -p "Overwrite? (y/N): " OVERWRITE
        if [[ "$OVERWRITE" != "y" && "$OVERWRITE" != "Y" ]]; then
            continue
        fi
        rm -rf "../$TEMPLATE_NAME"
    fi

    break
done

# Description
read -p "Template description: " TEMPLATE_DESCRIPTION

# Author
read -p "Author name: " AUTHOR_NAME

# Deployment mode
echo ""
echo "Deployment mode:"
echo "  1) root   - Files in repository root, admin at /admin"
echo "  2) docs   - Files in /docs folder, admin at /admin"
echo ""
while true; do
    read -p "Choose deployment mode (1/2): " DEPLOY_MODE

    if [ "$DEPLOY_MODE" = "1" ]; then
        DEPLOYMENT_MODE="root"
        SOURCE_PATH="/"
        DATA_PATH="data/"
        WORKFLOW="deploy-root.yml"
        break
    elif [ "$DEPLOY_MODE" = "2" ]; then
        DEPLOYMENT_MODE="docs"
        SOURCE_PATH="/docs"
        DATA_PATH="docs/data/"
        WORKFLOW="deploy-docs.yml"
        break
    else
        print_error "Invalid choice. Please enter 1 or 2"
    fi
done

# Data schemas
echo ""
echo "Which data schemas do you need?"
echo "  all     - All schemas (about, projects, blog, contact, navbar, settings)"
echo "  custom  - Choose specific schemas"
echo ""
read -p "Choose (all/custom): " SCHEMA_CHOICE

if [ "$SCHEMA_CHOICE" = "custom" ]; then
    echo ""
    echo "Select schemas (space-separated):"
    echo "  about projects blog contact navbar settings"
    echo ""
    read -p "Schemas: " -a SCHEMAS
else
    SCHEMAS=("about" "projects" "blog" "contact" "navbar" "settings")
fi

# Confirm
echo ""
echo -e "${BLUE}Summary:${NC}"
echo "  Name: $TEMPLATE_NAME"
echo "  Description: $TEMPLATE_DESCRIPTION"
echo "  Author: $AUTHOR_NAME"
echo "  Deployment: $DEPLOYMENT_MODE"
echo "  Schemas: ${SCHEMAS[*]}"
echo ""
read -p "Create template? (Y/n): " CONFIRM

if [[ "$CONFIRM" != "" && "$CONFIRM" != "y" && "$CONFIRM" != "Y" ]]; then
    print_warning "Template creation cancelled"
    exit 0
fi

echo ""
print_info "Creating template structure..."

# Create template directory
TEMPLATE_DIR="../$TEMPLATE_NAME"
mkdir -p "$TEMPLATE_DIR"

# Create directory structure based on deployment mode
if [ "$DEPLOYMENT_MODE" = "root" ]; then
    mkdir -p "$TEMPLATE_DIR/admin"
    mkdir -p "$TEMPLATE_DIR/data"
    mkdir -p "$TEMPLATE_DIR/assets/"{css,js,images}
    mkdir -p "$TEMPLATE_DIR/.github/workflows"

    # Copy boilerplate files
    cp "$KIT_DIR/boilerplate/index.html" "$TEMPLATE_DIR/"
    cp -r "$KIT_DIR/boilerplate/css/"* "$TEMPLATE_DIR/assets/css/"
    cp -r "$KIT_DIR/boilerplate/js/"* "$TEMPLATE_DIR/assets/js/"

    # Copy admin bundle (including hidden files)
    cp -r "$KIT_DIR/admin/"* "$TEMPLATE_DIR/admin/"
    cp "$KIT_DIR/admin/.almostacms-admin" "$TEMPLATE_DIR/admin/"

    # Copy data schemas
    for schema in "${SCHEMAS[@]}"; do
        if [ -f "$KIT_DIR/data/${schema}.json.example" ]; then
            cp "$KIT_DIR/data/${schema}.json.example" "$TEMPLATE_DIR/data/${schema}.json"
        fi
    done

else  # docs mode
    mkdir -p "$TEMPLATE_DIR/docs/admin"
    mkdir -p "$TEMPLATE_DIR/docs/data"
    mkdir -p "$TEMPLATE_DIR/docs/assets/"{css,js,images}
    mkdir -p "$TEMPLATE_DIR/.github/workflows"

    # Copy boilerplate files
    cp "$KIT_DIR/boilerplate/index.html" "$TEMPLATE_DIR/docs/"
    cp -r "$KIT_DIR/boilerplate/css/"* "$TEMPLATE_DIR/docs/assets/css/"
    cp -r "$KIT_DIR/boilerplate/js/"* "$TEMPLATE_DIR/docs/assets/js/"

    # Copy admin bundle (including hidden files)
    cp -r "$KIT_DIR/admin/"* "$TEMPLATE_DIR/docs/admin/"
    cp "$KIT_DIR/admin/.almostacms-admin" "$TEMPLATE_DIR/docs/admin/"

    # Copy data schemas
    for schema in "${SCHEMAS[@]}"; do
        if [ -f "$KIT_DIR/data/${schema}.json.example" ]; then
            cp "$KIT_DIR/data/${schema}.json.example" "$TEMPLATE_DIR/docs/data/${schema}.json"
        fi
    done
fi

print_success "Directory structure created"

# Copy and configure workflow
cp "$KIT_DIR/.github/workflows/$WORKFLOW" "$TEMPLATE_DIR/.github/workflows/deploy.yml"
print_success "GitHub Actions workflow configured"

# Generate .almostacms.json
DEPLOYMENT_PATH="/"  # Default for user pages; users can modify for project pages
cat "$KIT_DIR/.almostacms.json.template" | \
    sed "s|{{TEMPLATE_NAME}}|$TEMPLATE_NAME|g" | \
    sed "s|{{TEMPLATE_DESCRIPTION}}|$TEMPLATE_DESCRIPTION|g" | \
    sed "s|{{AUTHOR_NAME}}|$AUTHOR_NAME|g" | \
    sed "s|{{DEPLOYMENT_PATH}}|$DEPLOYMENT_PATH|g" | \
    sed "s|{{SOURCE_PATH}}|$SOURCE_PATH|g" | \
    sed "s|{{DATA_PATH}}|$DATA_PATH|g" \
    > "$TEMPLATE_DIR/.almostacms.json"
print_success "Configuration file created"

# Copy .gitignore
cp "$KIT_DIR/.gitignore.template" "$TEMPLATE_DIR/.gitignore"
print_success "Gitignore file created"

# Create README
cat > "$TEMPLATE_DIR/README.md" << EOF
# $TEMPLATE_NAME

$TEMPLATE_DESCRIPTION

## Quick Start

1. **Enable GitHub Pages:**
   - Go to repository Settings → Pages
   - Source: GitHub Actions
   - Wait for deployment

2. **Edit Content:**
   - Visit: \`https://username.github.io/$TEMPLATE_NAME/admin\`
   - Login with GitHub
   - Edit your content
   - Save - changes deploy automatically!

## Content Files

EOF

for schema in "${SCHEMAS[@]}"; do
    echo "- \`$DATA_PATH${schema}.json\` - ${schema^} information" >> "$TEMPLATE_DIR/README.md"
done

cat >> "$TEMPLATE_DIR/README.md" << EOF

## Customization

### Colors
Edit \`assets/css/base.css\` CSS variables.

### Layout
Modify \`index.html\` structure.

### Images
Upload to \`assets/images/\` and reference in JSON files.

## Local Development

\`\`\`bash
# Serve locally
python -m http.server 8000
# or
npx serve
\`\`\`

Visit \`http://localhost:8000\`

## Credits

- Template: $AUTHOR_NAME
- CMS: [AlmostaCMS](https://github.com/almostacms/almost-a-cms)
EOF

print_success "README created"

# Initialize git repository
cd "$TEMPLATE_DIR"
git init > /dev/null 2>&1
git add .
git commit -m "Initial template commit" > /dev/null 2>&1
print_success "Git repository initialized"

echo ""
print_success "Template created successfully!"
echo ""
print_info "Next steps:"
echo ""
echo "  1. cd ../$TEMPLATE_NAME"
echo "  2. Customize index.html and CSS"
echo "  3. Edit data/*.json files with your content"
echo "  4. Test locally: python -m http.server"
echo "  5. Validate: ../template-dev-kit/scripts/validate-template.sh"
echo "  6. Push to GitHub:"
echo "     gh repo create $TEMPLATE_NAME --public --source=. --push"
echo "  7. Enable 'Template repository' in GitHub settings"
echo ""
print_info "Happy template creating! 🚀"
echo ""
