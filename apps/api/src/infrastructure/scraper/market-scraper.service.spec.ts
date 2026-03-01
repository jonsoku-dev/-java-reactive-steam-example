import { Test, type TestingModule } from "@nestjs/testing";
import Redis from "ioredis";
import { type Browser, chromium, Page } from "playwright"; // Import real playwright object to mock
import { beforeEach, describe, expect, it, vi } from "vitest";
import { REDIS_CLIENT } from "../cache/cache.module";
import { MarketScraperService } from "./market-scraper.service";

// Mock playwright
vi.mock("playwright", () => {
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

describe("MarketScraperService", () => {
  let service: MarketScraperService;
  let mockBrowser: MockBrowser;
  let mockPage: MockPage;
  let mockRedis: {
    get: ReturnType<typeof vi.fn>;
    setex: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    mockRedis = {
      get: vi.fn().mockResolvedValue(null),
      setex: vi.fn().mockResolvedValue("OK"),
    };

    mockPage = {
      goto: vi.fn(),
      content: vi
        .fn()
        .mockResolvedValue(
          "<html><body><h1>Market News</h1><p>Stocks go up</p></body></html>",
        ),
      close: vi.fn(),
    };

    mockBrowser = {
      newContext: vi.fn().mockResolvedValue({
        newPage: vi.fn().mockResolvedValue(mockPage),
      }),
      close: vi.fn().mockResolvedValue(undefined),
    } as any;

    // Explicitly define types or allow any in test mock setup to avoid strict TS issues
    // Since we are mocking the module, we need to access the mock function.
    const mockedChromium = vi.mocked(chromium);
    // Use type assertion to unknown first if needed, but here we can assert it matches the mock implementation
    // Or just rely on mockedChromium.launch being a mock
    mockedChromium.launch.mockResolvedValue(mockBrowser as unknown as Browser);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MarketScraperService,
        { provide: REDIS_CLIENT, useValue: mockRedis },
      ],
    }).compile();

    service = module.get<MarketScraperService>(MarketScraperService);
  });

  it("should return cached data if available in Redis", async () => {
    const url = "https://example.com/finance";
    const cachedData = "<html><body><h1>Cached News</h1></body></html>";
    mockRedis.get.mockResolvedValue(cachedData);

    const data = await service.scrape(url);

    expect(mockRedis.get).toHaveBeenCalledWith(`scrape:${url}`);
    expect(chromium.launch).not.toHaveBeenCalled();
    expect(data).toBe(cachedData);
  });

  it("should scrape market data, cache it, and return if not in cache", async () => {
    const url = "https://example.com/finance";
    const data = await service.scrape(url);

    expect(mockRedis.get).toHaveBeenCalledWith(`scrape:${url}`);
    expect(chromium.launch).toHaveBeenCalled();
    expect((mockBrowser as any).newContext).toHaveBeenCalled();
    expect(mockPage.goto).toHaveBeenCalledWith(url, expect.anything());
    expect(mockPage.content).toHaveBeenCalled();
    expect(mockRedis.setex).toHaveBeenCalledWith(
      `scrape:${url}`,
      3600,
      expect.stringContaining("Stocks go up"),
    );
    expect(data).toContain("Stocks go up");
    expect(mockBrowser.close).toHaveBeenCalled();
  });

  it("should handle errors gracefully", async () => {
    const mockedChromium = vi.mocked(chromium);
    mockedChromium.launch.mockRejectedValue(new Error("Browser failed"));
    await expect(service.scrape("url")).rejects.toThrow("Browser failed");
  });
});
