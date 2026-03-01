import { Injectable, Logger, Inject } from '@nestjs/common';
import { chromium, Browser } from 'playwright';
import { REDIS_CLIENT } from '../cache/cache.module';
import Redis from 'ioredis';

@Injectable()
export class MarketScraperService {
  private readonly logger = new Logger(MarketScraperService.name);

  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: Redis
  ) {}

  async scrape(url: string, retries = 2): Promise<string> {
    const cacheKey = `scrape:${url}`;

    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        this.logger.log(`Cache hit for ${url}`);
        return cached;
      }
    } catch (err) {
      this.logger.warn(`Redis get failed for ${cacheKey}`, err);
    }

    this.logger.log(`Starting scraper for ${url}...`);
    let browser: Browser | null = null;
    let attempt = 0;

    while (attempt <= retries) {
      try {
        // Use a longer timeout for robustness in production (default is often 30s)
        browser = await chromium.launch({ headless: true });
        const context = await browser.newContext();
        const page = await context.newPage();

        // Add timeout to prevent hanging on bad connections
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

        const content = await page.content();

        this.logger.log(`Successfully scraped data from ${url}`);

        try {
          await this.redis.setex(cacheKey, 3600, content);
        } catch (err) {
          this.logger.warn(`Redis setex failed for ${cacheKey}`, err);
        }

        return content;
      } catch (error) {
        attempt++;
        this.logger.warn(`Failed to scrape ${url}, attempt ${attempt}/${retries + 1}`, error);
        if (attempt > retries) {
          this.logger.error(`Exhausted retries scraping ${url}`);
          throw error;
        }
        // Small delay before retry
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } finally {
        if (browser) {
          await browser.close().catch((err) => this.logger.error('Failed to close browser', err));
        }
      }
    }
    throw new Error('Unreachable');
  }
}
