import { Global, Injectable, Logger, Module, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createClient, RedisClientType } from "redis";

@Global()
@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(RedisService.name);
    private client: RedisClientType | null = null;
    private readonly isConfigured: boolean;

    constructor(configService: ConfigService) {
        const url = configService.get("REDIS_URL");
        this.isConfigured = !!url;

        if (!this.isConfigured) {
            this.logger.warn("Redis is not configured. Set REDIS_URL");
            return;
        }

        this.client = createClient({ url });
        this.client.on("error", (error) => this.logger.error("Redis client error", error));
    }

    async onModuleInit(): Promise<void> {
        if (!this.client || this.client.isOpen) return;

        try {
            await this.client.connect();
            this.logger.log("Redis connected");
        } catch (error) {
            this.logger.error("Redis connection failed. Continuing without cache.", error);
            this.client = null;
        }
    }

    async onModuleDestroy(): Promise<void> {
        if (!this.client || !this.client.isOpen) return;
        await this.client.destroy();
        this.logger.log("Redis disconnected");
    }

    async get(key: string): Promise<string | null> {
        if (!this.client) return null;

        try {
            return await this.client.get(key);
        } catch (error) {
            this.logger.warn(`Redis GET failed for key: ${key}`);
            this.logger.debug(String(error));
            return null;
        }
    }

    async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
        if (!this.client) return;

        try {
            if (ttlSeconds && ttlSeconds > 0) {
                await this.client.set(key, value, { EX: ttlSeconds });
                return;
            }

            await this.client.set(key, value);
        } catch (error) {
            this.logger.warn(`Redis SET failed for key: ${key}`);
            this.logger.debug(String(error));
        }
    }

    async del(key: string): Promise<number> {
        if (!this.client) return 0;

        try {
            return await this.client.del(key);
        } catch (error) {
            this.logger.warn(`Redis DEL failed for key: ${key}`);
            this.logger.debug(String(error));
            return 0;
        }
    }

    async delByPrefix(prefix: string): Promise<number> {
        if (!this.client) return 0;

        try {
            const keys: string[] = [];
            for await (const key of this.client.scanIterator({ MATCH: `${prefix}*`, COUNT: 100 })) {
                if (Array.isArray(key)) keys.push(...key);
                else keys.push(key);
            }

            if (keys.length === 0) return 0;
            return await this.client.del(keys);
        } catch (error) {
            this.logger.warn(`Redis DEL by prefix failed for prefix: ${prefix}`);
            this.logger.debug(String(error));
            return 0;
        }
    }

    async getJson<T>(key: string): Promise<T | null> {
        const value = await this.get(key);
        if (!value) return null;

        try {
            this.logger.debug(`Getting Redis key: ${key}`);
            return JSON.parse(value) as T;
        } catch (error) {
            this.logger.warn(`Redis JSON parse failed for key: ${key}`);
            this.logger.debug(String(error));
            return null;
        }
    }

    async setJson(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
        this.logger.debug(`Setting Redis key: ${key} with TTL: ${ttlSeconds}s`);
        await this.set(key, JSON.stringify(value), ttlSeconds);
    }

    isReady(): boolean {
        return !!this.client;
    }
}

@Global()
@Module({
    providers: [RedisService],
    exports: [RedisService],
})
export class RedisModule {}
