import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ModuleFooter } from "../components/ModuleFooter";
import { vi } from "vitest";

describe("ModuleFooter", () => {
  const mockProps = {
    moduleId: "test-module",
    onLock: vi.fn(),
    onReset: vi.fn(),
    onAddIteration: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders all default actions when enabled", () => {
    render(<ModuleFooter {...mockProps} />);

    expect(
      screen.getByRole("button", { name: /lock module test-module/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /reset module test-module/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: /add iteration to module test-module/i,
      })
    ).toBeInTheDocument();
  });

  test("calls onLock when lock button is clicked", async () => {
    const user = userEvent.setup();
    render(<ModuleFooter {...mockProps} />);

    await user.click(screen.getByRole("button", { name: /lock module/i }));
    expect(mockProps.onLock).toHaveBeenCalledTimes(1);
  });

  test("calls onReset when reset button is clicked", async () => {
    const user = userEvent.setup();
    render(<ModuleFooter {...mockProps} />);

    await user.click(screen.getByRole("button", { name: /reset module/i }));
    expect(mockProps.onReset).toHaveBeenCalledTimes(1);
  });

  test("calls onAddIteration when add iteration button is clicked", async () => {
    const user = userEvent.setup();
    render(<ModuleFooter {...mockProps} />);

    await user.click(screen.getByRole("button", { name: /add iteration/i }));
    expect(mockProps.onAddIteration).toHaveBeenCalledTimes(1);
  });

  test("displays UNLOCK when isLocked is true", () => {
    render(<ModuleFooter {...mockProps} isLocked={true} />);

    expect(
      screen.getByRole("button", { name: /unlock module/i })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /^lock module/i })
    ).not.toBeInTheDocument();
  });

  test("disables add iteration button when locked", () => {
    render(<ModuleFooter {...mockProps} isLocked={true} />);

    const addButton = screen.getByRole("button", { name: /add iteration/i });
    expect(addButton).toBeDisabled();
  });

  test("disables all buttons when loading", () => {
    render(<ModuleFooter {...mockProps} isLoading={true} />);

    const buttons = screen.getAllByRole("button");
    buttons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });

  test("hides actions when show props are false", () => {
    render(
      <ModuleFooter
        {...mockProps}
        showLockAction={false}
        showResetAction={false}
        showAddAction={false}
      />
    );

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  test("renders custom actions", () => {
    const customAction = {
      id: "custom",
      label: "Custom Action",
      onClick: vi.fn(),
    };

    render(<ModuleFooter {...mockProps} customActions={[customAction]} />);

    expect(
      screen.getByRole("button", { name: /custom action/i })
    ).toBeInTheDocument();
  });

  test("handles keyboard navigation with Enter key", async () => {
    const user = userEvent.setup();
    render(<ModuleFooter {...mockProps} />);

    const lockButton = screen.getByRole("button", { name: /lock module/i });
    lockButton.focus();
    await user.keyboard("{Enter}");

    expect(mockProps.onLock).toHaveBeenCalledTimes(1);
  });

  test("handles keyboard navigation with Space key", async () => {
    const user = userEvent.setup();
    render(<ModuleFooter {...mockProps} />);

    const resetButton = screen.getByRole("button", { name: /reset module/i });
    resetButton.focus();
    await user.keyboard(" ");

    expect(mockProps.onReset).toHaveBeenCalledTimes(1);
  });

  test("applies correct variant styling for locked state", () => {
    render(<ModuleFooter {...mockProps} isLocked={true} />);

    const lockButton = screen.getByRole("button", { name: /unlock module/i });
    expect(lockButton).toHaveClass("text-green-400");
  });

  test("renders with correct data-testid", () => {
    render(<ModuleFooter {...mockProps} />);

    expect(screen.getByTestId("module-footer-test-module")).toBeInTheDocument();
    expect(screen.getByTestId("lock-action-test-module")).toBeInTheDocument();
    expect(screen.getByTestId("reset-action-test-module")).toBeInTheDocument();
    expect(screen.getByTestId("add-action-test-module")).toBeInTheDocument();
  });

  test("returns null when no actions are available", () => {
    const { container } = render(
      <ModuleFooter
        moduleId="test"
        showLockAction={false}
        showResetAction={false}
        showAddAction={false}
        customActions={[]}
      />
    );

    expect(container.firstChild).toBeNull();
  });
});
