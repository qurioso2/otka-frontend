#!/usr/bin/env python3
"""
Backend API Testing for OTKA.ro E-commerce Application
Tests API endpoints and server-side functionality
"""

import requests
import sys
import json
from datetime import datetime

class OTKAAPITester:
    def __init__(self, base_url="http://localhost:3001"):
        self.base_url = base_url
        self.session = requests.Session()
        self.tests_run = 0
        self.tests_passed = 0
        self.results = []

    def log_result(self, test_name, success, details="", expected_status=None, actual_status=None):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {test_name} - PASSED")
        else:
            print(f"❌ {test_name} - FAILED")
            if expected_status and actual_status:
                print(f"   Expected status: {expected_status}, Got: {actual_status}")
            if details:
                print(f"   Details: {details}")
        
        self.results.append({
            "test": test_name,
            "success": success,
            "details": details,
            "expected_status": expected_status,
            "actual_status": actual_status
        })

    def test_homepage_load(self):
        """Test if homepage loads successfully"""
        try:
            response = self.session.get(self.base_url)
            success = response.status_code == 200
            
            if success:
                # Check for key elements
                content = response.text
                has_products = "Produse resigilate și expuse" in content
                has_structured_data = "application/ld+json" in content
                has_seo_meta = 'meta name="description"' in content
                
                if has_products and has_structured_data and has_seo_meta:
                    self.log_result("Homepage Load with SEO", True, "Homepage loaded with products, structured data, and SEO meta tags")
                else:
                    self.log_result("Homepage Load", success, f"Missing elements - Products: {has_products}, Structured Data: {has_structured_data}, SEO: {has_seo_meta}")
            else:
                self.log_result("Homepage Load", False, f"HTTP {response.status_code}", 200, response.status_code)
                
        except Exception as e:
            self.log_result("Homepage Load", False, str(e))

    def test_parteneri_page_access(self):
        """Test that /parteneri page is accessible without login (middleware fix)"""
        try:
            response = self.session.get(f"{self.base_url}/parteneri")
            success = response.status_code == 200
            
            if success:
                content = response.text
                has_parteneri_content = "Parteneri OTKA" in content
                is_not_redirected = "/login" not in response.url
                
                if has_parteneri_content and is_not_redirected:
                    self.log_result("Parteneri Page Access", True, "Parteneri page accessible without login redirect")
                else:
                    self.log_result("Parteneri Page Access", False, f"Content check failed - Has content: {has_parteneri_content}, Not redirected: {is_not_redirected}")
            else:
                self.log_result("Parteneri Page Access", False, f"HTTP {response.status_code}", 200, response.status_code)
                
        except Exception as e:
            self.log_result("Parteneri Page Access", False, str(e))

    def test_protected_routes_redirect(self):
        """Test that protected routes redirect to login"""
        protected_routes = ["/admin", "/parteneri/dashboard"]
        
        for route in protected_routes:
            try:
                response = self.session.get(f"{self.base_url}{route}", allow_redirects=False)
                
                # Check if it's a redirect (3xx status) or if it shows login requirement
                if response.status_code in [301, 302, 307, 308]:
                    # It's a redirect, check if it goes to login
                    location = response.headers.get('Location', '')
                    if '/login' in location:
                        self.log_result(f"Protected Route {route}", True, f"Redirects to login: {location}")
                    else:
                        self.log_result(f"Protected Route {route}", False, f"Redirects to wrong location: {location}")
                elif response.status_code == 200:
                    # Check content for login requirement
                    content = response.text
                    if "autentific" in content.lower() or "login" in content.lower() or "acces" in content.lower():
                        self.log_result(f"Protected Route {route}", True, "Shows login requirement")
                    else:
                        self.log_result(f"Protected Route {route}", False, "No login requirement shown")
                else:
                    self.log_result(f"Protected Route {route}", False, f"Unexpected status: {response.status_code}")
                    
            except Exception as e:
                self.log_result(f"Protected Route {route}", False, str(e))

    def test_cart_page(self):
        """Test cart page accessibility"""
        try:
            response = self.session.get(f"{self.base_url}/cart")
            success = response.status_code == 200
            
            if success:
                content = response.text
                has_cart_content = "Coș de cumpărături" in content
                
                if has_cart_content:
                    self.log_result("Cart Page", True, "Cart page loads with proper content")
                else:
                    self.log_result("Cart Page", False, "Cart page missing expected content")
            else:
                self.log_result("Cart Page", False, f"HTTP {response.status_code}", 200, response.status_code)
                
        except Exception as e:
            self.log_result("Cart Page", False, str(e))

    def test_footer_links(self):
        """Test footer links accessibility"""
        footer_links = ["/termeni", "/gdpr", "/cookies", "/contact"]
        
        for link in footer_links:
            try:
                response = self.session.get(f"{self.base_url}{link}")
                success = response.status_code == 200
                
                if success:
                    self.log_result(f"Footer Link {link}", True, "Link accessible")
                else:
                    self.log_result(f"Footer Link {link}", False, f"HTTP {response.status_code}", 200, response.status_code)
                    
            except Exception as e:
                self.log_result(f"Footer Link {link}", False, str(e))

    def test_api_routes(self):
        """Test API routes if accessible"""
        # Test CSV export route (should require authentication)
        try:
            response = self.session.get(f"{self.base_url}/api/admin/commission-summary/export")
            
            # Should return 401 (unauthorized) or redirect to login
            if response.status_code in [401, 403]:
                self.log_result("CSV Export API Protection", True, f"Properly protected with {response.status_code}")
            elif response.status_code in [301, 302, 307, 308]:
                self.log_result("CSV Export API Protection", True, f"Redirects for authentication")
            else:
                self.log_result("CSV Export API Protection", False, f"Unexpected status: {response.status_code}")
                
        except Exception as e:
            self.log_result("CSV Export API Protection", False, str(e))

    def test_build_and_imports(self):
        """Test that the build is working without import errors"""
        try:
            # Check if any pages show build/import errors
            test_pages = ["/", "/parteneri", "/cart"]
            
            for page in test_pages:
                response = self.session.get(f"{self.base_url}{page}")
                content = response.text
                
                # Check for common build/import error indicators
                has_errors = any(error in content.lower() for error in [
                    "module not found",
                    "cannot resolve",
                    "import error",
                    "compilation error",
                    "failed to compile"
                ])
                
                if has_errors:
                    self.log_result(f"Build Check {page}", False, "Build/import errors detected")
                else:
                    self.log_result(f"Build Check {page}", True, "No build/import errors")
                    
        except Exception as e:
            self.log_result("Build Check", False, str(e))

    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting OTKA.ro Backend API Tests")
        print(f"Testing against: {self.base_url}")
        print("=" * 50)
        
        # Run all tests
        self.test_homepage_load()
        self.test_parteneri_page_access()
        self.test_protected_routes_redirect()
        self.test_cart_page()
        self.test_footer_links()
        self.test_api_routes()
        self.test_build_and_imports()
        
        # Print summary
        print("\n" + "=" * 50)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All backend tests passed!")
            return True
        else:
            print(f"⚠️  {self.tests_run - self.tests_passed} tests failed")
            return False

def main():
    tester = OTKAAPITester()
    success = tester.run_all_tests()
    
    # Save results for reporting
    with open('/app/test_reports/backend_results.json', 'w') as f:
        json.dump({
            'timestamp': datetime.now().isoformat(),
            'total_tests': tester.tests_run,
            'passed_tests': tester.tests_passed,
            'success_rate': tester.tests_passed / tester.tests_run if tester.tests_run > 0 else 0,
            'results': tester.results
        }, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())