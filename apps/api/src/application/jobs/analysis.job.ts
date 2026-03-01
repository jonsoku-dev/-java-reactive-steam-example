import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AgentService } from '../../domain/ai/agent.service';
import { MarketScraperService } from '../../infrastructure/scraper/market-scraper.service';

@Injectable()
export class AnalysisJob {
  private readonly logger = new Logger(AnalysisJob.name);

  // Example URLs for macro financial data
  private readonly TARGET_URLS = [
    'https://www.reuters.com/markets/macroeconomics/',
    // Add more URLs as needed
  ];

  constructor(
    private readonly agentService: AgentService,
    private readonly scraperService: MarketScraperService,
  ) {}

  // Run daily at midnight (or after market close, e.g., 5 PM EST)
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyAnalysis() {
    this.logger.log('Starting scheduled daily AI analysis...');

    try {
      let combinedMarketData = '';

      for (const url of this.TARGET_URLS) {
        this.logger.log(`Scraping data from: ${url}`);
        const content = await this.scraperService.scrape(url);
        // In a real scenario, we might want to pre-process or summarize this
        // to avoid exceeding LLM context windows.
        // For now, we take a substring to represent summarizing.
        combinedMarketData += content.substring(0, 2000) + '\\n\\n';
      }

      this.logger.log('Data aggregated. Triggering Agent Workflow...');
      await this.agentService.runAnalysis(combinedMarketData);

      this.logger.log('Scheduled daily analysis completed successfully.');
    } catch (error) {
      this.logger.error('Failed to complete scheduled analysis', error);
    }
  }
}
