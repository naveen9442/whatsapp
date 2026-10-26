export declare enum IngestEventType {
    MESSAGE_SENT = "message_sent",
    REPLY_RECEIVED = "reply_received",
    PAYMENT_LINK_SHARED = "payment_link_shared",
    PAYMENT_RECEIVED = "payment_received"
}
export declare class IngestEventDto {
    type: 'message_sent' | 'reply_received' | 'payment_link_shared' | 'payment_received';
    contact?: string;
    agent?: string;
    timestamp?: string;
    amount?: number;
    currency?: string;
    reference?: string;
    metadata?: Record<string, any>;
}
