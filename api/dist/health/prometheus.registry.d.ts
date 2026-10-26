import * as client from 'prom-client';
export declare const prometheusRegistry: client.Registry<"text/plain; version=0.0.4; charset=utf-8">;
export declare const messagesSentCounter: client.Counter<"tenantId" | "agentId">;
export declare const repliesCounter: client.Counter<"tenantId" | "agentId">;
export declare const paymentsReceivedCounter: client.Counter<"tenantId" | "currency">;
export declare const httpRequestsCounter: client.Counter<"method" | "route" | "status_code">;
