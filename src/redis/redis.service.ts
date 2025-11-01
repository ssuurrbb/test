// src/redis/redis.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
    private client: Redis;

    constructor() {
        this.client = new Redis({
            host: 'localhost',
            port: 6379,
        });

        this.client.on('connect', () => console.log('Redis connected'));
        this.client.on('error', (err) => console.error('Redis error', err));
    }
    onModuleDestroy() {
        this.client.disconnect();
    }

    getClient(): Redis {
        return this.client;
    }
}
