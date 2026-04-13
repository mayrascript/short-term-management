import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./button";

describe("Button", () => {
  it("renders children inside a button element by default", () => {
    render(<Button>Save</Button>);
    const btn = screen.getByRole("button", { name: /save/i });
    expect(btn).toBeInTheDocument();
    expect(btn.tagName).toBe("BUTTON");
    expect(btn).toHaveAttribute("data-variant", "default");
    expect(btn).toHaveAttribute("data-size", "default");
  });

  it("forwards variant and size to data attributes", () => {
    render(
      <Button variant="destructive" size="lg">
        Delete
      </Button>
    );
    const btn = screen.getByRole("button", { name: /delete/i });
    expect(btn).toHaveAttribute("data-variant", "destructive");
    expect(btn).toHaveAttribute("data-size", "lg");
  });

  it("invokes onClick handlers", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Ping</Button>);
    await userEvent.click(screen.getByRole("button", { name: /ping/i }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("does not fire onClick when disabled", async () => {
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} disabled>
        Nope
      </Button>
    );
    await userEvent.click(screen.getByRole("button", { name: /nope/i }));
    expect(onClick).not.toHaveBeenCalled();
  });
});
