#!/usr/bin/env python3
"""
Test script pentru CRUD operations cu Supabase
Testează Articles și Products
"""
import os
from supabase import create_client, Client
import json
from datetime import datetime

# Configurare Supabase
SUPABASE_URL = "https://kzwzqtghjnkrdjfosbdz.supabase.co"
SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6d3pxdGdoam5rcmRqZm9zYmR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNjk1MDg1MSwiZXhwIjoyMDUyNTI2ODUxfQ.pL5qU7vYF0wjN5lO0_fXQqZMxr1lNMpZD4-xJCqGj7s"

# Creare client Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

def test_articles_crud():
    """Test complet CRUD pentru Articles"""
    print("\n" + "="*50)
    print("TESTARE CRUD ARTICLES")
    print("="*50)
    
    # 1. CREATE - Adaugă articol de test
    print("\n1️⃣ CREATE Article...")
    test_article = {
        "slug": f"test-article-{datetime.now().timestamp()}",
        "title": "Test Article from Python",
        "body": "Acesta este un articol de test pentru verificare CRUD.",
        "images": ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
        "published": False
    }
    
    try:
        response = supabase.table("articles").insert(test_article).execute()
        created_article = response.data[0]
        article_id = created_article['id']
        print(f"✅ Article creat cu succes! ID: {article_id}")
        print(f"   Title: {created_article['title']}")
    except Exception as e:
        print(f"❌ Eroare la CREATE: {e}")
        return None
    
    # 2. READ - Citește toate articolele
    print("\n2️⃣ READ Articles (all)...")
    try:
        response = supabase.table("articles").select("*").execute()
        print(f"✅ {len(response.data)} articole găsite")
        for article in response.data[:3]:  # Afișează primele 3
            print(f"   - {article['title']} (published: {article['published']})")
    except Exception as e:
        print(f"❌ Eroare la READ: {e}")
    
    # 3. UPDATE - Actualizează articolul
    print(f"\n3️⃣ UPDATE Article (ID: {article_id})...")
    try:
        update_data = {
            "title": "Test Article UPDATED",
            "published": True
        }
        response = supabase.table("articles").update(update_data).eq("id", article_id).execute()
        updated_article = response.data[0]
        print(f"✅ Article actualizat cu succes!")
        print(f"   Nou title: {updated_article['title']}")
        print(f"   Published: {updated_article['published']}")
    except Exception as e:
        print(f"❌ Eroare la UPDATE: {e}")
    
    # 4. DELETE - Șterge articolul
    print(f"\n4️⃣ DELETE Article (ID: {article_id})...")
    try:
        response = supabase.table("articles").delete().eq("id", article_id).execute()
        print(f"✅ Article șters cu succes!")
    except Exception as e:
        print(f"❌ Eroare la DELETE: {e}")
    
    return True

def test_products_crud():
    """Test complet CRUD pentru Products"""
    print("\n" + "="*50)
    print("TESTARE CRUD PRODUCTS")
    print("="*50)
    
    # 1. CREATE - Adaugă produs de test
    print("\n1️⃣ CREATE Product...")
    test_product = {
        "sku": f"TEST-{int(datetime.now().timestamp())}",
        "name": "Produs Test Python",
        "slug": f"produs-test-{datetime.now().timestamp()}",
        "price_public_ttc": 1299.99,
        "price_partner_net": 1099.99,
        "stock_qty": 10,
        "description": "Descriere produs de test",
        "category": "Test Category",
        "gallery": ["https://example.com/product1.jpg"]
    }
    
    try:
        response = supabase.table("products").insert(test_product).execute()
        created_product = response.data[0]
        product_id = created_product['id']
        print(f"✅ Product creat cu succes! ID: {product_id}")
        print(f"   SKU: {created_product['sku']}")
        print(f"   Name: {created_product['name']}")
        print(f"   Price: {created_product['price_public_ttc']} RON")
    except Exception as e:
        print(f"❌ Eroare la CREATE: {e}")
        return None
    
    # 2. READ - Citește toate produsele
    print("\n2️⃣ READ Products (first 5)...")
    try:
        response = supabase.table("products").select("*").limit(5).execute()
        print(f"✅ {len(response.data)} produse găsite")
        for product in response.data:
            print(f"   - {product['name']} | SKU: {product['sku']} | {product['price_public_ttc']} RON")
    except Exception as e:
        print(f"❌ Eroare la READ: {e}")
    
    # 3. UPDATE - Actualizează produsul
    print(f"\n3️⃣ UPDATE Product (ID: {product_id})...")
    try:
        update_data = {
            "name": "Produs Test UPDATED",
            "price_public_ttc": 1499.99,
            "stock_qty": 15
        }
        response = supabase.table("products").update(update_data).eq("id", product_id).execute()
        updated_product = response.data[0]
        print(f"✅ Product actualizat cu succes!")
        print(f"   Nou name: {updated_product['name']}")
        print(f"   Nou price: {updated_product['price_public_ttc']} RON")
        print(f"   Nou stock: {updated_product['stock_qty']} buc")
    except Exception as e:
        print(f"❌ Eroare la UPDATE: {e}")
    
    # 4. DELETE - Șterge produsul
    print(f"\n4️⃣ DELETE Product (ID: {product_id})...")
    try:
        response = supabase.table("products").delete().eq("id", product_id).execute()
        print(f"✅ Product șters cu succes!")
    except Exception as e:
        print(f"❌ Eroare la DELETE: {e}")
    
    return True

def check_database_stats():
    """Verifică statistici generale"""
    print("\n" + "="*50)
    print("STATISTICI DATABASE")
    print("="*50)
    
    # Count articles
    try:
        response = supabase.table("articles").select("id", count="exact").execute()
        print(f"📊 Total Articles: {response.count}")
    except Exception as e:
        print(f"❌ Eroare la count articles: {e}")
    
    # Count products
    try:
        response = supabase.table("products").select("id", count="exact").execute()
        print(f"📦 Total Products: {response.count}")
    except Exception as e:
        print(f"❌ Eroare la count products: {e}")
    
    # Check products with embeddings
    try:
        response = supabase.table("products").select("id").not_.is_("embedding", "null").execute()
        print(f"🧠 Products cu embeddings: {len(response.data)}")
    except Exception as e:
        print(f"ℹ️  Nu s-a putut verifica embeddings (posibil coloana nu există încă)")

if __name__ == "__main__":
    print("\n🚀 Începere teste CRUD Supabase pentru OTKA")
    print(f"🔗 Conectare la: {SUPABASE_URL}")
    
    # Verifică statistici inițiale
    check_database_stats()
    
    # Test Articles CRUD
    test_articles_crud()
    
    # Test Products CRUD
    test_products_crud()
    
    # Verifică statistici finale
    check_database_stats()
    
    print("\n" + "="*50)
    print("✅ TESTE COMPLETE!")
    print("="*50)
