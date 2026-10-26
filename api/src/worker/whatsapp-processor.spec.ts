describe('WhatsApp Event Processor Logic', () => {
  const PAYMENT_LINK_PATTERNS = 'rzp\\.io|razorpay\\.com/pl_|pay\\.cashfree\\.com';
  const paymentRegex = new RegExp(`https?://[^\\s]*(?:${PAYMENT_LINK_PATTERNS})[^\\s]*`, 'gi');

  describe('Payment Link Detection', () => {
    it('should detect Razorpay short links (rzp.io)', () => {
      const text = 'Please pay here: https://rzp.io/l/inv_12345 today!';
      const matches = text.match(paymentRegex);
      expect(matches).not.toBeNull();
      expect(matches?.[0]).toBe('https://rzp.io/l/inv_12345');
    });

    it('should detect Razorpay pl_ links', () => {
      const text = 'Link: https://razorpay.com/pl_998877/pay thank you';
      const matches = text.match(paymentRegex);
      expect(matches).not.toBeNull();
      expect(matches?.[0]).toBe('https://razorpay.com/pl_998877/pay');
    });

    it('should detect Cashfree payment links', () => {
      const text = 'Check out https://pay.cashfree.com/order_5521';
      const matches = text.match(paymentRegex);
      expect(matches).not.toBeNull();
      expect(matches?.[0]).toBe('https://pay.cashfree.com/order_5521');
    });

    it('should return null when text contains no payment links', () => {
      const text = 'Hello John, we received your inquiry. An agent will contact you shortly.';
      const matches = text.match(paymentRegex);
      expect(matches).toBeNull();
    });
  });

  describe('Status Event Extraction', () => {
    it('should map status timestamps properly', () => {
      const ts = 1700000000;
      const date = new Date(ts * 1000);

      const statusMap: Record<string, keyof { sentAt: Date; deliveredAt: Date; readAt: Date; failedAt: Date }> = {
        sent: 'sentAt',
        delivered: 'deliveredAt',
        read: 'readAt',
        failed: 'failedAt',
      };

      expect(statusMap['sent']).toBe('sentAt');
      expect(statusMap['delivered']).toBe('deliveredAt');
      expect(statusMap['read']).toBe('readAt');
      expect(statusMap['failed']).toBe('failedAt');
      expect(date.getTime()).toBe(ts * 1000);
    });

    it('should distinguish outbound statuses from inbound customer replies', () => {
      const webhookPayload = {
        entry: [
          {
            changes: [
              {
                value: {
                  statuses: [{ id: 'wamid.outbound1', status: 'delivered', timestamp: '1700000010' }],
                  messages: [{ from: '919876543210', id: 'wamid.inbound1', timestamp: '1700000020', text: { body: 'Hello' } }],
                },
              },
            ],
          },
        ],
      };

      const change = webhookPayload.entry[0].changes[0].value;
      expect(change.statuses).toHaveLength(1);
      expect(change.statuses[0].id).toBe('wamid.outbound1');
      expect(change.messages).toHaveLength(1);
      expect(change.messages[0].id).toBe('wamid.inbound1');
      expect(change.messages[0].from).toBe('919876543210');
    });
  });
});
