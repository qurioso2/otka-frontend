// Test pentru funcții de validare și utilitate

describe('Validation Utils', () => {
  describe('Email validation', () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    test('validates correct email formats', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.ro',
        'admin@company.co.uk',
        'contact123@site-web.com'
      ];
      
      validEmails.forEach(email => {
        expect(emailRegex.test(email)).toBe(true);
      });
    });

    test('rejects invalid email formats', () => {
      const invalidEmails = [
        'invalid-email',
        '@domain.com',
        'user@',
        'user.domain.com',
        'user@domain',
        ''
      ];
      
      invalidEmails.forEach(email => {
        expect(emailRegex.test(email)).toBe(false);
      });
    });
  });

  describe('CUI/CIF validation', () => {
    const vatRegex = /^(RO)?[0-9]{2,10}$/;
    
    test('validates correct CUI/CIF formats', () => {
      const validVATs = [
        'RO12345678',
        'RO123456',
        '12345678',
        '1234567890'
      ];
      
      validVATs.forEach(vat => {
        expect(vatRegex.test(vat.replace(/\s/g, ''))).toBe(true);
      });
    });

    test('rejects invalid CUI/CIF formats', () => {
      const invalidVATs = [
        'RO1',
        'RO12345678901',
        'invalid-vat',
        'ABC123456',
        ''
      ];
      
      invalidVATs.forEach(vat => {
        expect(vatRegex.test(vat.replace(/\s/g, ''))).toBe(false);
      });
    });
  });

  describe('Phone validation', () => {
    const phoneRegex = /^(\+4|4|0)[0-9]{8,9}$/;
    
    test('validates correct Romanian phone formats', () => {
      const validPhones = [
        '+40123456789',
        '40123456789',
        '0123456789',
        '+40712345678'
      ];
      
      validPhones.forEach(phone => {
        expect(phoneRegex.test(phone.replace(/\s|-/g, ''))).toBe(true);
      });
    });

    test('rejects invalid phone formats', () => {
      const invalidPhones = [
        '123456789',
        '+1234567890',
        '0123',
        '+401234567890123'
      ];
      
      invalidPhones.forEach(phone => {
        expect(phoneRegex.test(phone.replace(/\s|-/g, ''))).toBe(false);
      });
    });
  });

  describe('Price formatting', () => {
    test('formats prices correctly in RON', () => {
      const formatter = new Intl.NumberFormat('ro-RO', { 
        style: 'currency', 
        currency: 'RON' 
      });
      
      expect(formatter.format(1234.56)).toContain('1.234,56');
      expect(formatter.format(0)).toContain('0,00');
      expect(formatter.format(999999.99)).toContain('999.999,99');
    });
  });
});