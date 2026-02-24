import { Test, TestingModule } from '@nestjs/testing';
import { MarketScraperService } from './market-scraper.service';
import { chromium, Browser, Page } from 'playwright'; // Import real playwright object to mock
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock playwright
vi.mock('playwright', () => {
  return {
    chromium: {
      launch: vi.fn(),
    },
  };
});

// Define interfaces for mocks to avoid 'any'
interface MockPage {
  goto: ReturnType<typeof vi.fn>;
  content: ReturnType<typeof vi.fn>;
  close: ReturnType<typeof vi.fn>;
}

interface MockBrowser {
  newPage: ReturnType<typeof vi.fn>;
  close: ReturnType<typeof vi.fn>;
}

describe('MarketScraperService', () => {
  let service: MarketScraperService;
  let mockBrowser: MockBrowser;
  let mockPage: MockPage;

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
    // Use type assertion to unknown first if needed, but here we can assert it matches the mock implementation
    // Or just rely on mockedChromium.launch being a mock
    mockedChromium.launch.mockResolvedValue(mockBrowser as unknown as Browser);

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
     const mockedChromium = vi.mocked(chromium);
     mockedChromium.launch.mockRejectedValue(new Error('Browser failed'));
     await expect(service.scrape('url')).rejects.toThrow('Browser failed');
  });
});
