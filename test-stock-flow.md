# Test Stock Flow - Diagnostic

## Să verificăm manual ce se întâmplă

### Pasul 1: Verifică că o proformă are items cu product_id
```sql
-- În Supabase SQL Editor
SELECT 
    pi.id,
    pi.proforma_id,
    pi.product_id,
    pi.quantity,
    p.sku,
    p.name,
    p.stock_qty
FROM proforma_items pi
LEFT JOIN products p ON p.id = pi.product_id
WHERE pi.proforma_id = [ID_PROFORMA_TA]
LIMIT 10;
```

### Pasul 2: Când validezi plata în admin:
1. Deschide Console browser (F12)
2. Mergi la tab Network
3. Validează plata
4. Caută request-ul către `/api/admin/proforme/confirm`
5. Verifică:
   - Status: 200 OK?
   - Response body: success: true?

### Pasul 3: Verifică logs Next.js
```bash
tail -f /var/log/nextjs.log | grep "STOCK UPDATE"
```

Când validezi plata, ar trebui să vezi:
```
=== STOCK UPDATE START ===
Items found: X
Processing item: { product_id: Y, quantity: Z }
Product Y: oldStock → newStock
✓ Stock updated successfully for product Y
=== STOCK UPDATE END ===
```

## Posibile probleme:

### 1. product_id este NULL
- proforma_items poate avea produse custom (fără product_id)
- Soluție: verifică că proforma are items cu product_id valid

### 2. Permisiuni Supabase
- API-ul folosește getServerSupabase() care depinde de autentificare
- Verifică în Supabase Dashboard → Authentication → Users
- Asigură-te că utilizatorul curent are rol "admin"

### 3. Tabel products nu se actualizează
- Verifică RLS policies pentru tabelul products
- Poate e nevoie să adaugi policy pentru admin să poată UPDATE

## Test manual rapid:

```sql
-- 1. Verifică stoc curent
SELECT id, sku, name, stock_qty FROM products WHERE id = [PRODUCT_ID];

-- 2. Update manual pentru test
UPDATE products SET stock_qty = stock_qty - 1 WHERE id = [PRODUCT_ID];

-- 3. Verifică că s-a actualizat
SELECT id, sku, name, stock_qty FROM products WHERE id = [PRODUCT_ID];
```

Dacă update-ul manual funcționează, problema e la permisiuni sau la logica API-ului.
Dacă nu funcționează, e o problemă de RLS policy.
