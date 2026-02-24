from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        print("Navigating to dashboard...")
        page.goto("http://localhost:5173/dashboard")

        print("Waiting for input area...")
        page.wait_for_selector("textarea")

        print("Inputting market data...")
        page.fill("textarea", "Positive jobs report indicates strong growth.")

        print("Clicking Run Analysis button...")
        page.click("button:has-text('Run Analysis Agent')")

        # Note: Since we don't have a real backend running to respond, this will likely fail or hang if we wait for results.
        # However, we can verify the loading state or the UI structure.
        # For this verification, we just want to ensure the UI updated with new components.

        print("Taking screenshot of initial UI...")
        page.screenshot(path="dashboard_ui_verification.png")
        print("Screenshot saved to dashboard_ui_verification.png")

    except Exception as e:
        print(f"Error: {e}")
        try:
            page.screenshot(path="error_verification.png")
        except:
            pass
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
