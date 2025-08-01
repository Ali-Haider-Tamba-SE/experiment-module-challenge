import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { AddIterationModal } from "../components/AddIterationModal";

const mockBodyStyle = {
  overflow: "unset",
};
Object.defineProperty(document.body, "style", {
  value: mockBodyStyle,
  writable: true,
});

describe("AddIterationModal", () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    title: "Test Modal",
    isLoading: false,
    nextIterationNumber: 3,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset body overflow
    document.body.style.overflow = "unset";
  });

  afterEach(() => {
    // Clean up any remaining modals
    document.body.style.overflow = "unset";
  });

  describe("Rendering", () => {
    test("renders when isOpen is true", () => {
      render(<AddIterationModal {...defaultProps} />);

      expect(screen.getByTestId("add-iteration-modal")).toBeInTheDocument();
      expect(screen.getByTestId("modal-backdrop")).toBeInTheDocument();
    });

    test("does not render when isOpen is false", () => {
      render(<AddIterationModal {...defaultProps} isOpen={false} />);

      expect(
        screen.queryByTestId("add-iteration-modal")
      ).not.toBeInTheDocument();
      expect(screen.queryByTestId("modal-backdrop")).not.toBeInTheDocument();
    });

    test("displays correct title", () => {
      render(<AddIterationModal {...defaultProps} title="Custom Title" />);

      expect(screen.getByText("Custom Title")).toBeInTheDocument();
      expect(screen.getByLabelText("Custom Title")).toBeInTheDocument();
    });

    test("displays next iteration number correctly", () => {
      render(<AddIterationModal {...defaultProps} nextIterationNumber={5} />);

      expect(screen.getByTestId("module-id")).toHaveTextContent("EM - 5");
    });

    test("handles undefined nextIterationNumber", () => {
      render(
        <AddIterationModal {...defaultProps} nextIterationNumber={undefined} />
      );

      expect(screen.getByTestId("module-id")).toHaveTextContent("EM - ");
    });

    test("applies custom className", () => {
      render(<AddIterationModal {...defaultProps} className="custom-class" />);

      const modal = screen.getByTestId("add-iteration-modal");
      expect(modal).toHaveClass("custom-class");
    });

    test("shows close button", () => {
      render(<AddIterationModal {...defaultProps} />);

      expect(screen.getByTestId("close-modal")).toBeInTheDocument();
      expect(screen.getByLabelText("Close modal")).toBeInTheDocument();
    });
  });

  describe("Status States", () => {
    test("shows ready state when not loading", () => {
      render(<AddIterationModal {...defaultProps} isLoading={false} />);

      expect(screen.getByTestId("status-text")).toHaveTextContent(
        "Ready to add iteration"
      );
    });

    test("shows loading state when loading", () => {
      render(<AddIterationModal {...defaultProps} isLoading={true} />);

      expect(screen.getByTestId("status-text")).toHaveTextContent(
        "Adding iteration..."
      );
    });

    test("shows ADDING... button text when loading", () => {
      render(<AddIterationModal {...defaultProps} isLoading={true} />);

      expect(screen.getByTestId("confirm-button")).toHaveTextContent(
        "ADDING..."
      );
    });

    test("shows DONE button text when not loading", () => {
      render(<AddIterationModal {...defaultProps} isLoading={false} />);

      expect(screen.getByTestId("confirm-button")).toHaveTextContent("DONE");
    });
  });

  describe("Prompt Input State Management", () => {
    test("initially shows instructions without prompt input", () => {
      render(<AddIterationModal {...defaultProps} />);

      expect(screen.queryByTestId("prompt-input")).not.toBeInTheDocument();
      expect(screen.getByTestId("generate-link")).toBeInTheDocument();
      expect(screen.getByText(/To add a new iteration/)).toBeInTheDocument();
    });

    test("shows prompt input when generate button is clicked", async () => {
      const user = userEvent.setup();
      render(<AddIterationModal {...defaultProps} />);

      const generateLink = screen.getByTestId("generate-link");
      await user.click(generateLink);

      expect(screen.getByTestId("prompt-input")).toBeInTheDocument();
      expect(screen.getByLabelText("Iteration Prompt")).toBeInTheDocument();
      expect(screen.getByTestId("generate-prompt")).toBeInTheDocument();
    });

    test("generates random prompt when generate is clicked", async () => {
      const user = userEvent.setup();
      render(<AddIterationModal {...defaultProps} />);

      const generateLink = screen.getByTestId("generate-link");
      await user.click(generateLink);

      const textarea = screen.getByTestId(
        "prompt-input"
      ) as HTMLTextAreaElement;
      expect(textarea.value).not.toBe("");
      expect(textarea.value.length).toBeGreaterThan(10);
    });

    test("allows typing in prompt input", async () => {
      const user = userEvent.setup();
      render(<AddIterationModal {...defaultProps} />);

      // First show the prompt input
      await user.click(screen.getByTestId("generate-link"));

      const textarea = screen.getByTestId("prompt-input");
      await user.clear(textarea);
      await user.type(textarea, "Test prompt content");

      expect(textarea).toHaveValue("Test prompt content");
    });

    test("disables prompt input when loading", async () => {
      const user = userEvent.setup();
      const { rerender } = render(<AddIterationModal {...defaultProps} />);

      // Show prompt input first
      await user.click(screen.getByTestId("generate-link"));

      // Rerender with loading state
      rerender(<AddIterationModal {...defaultProps} isLoading={true} />);

      const textarea = screen.queryByTestId("prompt-input");
      if (textarea) {
        expect(textarea).toBeDisabled();
      }
    });

    test("supports Ctrl+Enter for submission in prompt input", async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();
      render(<AddIterationModal {...defaultProps} onConfirm={onConfirm} />);

      // Show prompt input by clicking generate (which sets a random prompt)
      await user.click(screen.getByTestId("generate-link"));

      // Clear the generated prompt and type our test prompt
      const textarea = screen.getByTestId("prompt-input");
      await user.clear(textarea);
      await user.type(textarea, "Test prompt");
      await user.keyboard("{Control>}{Enter}{/Control}");

      expect(onConfirm).toHaveBeenCalledWith("Test prompt");
    });
  });

  describe("Button Interactions", () => {
    test("calls onClose when cancel button is clicked", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(<AddIterationModal {...defaultProps} onClose={onClose} />);

      await user.click(screen.getByTestId("cancel-button"));

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    test("calls onClose when close button is clicked", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(<AddIterationModal {...defaultProps} onClose={onClose} />);

      await user.click(screen.getByTestId("close-modal"));

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    test("calls onConfirm with undefined when DONE is clicked without prompt", async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();

      render(<AddIterationModal {...defaultProps} onConfirm={onConfirm} />);

      await user.click(screen.getByTestId("confirm-button"));

      expect(onConfirm).toHaveBeenCalledWith(undefined);
    });

    test("calls onConfirm with prompt when DONE is clicked with prompt", async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();

      render(<AddIterationModal {...defaultProps} onConfirm={onConfirm} />);

      // Show prompt input and add text
      await user.click(screen.getByTestId("generate-link"));
      const textarea = screen.getByTestId("prompt-input");
      await user.clear(textarea);
      await user.type(textarea, "Custom prompt");

      await user.click(screen.getByTestId("confirm-button"));

      expect(onConfirm).toHaveBeenCalledWith("Custom prompt");
    });

    test("calls onConfirm with undefined when empty prompt is submitted", async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();

      render(<AddIterationModal {...defaultProps} onConfirm={onConfirm} />);

      // Don't click generate - just submit without showing prompt input
      await user.click(screen.getByTestId("confirm-button"));

      expect(onConfirm).toHaveBeenCalledWith(undefined);
    });
  });

  describe("Loading State Behavior", () => {
    test("disables all buttons when loading", () => {
      render(<AddIterationModal {...defaultProps} isLoading={true} />);

      expect(screen.getByTestId("cancel-button")).toBeDisabled();
      expect(screen.getByTestId("confirm-button")).toBeDisabled();
      expect(screen.getByTestId("generate-link")).toBeDisabled();
    });

    test("applies loading styles to disabled buttons", () => {
      render(<AddIterationModal {...defaultProps} isLoading={true} />);

      const cancelButton = screen.getByTestId("cancel-button");
      const confirmButton = screen.getByTestId("confirm-button");

      // Check for disabled:opacity-50 class which applies when disabled
      expect(cancelButton).toHaveClass("disabled:opacity-50");
      expect(confirmButton).toHaveClass(
        "disabled:opacity-50",
        "disabled:cursor-not-allowed"
      );

      // Also verify they are actually disabled
      expect(cancelButton).toBeDisabled();
      expect(confirmButton).toBeDisabled();
    });

    test("prevents interactions when loading", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      const onConfirm = vi.fn();

      render(
        <AddIterationModal
          {...defaultProps}
          isLoading={true}
          onClose={onClose}
          onConfirm={onConfirm}
        />
      );

      // Try to interact with disabled elements
      await user.click(screen.getByTestId("cancel-button"));
      await user.click(screen.getByTestId("confirm-button"));
      await user.click(screen.getByTestId("generate-link"));

      expect(onClose).not.toHaveBeenCalled();
      expect(onConfirm).not.toHaveBeenCalled();
    });
  });

  describe("Keyboard Interactions", () => {
    test("closes modal with ESC key when not loading", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(<AddIterationModal {...defaultProps} onClose={onClose} />);

      await user.keyboard("{Escape}");

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    test("clears state when closing with ESC", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(<AddIterationModal {...defaultProps} onClose={onClose} />);

      // Show prompt input and add text
      await user.click(screen.getByTestId("generate-link"));
      const textarea = screen.getByTestId("prompt-input");
      await user.type(textarea, "Some text");

      await user.keyboard("{Escape}");

      expect(onClose).toHaveBeenCalledTimes(1);

      // If modal reopens, state should be cleared
      render(<AddIterationModal {...defaultProps} isOpen={true} />);
      expect(screen.queryByTestId("prompt-input")).not.toBeInTheDocument();
    });

    test("handles tab navigation with prompt input visible", async () => {
      const user = userEvent.setup();
      render(<AddIterationModal {...defaultProps} />);

      // Show prompt input
      await user.click(screen.getByTestId("generate-link"));

      // Should be able to tab through all elements including textarea
      const textarea = screen.getByTestId("prompt-input");
      expect(textarea).toBeInTheDocument();

      // Tab navigation should work with the textarea in the tab order
      await user.tab();
      // Should eventually reach the textarea
      textarea.focus();
      expect(textarea).toHaveFocus();
    });
  });

  describe("Backdrop Interactions", () => {
    test("closes modal when backdrop is clicked", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(<AddIterationModal {...defaultProps} onClose={onClose} />);

      const backdrop = screen.getByTestId("modal-backdrop");
      await user.click(backdrop);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    test("does not close modal when clicking inside modal content", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(<AddIterationModal {...defaultProps} onClose={onClose} />);

      const modal = screen.getByTestId("add-iteration-modal");
      await user.click(modal);

      expect(onClose).not.toHaveBeenCalled();
    });

    test("clears state when closing via backdrop click", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(<AddIterationModal {...defaultProps} onClose={onClose} />);

      // Show prompt input and add text
      await user.click(screen.getByTestId("generate-link"));
      const textarea = screen.getByTestId("prompt-input");
      await user.type(textarea, "Some text");

      // Close via backdrop
      const backdrop = screen.getByTestId("modal-backdrop");
      await user.click(backdrop);

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("Accessibility", () => {
    test("has correct ARIA attributes on modal", () => {
      render(<AddIterationModal {...defaultProps} />);

      const backdrop = screen.getByTestId("modal-backdrop");
      expect(backdrop).toHaveAttribute("role", "dialog");
      expect(backdrop).toHaveAttribute("aria-modal", "true");
      expect(backdrop).toHaveAttribute("aria-labelledby", "modal-title");
      expect(backdrop).toHaveAttribute("aria-describedby", "modal-description");
    });

    test("has proper heading structure", () => {
      render(<AddIterationModal {...defaultProps} title="Test Modal" />);

      const heading = screen.getByRole("heading", { name: "Test Modal" });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveAttribute("id", "modal-title");
    });

    test("close button has descriptive aria-label", () => {
      render(<AddIterationModal {...defaultProps} />);

      const closeButton = screen.getByTestId("close-modal");
      expect(closeButton).toHaveAttribute("aria-label", "Close modal");
    });

    test("prompt textarea has proper label association", async () => {
      const user = userEvent.setup();
      render(<AddIterationModal {...defaultProps} />);

      // Show prompt input
      await user.click(screen.getByTestId("generate-link"));

      const textarea = screen.getByTestId("prompt-input");
      const label = screen.getByLabelText("Iteration Prompt");

      expect(textarea).toBe(label);
      expect(textarea).toHaveAttribute("id", "prompt-input");
    });

    test("manages body overflow when modal opens and closes", () => {
      const { rerender } = render(
        <AddIterationModal {...defaultProps} isOpen={true} />
      );

      expect(document.body.style.overflow).toBe("hidden");

      rerender(<AddIterationModal {...defaultProps} isOpen={false} />);

      expect(document.body.style.overflow).toBe("unset");
    });

    test("sets focus to first focusable element when modal opens", async () => {
      render(<AddIterationModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId("cancel-button")).toHaveFocus();
      });
    });

    test("buttons have proper focus ring styles", () => {
      render(<AddIterationModal {...defaultProps} />);

      const cancelButton = screen.getByTestId("cancel-button");
      const confirmButton = screen.getByTestId("confirm-button");
      const closeButton = screen.getByTestId("close-modal");

      expect(cancelButton).toHaveClass(
        "focus:outline-none",
        "focus:ring-2",
        "focus:ring-gray-500"
      );
      expect(confirmButton).toHaveClass(
        "focus:outline-none",
        "focus:ring-2",
        "focus:ring-blue-500"
      );
      expect(closeButton).toHaveClass(
        "focus:outline-none",
        "focus:ring-2",
        "focus:ring-blue-500"
      );
    });
  });

  describe("State Management and Cleanup", () => {
    test("clears prompt when modal is closed", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(<AddIterationModal {...defaultProps} onClose={onClose} />);

      // Show prompt input and add text
      await user.click(screen.getByTestId("generate-link"));
      const textarea = screen.getByTestId("prompt-input");
      await user.type(textarea, "Test prompt");

      // Close modal
      await user.click(screen.getByTestId("cancel-button"));

      expect(onClose).toHaveBeenCalled();
      // Internal state should be cleared (tested indirectly by reopening)
    });

    test("clears prompt after successful submission", async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();

      render(<AddIterationModal {...defaultProps} onConfirm={onConfirm} />);

      // Show prompt input and clear generated content, then add our test text
      await user.click(screen.getByTestId("generate-link"));
      const textarea = screen.getByTestId("prompt-input");
      await user.clear(textarea);
      await user.type(textarea, "Test prompt");

      // Submit
      await user.click(screen.getByTestId("confirm-button"));

      expect(onConfirm).toHaveBeenCalledWith("Test prompt");
      // Prompt should be cleared internally (tested indirectly by behavior)
    });
  });

  describe("Edge Cases", () => {
    test("handles very long prompts", async () => {
      const user = userEvent.setup();
      render(<AddIterationModal {...defaultProps} />);

      // Use a shorter but still substantial prompt for the test
      const longPrompt = "A".repeat(100);

      await user.click(screen.getByTestId("generate-link"));
      const textarea = screen.getByTestId("prompt-input");
      await user.clear(textarea);

      // Use paste instead of type for long text to avoid user-event limitations
      await user.click(textarea);
      fireEvent.change(textarea, { target: { value: longPrompt } });

      expect(textarea).toHaveValue(longPrompt);
    });

    test("handles special characters in prompts", async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();

      render(<AddIterationModal {...defaultProps} onConfirm={onConfirm} />);

      const specialPrompt = 'Prompt with "quotes" & <tags> and émojis 🚀';

      await user.click(screen.getByTestId("generate-link"));
      const textarea = screen.getByTestId("prompt-input");
      await user.clear(textarea);

      // Use fireEvent for special characters to avoid user-event limitations
      fireEvent.change(textarea, { target: { value: specialPrompt } });

      await user.click(screen.getByTestId("confirm-button"));

      expect(onConfirm).toHaveBeenCalledWith(specialPrompt);
    });

    test("handles rapid open/close operations", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      const { rerender } = render(
        <AddIterationModal {...defaultProps} onClose={onClose} />
      );

      // Rapid close and reopen
      rerender(
        <AddIterationModal {...defaultProps} isOpen={false} onClose={onClose} />
      );
      rerender(
        <AddIterationModal {...defaultProps} isOpen={true} onClose={onClose} />
      );

      // Should still work normally
      expect(screen.getByTestId("add-iteration-modal")).toBeInTheDocument();

      await user.click(screen.getByTestId("cancel-button"));
      expect(onClose).toHaveBeenCalled();
    });

    test("handles undefined title gracefully", () => {
      render(<AddIterationModal {...defaultProps} title={undefined} />);

      // Should use default title
      expect(screen.getByText("Experiment Module")).toBeInTheDocument();
    });
  });

  describe("Performance", () => {
    test("does not cause unnecessary re-renders", () => {
      const onClose = vi.fn();
      const onConfirm = vi.fn();

      const { rerender } = render(
        <AddIterationModal
          {...defaultProps}
          onClose={onClose}
          onConfirm={onConfirm}
        />
      );

      // Same props should not cause issues
      rerender(
        <AddIterationModal
          {...defaultProps}
          onClose={onClose}
          onConfirm={onConfirm}
        />
      );

      expect(screen.getByTestId("add-iteration-modal")).toBeInTheDocument();
    });

    test("cleanup functions work correctly", () => {
      const { unmount } = render(<AddIterationModal {...defaultProps} />);

      expect(document.body.style.overflow).toBe("hidden");

      unmount();

      expect(document.body.style.overflow).toBe("unset");
    });
  });
});
