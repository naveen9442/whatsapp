import { Response } from 'express';
export declare class HealthController {
    getHealth(): {
        status: string;
        timestamp: string;
        uptime: number;
        version: string;
    };
    getMetrics(res: Response): Promise<Response<any, Record<string, any>>>;
}
