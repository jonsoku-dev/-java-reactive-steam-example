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

  async scrape(url: string): Promise<string> {
    const cacheKey = `scrape:${url}`;

    try {
      // Check cache first
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

    try {
      browser = await chromium.launch({ headless: true });
      const page = await browser.newPage();
      await page.goto(url);

      // Basic extraction - in real scenario this would be more complex
      const content = await page.content();

      this.logger.log(`Successfully scraped data from ${url}`);

      try {
        // Cache the result for 1 hour (3600 seconds)
        await this.redis.setex(cacheKey, 3600, content);
      } catch (err) {
        this.logger.warn(`Redis setex failed for ${cacheKey}`, err);
      }

      return content;
    } catch (error) {
      this.logger.error(`Failed to scrape ${url}`, error);
      throw error;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
}
