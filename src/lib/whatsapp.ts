/**
 * Gera um link "clique para conversar" do WhatsApp (wa.me), sem precisar de
 * conta na API oficial do WhatsApp Business. Funciona com qualquer número que
 * tenha WhatsApp instalado.
 */
export function whatsappLink(phone: string, message?: string): string {
  const digits = phone.replace(/\D/g, '');
  // Se o número não vier com código de país, assume Brasil (55).
  const withCountryCode = digits.length <= 11 ? `55${digits}` : digits;
  const base = `https://wa.me/${withCountryCode}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
