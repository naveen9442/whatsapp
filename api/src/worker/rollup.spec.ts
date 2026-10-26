describe('Rollup & Metric Calculation Logic', () => {
  it('should correctly calculate rates and totals', () => {
    const rawMetrics = [
      {
        messagesSent: 100,
        delivered: 90,
        read: 70,
        failed: 10,
        replies: 35,
        linksShared: 20,
        paymentsReceived: 10,
        amountReceived: 15000,
      },
      {
        messagesSent: 200,
        delivered: 180,
        read: 150,
        failed: 20,
        replies: 65,
        linksShared: 40,
        paymentsReceived: 25,
        amountReceived: 35000,
      },
    ];

    const aggregated = rawMetrics.reduce(
      (acc, m) => ({
        messagesSent: acc.messagesSent + m.messagesSent,
        delivered: acc.delivered + m.delivered,
        read: acc.read + m.read,
        failed: acc.failed + m.failed,
        replies: acc.replies + m.replies,
        linksShared: acc.linksShared + m.linksShared,
        paymentsReceived: acc.paymentsReceived + m.paymentsReceived,
        amountReceived: acc.amountReceived + m.amountReceived,
      }),
      {
        messagesSent: 0,
        delivered: 0,
        read: 0,
        failed: 0,
        replies: 0,
        linksShared: 0,
        paymentsReceived: 0,
        amountReceived: 0,
      },
    );

    expect(aggregated.messagesSent).toBe(300);
    expect(aggregated.delivered).toBe(270);
    expect(aggregated.read).toBe(220);
    expect(aggregated.failed).toBe(30);
    expect(aggregated.replies).toBe(100);
    expect(aggregated.linksShared).toBe(60);
    expect(aggregated.paymentsReceived).toBe(35);
    expect(aggregated.amountReceived).toBe(50000);

    const replyRate = aggregated.messagesSent > 0 ? (aggregated.replies / aggregated.messagesSent) * 100 : 0;
    const conversionRate = aggregated.linksShared > 0 ? (aggregated.paymentsReceived / aggregated.linksShared) * 100 : 0;

    expect(Number(replyRate.toFixed(2))).toBe(33.33);
    expect(Number(conversionRate.toFixed(2))).toBe(58.33);
  });

  it('should handle zero divisions safely without NaN', () => {
    const messagesSent = 0;
    const replies = 0;
    const linksShared = 0;
    const paymentsReceived = 0;

    const replyRate = messagesSent > 0 ? (replies / messagesSent) * 100 : 0;
    const conversionRate = linksShared > 0 ? (paymentsReceived / linksShared) * 100 : 0;

    expect(replyRate).toBe(0);
    expect(conversionRate).toBe(0);
    expect(isNaN(replyRate)).toBe(false);
    expect(isNaN(conversionRate)).toBe(false);
  });
});
