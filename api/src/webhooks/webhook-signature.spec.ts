import * as crypto from 'crypto';

describe('Webhook Signature Validation', () => {
  const metaAppSecret = 'test_whatsapp_app_secret_123456';
  const razorpaySecret = 'test_razorpay_secret_abcdef';

  function signMetaPayload(body: string, secret: string): string {
    const hash = crypto.createHmac('sha256', secret).update(body).digest('hex');
    return `sha256=${hash}`;
  }

  function verifyMetaSignature(signature: string | undefined, body: string, secret: string): boolean {
    if (!signature || !signature.startsWith('sha256=')) {
      return false;
    }
    const expected = signMetaPayload(body, secret);
    try {
      return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
    } catch {
      return false;
    }
  }

  function signRazorpayPayload(body: string, secret: string): string {
    return crypto.createHmac('sha256', secret).update(body).digest('hex');
  }

  function verifyRazorpaySignature(signature: string | undefined, body: string, secret: string): boolean {
    if (!signature) return false;
    const expected = signRazorpayPayload(body, secret);
    try {
      return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
    } catch {
      return false;
    }
  }

  describe('Meta WhatsApp X-Hub-Signature-256', () => {
    const rawBody = JSON.stringify({
      object: 'whatsapp_business_account',
      entry: [{ id: '123', changes: [] }],
    });

    it('should validate correctly generated HMAC-SHA256 signature', () => {
      const signature = signMetaPayload(rawBody, metaAppSecret);
      const isValid = verifyMetaSignature(signature, rawBody, metaAppSecret);
      expect(isValid).toBe(true);
    });

    it('should reject when payload is tampered with', () => {
      const signature = signMetaPayload(rawBody, metaAppSecret);
      const tamperedBody = rawBody + ' ';
      const isValid = verifyMetaSignature(signature, tamperedBody, metaAppSecret);
      expect(isValid).toBe(false);
    });

    it('should reject when app secret is different', () => {
      const signature = signMetaPayload(rawBody, 'wrong_secret');
      const isValid = verifyMetaSignature(signature, rawBody, metaAppSecret);
      expect(isValid).toBe(false);
    });

    it('should reject when signature is malformed or missing prefix', () => {
      const rawHash = crypto.createHmac('sha256', metaAppSecret).update(rawBody).digest('hex');
      const isValid = verifyMetaSignature(rawHash, rawBody, metaAppSecret);
      expect(isValid).toBe(false);
    });

    it('should reject null or undefined signature', () => {
      expect(verifyMetaSignature(undefined, rawBody, metaAppSecret)).toBe(false);
      expect(verifyMetaSignature('', rawBody, metaAppSecret)).toBe(false);
    });
  });

  describe('Razorpay Webhook Signature', () => {
    const rawBody = JSON.stringify({
      event: 'payment.captured',
      payload: { payment: { entity: { id: 'pay_123', amount: 50000 } } },
    });

    it('should validate legitimate Razorpay signature', () => {
      const signature = signRazorpayPayload(rawBody, razorpaySecret);
      const isValid = verifyRazorpaySignature(signature, rawBody, razorpaySecret);
      expect(isValid).toBe(true);
    });

    it('should reject mismatched signature', () => {
      const signature = 'invalid_hex_signature';
      const isValid = verifyRazorpaySignature(signature, rawBody, razorpaySecret);
      expect(isValid).toBe(false);
    });
  });
});
