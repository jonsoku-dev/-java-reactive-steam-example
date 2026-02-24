from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        print("Navigating to dashboard...")
        page.goto("http://localhost:5173/dashboard")

        print("Waiting for dashboard title...")
        page.wait_for_selector("h1:has-text('Auto-Trading Analyst Dashboard')")

        print("Taking screenshot...")
        page.screenshot(path="dashboard_verification.png")
        print("Screenshot saved to dashboard_verification.png")

    except Exception as e:
        print(f"Error: {e}")
        # Take error screenshot if possible
        try:
            page.screenshot(path="error_verification.png")
        except:
            pass
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
