import { describe, it, expect } from 'vitest';
import { whatsappLink } from './whatsapp';

describe('whatsappLink', () => {
  it('strips formatting characters from the phone number', () => {
    expect(whatsappLink('(11) 98888-7777')).toBe('https://wa.me/5511988887777');
  });

  it('assumes Brazil country code when none is given', () => {
    expect(whatsappLink('11988887777')).toBe('https://wa.me/5511988887777');
  });

  it('keeps an existing country code when the number is longer than 11 digits', () => {
    expect(whatsappLink('551198887777123')).toBe('https://wa.me/551198887777123');
  });

  it('appends an encoded prefilled message when provided', () => {
    expect(whatsappLink('11988887777', 'Oi João!')).toBe('https://wa.me/5511988887777?text=Oi%20Jo%C3%A3o!');
  });

  it('omits the text param when no message is given', () => {
    expect(whatsappLink('11988887777')).not.toContain('?text=');
  });
});
