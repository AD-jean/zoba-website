import { describe, it, expect, vi, beforeEach } from 'vitest';

const send = vi.fn();
vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({ emails: { send } }))
}));

import { sendTicketEmail, sendDonationReceiptEmail, escapeHtml, QR_CONTENT_ID } from '../src/services/email.service';

const ticketParams = {
  to: 'fidele@example.com',
  name: 'Jean <script>alert(1)</script>',
  activityTitle: 'Retraite & Louange',
  activityDate: '12/12/2026',
  activityLocation: 'Lomé',
  ticketUrl: 'https://zoba-cbt.org/billet/abc',
  qrPng: Buffer.from('fake-png')
};

describe('email.service', () => {
  beforeEach(() => {
    send.mockReset();
    send.mockResolvedValue({ data: { id: 'email_1' }, error: null });
    process.env.RESEND_API_KEY = 're_test';
    process.env.EMAIL_FROM = 'billets@zoba-cbt.org';
  });

  it('echappe le HTML', () => {
    expect(escapeHtml('<a href="x">&\'')).toBe('&lt;a href=&quot;x&quot;&gt;&amp;&#39;');
  });

  it('envoie le billet avec le QR en piece jointe inline (cid), pas en data: URI', async () => {
    await sendTicketEmail(ticketParams);
    expect(send).toHaveBeenCalledTimes(1);
    const payload = send.mock.calls[0][0];
    expect(payload.to).toBe('fidele@example.com');
    expect(payload.from).toBe('billets@zoba-cbt.org');
    expect(payload.html).toContain(`cid:${QR_CONTENT_ID}`);
    expect(payload.html).not.toContain('data:image');
    expect(payload.attachments).toEqual([
      expect.objectContaining({ contentId: QR_CONTENT_ID, contentType: 'image/png', content: ticketParams.qrPng })
    ]);
  });

  it("n'injecte pas de HTML brut provenant des saisies", async () => {
    await sendTicketEmail(ticketParams);
    const { html } = send.mock.calls[0][0];
    expect(html).not.toContain('<script>');
    expect(html).toContain('Jean &lt;script&gt;');
    expect(html).toContain('Retraite &amp; Louange');
  });

  it("leve une erreur si Resend refuse l'envoi", async () => {
    send.mockResolvedValue({ data: null, error: { message: 'domain not verified' } });
    await expect(sendTicketEmail(ticketParams)).rejects.toMatchObject({ statusCode: 502 });
  });

  it('leve une erreur claire si EMAIL_FROM manque', async () => {
    delete process.env.EMAIL_FROM;
    await expect(sendTicketEmail(ticketParams)).rejects.toMatchObject({ statusCode: 500 });
    expect(send).not.toHaveBeenCalled();
  });

  it('envoie un recu de don avec montant et reference', async () => {
    await sendDonationReceiptEmail({
      to: 'donateur@example.com',
      name: 'Awa',
      amount: 5000,
      currency: 'XOF',
      reference: '665f0c0c0c0c0c0c0c0c0c0c',
      date: new Date('2026-11-24T10:00:00Z')
    });
    const payload = send.mock.calls[0][0];
    expect(payload.to).toBe('donateur@example.com');
    expect(payload.subject).toMatch(/Merci pour votre don/);
    expect(payload.html).toMatch(/5\s000 XOF/);
    expect(payload.html).toContain('665f0c0c0c0c0c0c0c0c0c0c');
  });
});
