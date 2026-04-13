import { test, expect } from "@playwright/test";

test("dashboard shell loads and the sidebar exposes primary nav", async ({
  page,
}) => {
  await page.goto("/");

  // The DashboardShell brand mark:
  await expect(page.getByText(/MySTR/i)).toBeVisible();

  // Navigation links rendered by src/components/dashboard-shell.tsx:
  for (const label of ["Dashboard", "Social", "Finance", "Tasks"]) {
    await expect(page.getByRole("link", { name: new RegExp(label, "i") })).toBeVisible();
  }
});
