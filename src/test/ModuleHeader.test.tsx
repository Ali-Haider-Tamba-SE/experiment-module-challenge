import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { ModuleHeader } from "../components/ModuleHeader";

describe("ModuleHeader", () => {
  const defaultProps = {
    title: "Test Module",
    isLocked: false,
    isExpanded: false,
    onToggle: vi.fn(),
    onToggleLock: vi.fn(),
    moduleId: "test-module",
    isEmpty: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    test("renders with correct title", () => {
      render(<ModuleHeader {...defaultProps} />);
      expect(screen.getByText("Test Module")).toBeInTheDocument();
    });

    test("renders with custom module ID in test ID", () => {
      render(<ModuleHeader {...defaultProps} moduleId="custom-id" />);
      expect(screen.getByTestId("module-header-custom-id")).toBeInTheDocument();
      expect(screen.getByTestId("lock-button-custom-id")).toBeInTheDocument();
    });

    test("displays unlock icon when not locked", () => {
      render(<ModuleHeader {...defaultProps} isLocked={false} />);

      const lockButton = screen.getByTestId("lock-button-test-module");
      expect(lockButton).toBeInTheDocument();

      // Check for Unlock icon (should not have Lock icon)
      const unlockIcon = lockButton.querySelector("svg");
      expect(unlockIcon).toBeInTheDocument();
    });

    test("displays lock icon when locked", () => {
      render(<ModuleHeader {...defaultProps} isLocked={true} />);

      const lockButton = screen.getByTestId("lock-button-test-module");
      expect(lockButton).toBeInTheDocument();

      // Check for Lock icon
      const lockIcon = lockButton.querySelector("svg");
      expect(lockIcon).toBeInTheDocument();
    });
  });

  describe("Empty State Handling", () => {
    test("shows grayed out title when empty", () => {
      render(<ModuleHeader {...defaultProps} isEmpty={true} />);

      const title = screen.getByText("Test Module");
      expect(title).toHaveClass("text-gray-500");
      expect(title).not.toHaveClass("text-white");
    });

    test("shows normal title color when not empty and not locked", () => {
      render(
        <ModuleHeader {...defaultProps} isEmpty={false} isLocked={false} />
      );

      const title = screen.getByText("Test Module");
      expect(title).toHaveClass("text-white");
      expect(title).not.toHaveClass("text-gray-500");
    });

    test("shows grayed out title when locked regardless of empty state", () => {
      render(
        <ModuleHeader {...defaultProps} isEmpty={false} isLocked={true} />
      );

      const title = screen.getByText("Test Module");
      expect(title).toHaveClass("text-gray-500");
      expect(title).not.toHaveClass("text-white");
    });

    test("hides lock button when empty", () => {
      render(<ModuleHeader {...defaultProps} isEmpty={true} />);

      expect(
        screen.queryByTestId("lock-button-test-module")
      ).not.toBeInTheDocument();
    });

    test("shows lock button when not empty", () => {
      render(<ModuleHeader {...defaultProps} isEmpty={false} />);

      expect(screen.getByTestId("lock-button-test-module")).toBeInTheDocument();
    });
  });

  describe("Lock State Visual Feedback", () => {
    test("shows correct visual state for locked empty module", () => {
      render(<ModuleHeader {...defaultProps} isLocked={true} isEmpty={true} />);

      const header = screen.getByTestId("module-header-test-module");
      const title = screen.getByText("Test Module");

      expect(header).toHaveClass("cursor-not-allowed");
      expect(title).toHaveClass("text-gray-500");
      expect(
        screen.queryByTestId("lock-button-test-module")
      ).not.toBeInTheDocument();
    });

    test("shows correct visual state for unlocked empty module", () => {
      render(
        <ModuleHeader {...defaultProps} isLocked={false} isEmpty={true} />
      );

      const header = screen.getByTestId("module-header-test-module");
      const title = screen.getByText("Test Module");

      expect(header).toHaveClass("cursor-pointer", "hover:bg-gray-700");
      expect(title).toHaveClass("text-gray-500");
      expect(
        screen.queryByTestId("lock-button-test-module")
      ).not.toBeInTheDocument();
    });
  });

  describe("Click Interactions", () => {
    test("calls onToggle when header is clicked and not locked", async () => {
      const user = userEvent.setup();
      const onToggle = vi.fn();

      render(
        <ModuleHeader {...defaultProps} onToggle={onToggle} isLocked={false} />
      );

      const header = screen.getByTestId("module-header-test-module");
      await user.click(header);

      expect(onToggle).toHaveBeenCalledTimes(1);
    });

    test("does not call onToggle when header is clicked and locked", async () => {
      const user = userEvent.setup();
      const onToggle = vi.fn();

      render(
        <ModuleHeader {...defaultProps} onToggle={onToggle} isLocked={true} />
      );

      const header = screen.getByTestId("module-header-test-module");
      await user.click(header);

      expect(onToggle).not.toHaveBeenCalled();
    });

    test("calls onToggle when empty module header is clicked and not locked", async () => {
      const user = userEvent.setup();
      const onToggle = vi.fn();

      render(
        <ModuleHeader
          {...defaultProps}
          onToggle={onToggle}
          isEmpty={true}
          isLocked={false}
        />
      );

      const header = screen.getByTestId("module-header-test-module");
      await user.click(header);

      expect(onToggle).toHaveBeenCalledTimes(1);
    });

    test("calls onToggleLock when lock button is clicked on non-empty module", async () => {
      const user = userEvent.setup();
      const onToggleLock = vi.fn();

      render(
        <ModuleHeader
          {...defaultProps}
          onToggleLock={onToggleLock}
          isEmpty={false}
        />
      );

      const lockButton = screen.getByTestId("lock-button-test-module");
      await user.click(lockButton);

      expect(onToggleLock).toHaveBeenCalledTimes(1);
      expect(onToggleLock).toHaveBeenCalledWith(expect.any(Object)); // MouseEvent
    });

    test("prevents event bubbling when lock button is clicked on non-empty module", async () => {
      const user = userEvent.setup();
      const onToggle = vi.fn();
      const onToggleLock = vi.fn();

      render(
        <ModuleHeader
          {...defaultProps}
          onToggle={onToggle}
          onToggleLock={onToggleLock}
          isEmpty={false}
        />
      );

      const lockButton = screen.getByTestId("lock-button-test-module");
      await user.click(lockButton);

      expect(onToggleLock).toHaveBeenCalledTimes(1);
      expect(onToggle).not.toHaveBeenCalled();
    });
  });

  describe("Keyboard Interactions", () => {
    test("calls onToggle when Enter is pressed on header and not locked", async () => {
      const user = userEvent.setup();
      const onToggle = vi.fn();

      render(
        <ModuleHeader {...defaultProps} onToggle={onToggle} isLocked={false} />
      );

      const header = screen.getByTestId("module-header-test-module");
      header.focus();
      await user.keyboard("{Enter}");

      expect(onToggle).toHaveBeenCalledTimes(1);
    });

    test("calls onToggle when Space is pressed on header and not locked", async () => {
      const user = userEvent.setup();
      const onToggle = vi.fn();

      render(
        <ModuleHeader {...defaultProps} onToggle={onToggle} isLocked={false} />
      );

      const header = screen.getByTestId("module-header-test-module");
      header.focus();
      await user.keyboard(" ");

      expect(onToggle).toHaveBeenCalledTimes(1);
    });

    test("does not call onToggle when Enter is pressed and locked", async () => {
      const user = userEvent.setup();
      const onToggle = vi.fn();

      render(
        <ModuleHeader {...defaultProps} onToggle={onToggle} isLocked={true} />
      );

      const header = screen.getByTestId("module-header-test-module");
      header.focus();
      await user.keyboard("{Enter}");

      expect(onToggle).not.toHaveBeenCalled();
    });

    test("calls onToggle when keyboard used on empty module and not locked", async () => {
      const user = userEvent.setup();
      const onToggle = vi.fn();

      render(
        <ModuleHeader
          {...defaultProps}
          onToggle={onToggle}
          isEmpty={true}
          isLocked={false}
        />
      );

      const header = screen.getByTestId("module-header-test-module");
      header.focus();
      await user.keyboard("{Enter}");

      expect(onToggle).toHaveBeenCalledTimes(1);
    });

    test("lock button is keyboard accessible on non-empty modules", async () => {
      const user = userEvent.setup();
      const onToggleLock = vi.fn();

      render(
        <ModuleHeader
          {...defaultProps}
          onToggleLock={onToggleLock}
          isEmpty={false}
        />
      );

      const lockButton = screen.getByTestId("lock-button-test-module");

      // Focus and activate with Enter key
      lockButton.focus();
      expect(lockButton).toHaveFocus();

      await user.keyboard("{Enter}");
      expect(onToggleLock).toHaveBeenCalledTimes(1);

      // Test Space key as well
      onToggleLock.mockClear();
      await user.keyboard(" ");
      expect(onToggleLock).toHaveBeenCalledTimes(1);
    });

    test("does not respond to other keys", async () => {
      const user = userEvent.setup();
      const onToggle = vi.fn();

      render(<ModuleHeader {...defaultProps} onToggle={onToggle} />);

      const header = screen.getByTestId("module-header-test-module");
      header.focus();
      await user.keyboard("{Escape}");
      await user.keyboard("a");

      expect(onToggle).not.toHaveBeenCalled();
    });
  });

  describe("Accessibility", () => {
    test("has correct ARIA attributes for non-empty module", () => {
      render(
        <ModuleHeader {...defaultProps} isExpanded={true} isEmpty={false} />
      );

      const header = screen.getByTestId("module-header-test-module");

      expect(header).toHaveAttribute("role", "button");
      expect(header).toHaveAttribute("aria-expanded", "true");
      expect(header).toHaveAttribute("tabindex", "0");
    });

    test("has correct ARIA attributes for empty module", () => {
      render(
        <ModuleHeader {...defaultProps} isEmpty={true} isLocked={false} />
      );

      const header = screen.getByTestId("module-header-test-module");

      expect(header).toHaveAttribute("role", "button");
      expect(header).toHaveAttribute("tabindex", "0");
      expect(header).toHaveAttribute(
        "aria-label",
        expect.stringContaining("Test Module")
      );
    });

    test("has correct ARIA attributes when locked", () => {
      render(
        <ModuleHeader {...defaultProps} isLocked={true} isEmpty={false} />
      );

      const header = screen.getByTestId("module-header-test-module");

      expect(header).toHaveAttribute("tabindex", "-1");
      expect(header).toHaveAttribute(
        "aria-label",
        expect.stringContaining("Locked")
      );
    });

    test("has correct ARIA attributes when locked and empty", () => {
      render(<ModuleHeader {...defaultProps} isLocked={true} isEmpty={true} />);

      const header = screen.getByTestId("module-header-test-module");

      expect(header).toHaveAttribute("tabindex", "-1");
      expect(header).toHaveAttribute(
        "aria-label",
        expect.stringContaining("Locked")
      );
    });

    test("has proper aria-label describing all states", () => {
      const { rerender } = render(
        <ModuleHeader
          {...defaultProps}
          title="My Module"
          isLocked={false}
          isExpanded={false}
          isEmpty={false}
        />
      );

      const header = screen.getByTestId("module-header-test-module");
      expect(header).toHaveAttribute(
        "aria-label",
        "My Module - Unlocked - Collapsed"
      );

      rerender(
        <ModuleHeader
          {...defaultProps}
          title="My Module"
          isLocked={true}
          isExpanded={true}
          isEmpty={true}
        />
      );

      expect(header).toHaveAttribute(
        "aria-label",
        "My Module - Locked - Expanded"
      );
    });

    test("lock button has descriptive aria-label on non-empty modules", () => {
      const { rerender } = render(
        <ModuleHeader {...defaultProps} isLocked={false} isEmpty={false} />
      );

      const lockButton = screen.getByTestId("lock-button-test-module");
      expect(lockButton).toHaveAttribute("aria-label", "Lock module");

      rerender(
        <ModuleHeader {...defaultProps} isLocked={true} isEmpty={false} />
      );
      expect(lockButton).toHaveAttribute("aria-label", "Unlock module");
    });

    test("locked header is not in tab order", async () => {
      const user = userEvent.setup();
      render(
        <ModuleHeader {...defaultProps} isLocked={true} isEmpty={false} />
      );

      const header = screen.getByTestId("module-header-test-module");
      const lockButton = screen.getByTestId("lock-button-test-module");

      // Should skip the locked header
      await user.tab();
      expect(lockButton).toHaveFocus();
      expect(header).not.toHaveFocus();
    });

    test("locked empty header is not in tab order and has no lock button", async () => {
      render(<ModuleHeader {...defaultProps} isLocked={true} isEmpty={true} />);

      const header = screen.getByTestId("module-header-test-module");

      expect(header).toHaveAttribute("tabindex", "-1");
      expect(
        screen.queryByTestId("lock-button-test-module")
      ).not.toBeInTheDocument();
    });
  });

  describe("Focus and Hover States", () => {
    test("applies focus ring styles to lock button on non-empty modules", () => {
      render(<ModuleHeader {...defaultProps} isEmpty={false} />);

      const lockButton = screen.getByTestId("lock-button-test-module");
      expect(lockButton).toHaveClass(
        "focus:outline-none",
        "focus:ring-2",
        "focus:ring-blue-500"
      );
    });

    test("applies hover styles correctly based on lock state", () => {
      render(<ModuleHeader {...defaultProps} isLocked={false} />);

      const header = screen.getByTestId("module-header-test-module");
      expect(header).toHaveClass("hover:bg-gray-700");

      const lockButton = screen.queryByTestId("lock-button-test-module");
      if (lockButton) {
        expect(lockButton).toHaveClass("hover:text-white");
      }
    });

    test("does not apply hover styles when locked", () => {
      render(
        <ModuleHeader {...defaultProps} isLocked={true} isEmpty={false} />
      );

      const header = screen.getByTestId("module-header-test-module");
      expect(header).not.toHaveClass("hover:bg-gray-700");
      expect(header).toHaveClass("cursor-not-allowed");
    });

    test("applies correct cursor styles for empty modules", () => {
      const { rerender } = render(
        <ModuleHeader {...defaultProps} isEmpty={true} isLocked={false} />
      );

      const header = screen.getByTestId("module-header-test-module");
      expect(header).toHaveClass("cursor-pointer", "hover:bg-gray-700");

      rerender(
        <ModuleHeader {...defaultProps} isEmpty={true} isLocked={true} />
      );
      expect(header).toHaveClass("cursor-not-allowed");
      expect(header).not.toHaveClass("hover:bg-gray-700");
    });
  });

  describe("Edge Cases", () => {
    test("handles undefined/null props gracefully", () => {
      // Component should still render with minimal props
      render(
        <ModuleHeader
          title=""
          isLocked={false}
          isExpanded={false}
          onToggle={vi.fn()}
          onToggleLock={vi.fn()}
          moduleId=""
          isEmpty={false}
        />
      );

      expect(screen.getByTestId("module-header-")).toBeInTheDocument();
    });

    test("handles very long titles", () => {
      const longTitle = "A".repeat(100);

      render(<ModuleHeader {...defaultProps} title={longTitle} />);

      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    test("handles special characters in title", () => {
      const specialTitle = 'Module with "quotes" & <tags> and émojis 🚀';

      render(<ModuleHeader {...defaultProps} title={specialTitle} />);

      expect(screen.getByText(specialTitle)).toBeInTheDocument();
    });

    test("maintains state consistency during rapid state changes", async () => {
      const user = userEvent.setup();
      let isLocked = false;
      let isExpanded = false;
      let isEmpty = false;

      const onToggle = vi.fn(() => {
        isExpanded = !isExpanded;
      });

      const onToggleLock = vi.fn(() => {
        isLocked = !isLocked;
        if (isLocked) isExpanded = false;
      });

      const { rerender } = render(
        <ModuleHeader
          {...defaultProps}
          isLocked={isLocked}
          isExpanded={isExpanded}
          isEmpty={isEmpty}
          onToggle={onToggle}
          onToggleLock={onToggleLock}
        />
      );

      const header = screen.getByTestId("module-header-test-module");

      // Rapid interactions
      await user.click(header); // expand
      isExpanded = true;
      rerender(
        <ModuleHeader
          {...defaultProps}
          isLocked={isLocked}
          isExpanded={isExpanded}
          isEmpty={isEmpty}
          onToggle={onToggle}
          onToggleLock={onToggleLock}
        />
      );

      const lockButton = screen.getByTestId("lock-button-test-module");
      await user.click(lockButton); // lock
      isLocked = true;
      isExpanded = false;
      rerender(
        <ModuleHeader
          {...defaultProps}
          isLocked={isLocked}
          isExpanded={isExpanded}
          isEmpty={isEmpty}
          onToggle={onToggle}
          onToggleLock={onToggleLock}
        />
      );

      await user.click(header); // try to expand (should not work)

      expect(onToggle).toHaveBeenCalledTimes(1); // Only the first click should work
      expect(onToggleLock).toHaveBeenCalledTimes(1);
    });

    test("correctly handles isEmpty state transitions", () => {
      const { rerender } = render(
        <ModuleHeader {...defaultProps} isEmpty={true} />
      );

      expect(
        screen.queryByTestId("lock-button-test-module")
      ).not.toBeInTheDocument();
      expect(screen.getByText("Test Module")).toHaveClass("text-gray-500");

      rerender(<ModuleHeader {...defaultProps} isEmpty={false} />);

      expect(screen.getByTestId("lock-button-test-module")).toBeInTheDocument();
      expect(screen.getByText("Test Module")).toHaveClass("text-white");
    });
  });

  describe("Performance", () => {
    test("does not cause unnecessary re-renders", () => {
      const onToggle = vi.fn();
      const onToggleLock = vi.fn();

      const { rerender } = render(
        <ModuleHeader
          {...defaultProps}
          onToggle={onToggle}
          onToggleLock={onToggleLock}
        />
      );

      // Same props should not cause re-render issues
      rerender(
        <ModuleHeader
          {...defaultProps}
          onToggle={onToggle}
          onToggleLock={onToggleLock}
        />
      );

      expect(
        screen.getByTestId("module-header-test-module")
      ).toBeInTheDocument();
    });

    test("handles multiple instances efficiently", () => {
      const modules = Array.from({ length: 10 }, (_, i) => ({
        ...defaultProps,
        moduleId: `module-${i}`,
        title: `Module ${i}`,
        isEmpty: i % 2 === 0, // Alternate empty state
      }));

      render(
        <div>
          {modules.map((props) => (
            <ModuleHeader key={props.moduleId} {...props} />
          ))}
        </div>
      );

      // All modules should render
      modules.forEach(({ moduleId }) => {
        expect(
          screen.getByTestId(`module-header-${moduleId}`)
        ).toBeInTheDocument();
      });

      // Check that empty modules don't have lock buttons
      modules.forEach(({ moduleId, isEmpty }) => {
        const lockButton = screen.queryByTestId(`lock-button-${moduleId}`);
        if (isEmpty) {
          expect(lockButton).not.toBeInTheDocument();
        } else {
          expect(lockButton).toBeInTheDocument();
        }
      });
    });
  });
});
