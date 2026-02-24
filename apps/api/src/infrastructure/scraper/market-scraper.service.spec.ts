import { Test, TestingModule } from '@nestjs/testing';
import { MarketScraperService } from './market-scraper.service';
import { chromium } from 'playwright'; // Import real playwright object to mock
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock playwright
vi.mock('playwright', () => {
  return {
    chromium: {
      launch: vi.fn(),
    },
  };
});

describe('MarketScraperService', () => {
  let service: MarketScraperService;
  let mockBrowser: any;
  let mockPage: any;

  beforeEach(async () => {
    vi.clearAllMocks();

    mockPage = {
      goto: vi.fn(),
      content: vi.fn().mockResolvedValue('<html><body><h1>Market News</h1><p>Stocks go up</p></body></html>'),
      close: vi.fn(),
    };

    mockBrowser = {
      newPage: vi.fn().mockResolvedValue(mockPage),
      close: vi.fn(),
    };

    // Explicitly define types or allow any in test mock setup to avoid strict TS issues
    // Since we are mocking the module, we need to access the mock function.
    const mockedChromium = vi.mocked(chromium);
    // In the mock factory, chromium.launch is a vi.fn().
    // We can cast to any here because it's test setup for a mock implementation.
    (mockedChromium.launch as any).mockResolvedValue(mockBrowser);

    const module: TestingModule = await Test.createTestingModule({
      providers: [MarketScraperService],
    }).compile();

    service = module.get<MarketScraperService>(MarketScraperService);
  });

  it('should scrape market data from a given url', async () => {
    const url = 'https://example.com/finance';
    const data = await service.scrape(url);

    expect(chromium.launch).toHaveBeenCalled();
    expect(mockBrowser.newPage).toHaveBeenCalled();
    expect(mockPage.goto).toHaveBeenCalledWith(url);
    expect(mockPage.content).toHaveBeenCalled();
    expect(data).toContain('Stocks go up');
    expect(mockBrowser.close).toHaveBeenCalled();
  });

  it('should handle errors gracefully', async () => {
     (chromium.launch as any).mockRejectedValue(new Error('Browser failed'));
     await expect(service.scrape('url')).rejects.toThrow('Browser failed');
  });
});
