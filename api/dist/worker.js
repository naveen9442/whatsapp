"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const worker_module_1 = require("./worker/worker.module");
async function bootstrap() {
    const app = await core_1.NestFactory.createApplicationContext(worker_module_1.WorkerModule);
    console.log('Worker started');
    const shutdown = async () => {
        console.log('Worker shutting down...');
        await app.close();
        process.exit(0);
    };
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
}
bootstrap();
//# sourceMappingURL=worker.js.map