/**
 * @jest-environment node
 */

import { POST } from '../../../app/api/partners/register/route';

// Mock FormData pentru test
global.FormData = class MockFormData {
  private data: Map<string, string> = new Map();
  
  append(key: string, value: string) {
    this.data.set(key, value);
  }
  
  get(key: string) {
    return this.data.get(key) || null;
  }
} as any;

describe('/api/partners/register', () => {
  test('validates required fields', async () => {
    const formData = new FormData();
    formData.append('company_name', '');
    formData.append('email', 'test@example.com');
    
    const request = {
      formData: () => Promise.resolve(formData),
      url: 'http://localhost:3000/api/partners/register'
    } as any;

    const response = await POST(request);
    const text = await response.text();
    
    expect(response.status).toBe(400);
    expect(text).toContain('Numele companiei este obligatoriu');
  });

  test('validates email format', async () => {
    const formData = new FormData();
    formData.append('company_name', 'Test Company');
    formData.append('vat_id', 'RO12345');
    formData.append('contact_name', 'John Doe');
    formData.append('email', 'invalid-email');
    
    const request = {
      formData: () => Promise.resolve(formData),
      url: 'http://localhost:3000/api/partners/register'
    } as any;

    const response = await POST(request);
    const text = await response.text();
    
    expect(response.status).toBe(400);
    expect(text).toContain('Format email invalid');
  });

  test('validates CUI/CIF format', async () => {
    const formData = new FormData();
    formData.append('company_name', 'Test Company');
    formData.append('vat_id', 'invalid-vat');
    formData.append('contact_name', 'John Doe');
    formData.append('email', 'test@example.com');
    
    const request = {
      formData: () => Promise.resolve(formData),
      url: 'http://localhost:3000/api/partners/register'
    } as any;

    const response = await POST(request);
    const text = await response.text();
    
    expect(response.status).toBe(400);
    expect(text).toContain('Format CUI/CIF invalid');
  });

  test('validates phone format when provided', async () => {
    const formData = new FormData();
    formData.append('company_name', 'Test Company SRL');
    formData.append('vat_id', 'RO12345678');
    formData.append('contact_name', 'John Doe');
    formData.append('email', 'test@example.com');
    formData.append('phone', '123'); // Invalid phone
    
    const request = {
      formData: () => Promise.resolve(formData),
      url: 'http://localhost:3000/api/partners/register'
    } as any;

    const response = await POST(request);
    const text = await response.text();
    
    expect(response.status).toBe(400);
    expect(text).toContain('Format telefon invalid');
  });

  test('accepts valid data', async () => {
    const formData = new FormData();
    formData.append('company_name', 'Test Company SRL');
    formData.append('vat_id', 'RO12345678');
    formData.append('contact_name', 'John Doe');
    formData.append('email', 'test@example.com');
    formData.append('phone', '+40123456789');
    
    const request = {
      formData: () => Promise.resolve(formData),
      url: 'http://localhost:3000/api/partners/register'
    } as any;

    const response = await POST(request);
    
    // Ar trebui să fie redirect (status 307) pentru success
    expect([200, 307]).toContain(response.status);
  });
});