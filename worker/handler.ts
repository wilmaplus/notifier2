import { v4 as uuid } from 'uuid';
import { Worker } from 'worker_threads';
export class Handler {
    workers: Map<string, Worker> = new Map<string, Worker>()

    constructor() {
    }

    startNewWorker(worker: Worker, id:string=uuid()): string {
        this.workers.set(id, worker);
        worker.on('exit', (code) => {
            this.workers.delete(id)
        });
        return id;
    }

    getWorker(id: string): Worker|undefined {
        return this.workers.get(id);
    }

    isWorkerRunning(id: string): boolean {
        return this.workers.has(id);
    }


    stopWorker(id: string): Promise<number>|undefined {
        let worker = this.workers.get(id);
        if (worker !== undefined) {
            return worker.terminate();
        }
        return undefined;
    }

    getRunningHandlerIDs(): string[] {
        return Array.from(this.workers.keys());
    }
}