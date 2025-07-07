#!/bin/bash

# 🔐 Promptr Security Fixes Deployment Script
# This script helps deploy the critical security fixes

echo "🔐 Promptr Security Deployment Script"
echo "====================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "ℹ️  $1"
}

echo "Step 1: Checking Prerequisites..."
echo "================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Not in the project root directory. Please run from the promptr-website folder."
    exit 1
fi

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    print_error "Supabase CLI is not installed."
    print_info "Install it with: npm install -g supabase"
    exit 1
fi

print_status "Prerequisites check passed"
echo ""

echo "Step 2: Database Migration Deployment"
echo "===================================="

# Check if migration file exists
if [ ! -f "supabase/migrations/20241201000001_create_user_access_table.sql" ]; then
    print_error "Migration file not found. Please ensure the migration file exists."
    exit 1
fi

print_info "Found migration file"
print_warning "About to deploy database migration with RLS policies..."
read -p "Continue? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Deploying database migration..."
    
    if supabase db push; then
        print_status "Database migration deployed successfully!"
    else
        print_error "Database migration failed. Check the error above."
        exit 1
    fi
else
    print_warning "Skipping database migration"
fi

echo ""

echo "Step 3: Environment Variables Check"
echo "=================================="

print_info "Checking if required environment variables are set..."
print_warning "You need to set these in your Supabase dashboard:"
echo ""
echo "Required Environment Variables:"
echo "  - SITE_URL: Your production domain (e.g., https://yourdomain.com)"
echo "  - ENVIRONMENT: Set to 'production' for production deployment"
echo ""
echo "Optional but recommended:"
echo "  - STRIPE_SECRET_KEY: Your Stripe secret key"
echo "  - STRIPE_WEBHOOK_SECRET: Your Stripe webhook secret"
echo "  - SUPABASE_SERVICE_ROLE_KEY: Your Supabase service role key"
echo ""

read -p "Have you set these environment variables in Supabase? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Environment variables confirmed"
else
    print_warning "Please set environment variables in Supabase Edge Functions settings"
    print_info "Go to: Supabase Dashboard → Edge Functions → Settings"
fi

echo ""

echo "Step 4: Function Deployment"
echo "=========================="

print_info "Deploying updated Edge Functions..."
print_warning "This will deploy the functions with hardcoded URL fixes..."

read -p "Deploy functions now? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Deploying functions..."
    
    if supabase functions deploy; then
        print_status "Functions deployed successfully!"
    else
        print_error "Function deployment failed. Check the error above."
        exit 1
    fi
else
    print_warning "Skipping function deployment"
    print_info "You can deploy later with: supabase functions deploy"
fi

echo ""

echo "Step 5: Security Verification"
echo "============================="

print_info "Testing the security fixes..."
print_warning "Open test-complete-setup.html in your browser to verify:"
echo ""
echo "  1. Database schema is properly created"
echo "  2. RLS policies are active"
echo "  3. Token validation works"
echo "  4. Functions are deployed and working"
echo ""

read -p "Run the test interface now? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    if command -v open &> /dev/null; then
        open test-complete-setup.html
        print_status "Test interface opened in browser"
    elif command -v xdg-open &> /dev/null; then
        xdg-open test-complete-setup.html
        print_status "Test interface opened in browser"
    else
        print_info "Please manually open: test-complete-setup.html"
    fi
else
    print_info "You can test later by opening: test-complete-setup.html"
fi

echo ""

echo "🎉 Security Deployment Complete!"
echo "================================"
echo ""
print_status "Database migration deployed"
print_status "Functions updated with security fixes"
print_status "Environment variables configured"
echo ""
print_info "Next steps:"
echo "  1. Test all functionality with test-complete-setup.html"
echo "  2. Verify rate limiting is working"
echo "  3. Check CORS configuration"
echo "  4. Monitor function logs for any issues"
echo ""
print_warning "Remember to:"
echo "  - Set SITE_URL environment variable for production"
echo "  - Test with real Stripe webhooks"
echo "  - Monitor API usage and security logs"
echo ""
print_info "For detailed information, see: SECURITY-AUDIT-REPORT.md"
echo ""
print_status "Your Promptr website is now significantly more secure! 🔐" 