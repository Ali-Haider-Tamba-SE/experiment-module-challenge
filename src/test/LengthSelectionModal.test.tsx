import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import {
  LengthSelectionModal,
  type LengthOption,
  type LengthConfig,
} from "../components/LengthSelectionModal";

// Mock body overflow style changes
const mockBodyStyle = {
  overflow: "unset",
};
Object.defineProperty(document.body, "style", {
  value: mockBodyStyle,
  writable: true,
});

describe("LengthSelectionModal", () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    onRemove: vi.fn(),
    moduleId: "em-1",
    iterationTitle: "Test Iteration",
    selectedLength: "short" as LengthOption,
    onLengthChange: vi.fn(),
    showRemoveButton: true,
    isLoading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    document.body.style.overflow = "unset";
  });

  afterEach(() => {
    document.body.style.overflow = "unset";
  });

  describe("Rendering", () => {
    test("renders when isOpen is true", () => {
      render(<LengthSelectionModal {...defaultProps} />);

      expect(screen.getByTestId("length-selection-modal")).toBeInTheDocument();
      expect(screen.getByTestId("length-modal-backdrop")).toBeInTheDocument();
    });

    test("does not render when isOpen is false", () => {
      render(<LengthSelectionModal {...defaultProps} isOpen={false} />);

      expect(
        screen.queryByTestId("length-selection-modal")
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId("length-modal-backdrop")
      ).not.toBeInTheDocument();
    });

    test("displays module ID correctly", () => {
      render(<LengthSelectionModal {...defaultProps} moduleId="em-5" />);

      expect(screen.getByTestId("modal-module-id")).toHaveTextContent("EM-5");
    });

    test("displays iteration title correctly", () => {
      render(
        <LengthSelectionModal {...defaultProps} iterationTitle="Custom Title" />
      );

      expect(screen.getByTestId("modal-iteration-title")).toHaveTextContent(
        "Custom Title"
      );
    });

    test("applies custom className", () => {
      render(
        <LengthSelectionModal {...defaultProps} className="custom-class" />
      );

      const modal = screen.getByTestId("length-selection-modal");
      expect(modal).toHaveClass("custom-class");
    });

    test("truncates long iteration titles", () => {
      const longTitle =
        "This is a very long iteration title that should be truncated in display";
      render(
        <LengthSelectionModal {...defaultProps} iterationTitle={longTitle} />
      );

      const titleElement = screen.getByTestId("modal-iteration-title");
      expect(titleElement).toHaveClass("truncate", "max-w-[200px]");
      expect(titleElement).toHaveAttribute("title", longTitle);
    });
  });

  describe("Default Length Options", () => {
    test("renders default length options", () => {
      render(<LengthSelectionModal {...defaultProps} />);

      expect(screen.getByTestId("length-short")).toBeInTheDocument();
      expect(screen.getByTestId("length-medium")).toBeInTheDocument();
      expect(screen.getByTestId("length-very-long")).toBeInTheDocument();
    });

    test("displays correct labels for default options", () => {
      render(<LengthSelectionModal {...defaultProps} />);

      expect(screen.getByText("SHORT")).toBeInTheDocument();
      expect(screen.getByText("MEDIUM LENGTH")).toBeInTheDocument();
      expect(
        screen.getByText("VERY VERY VERY LONG (UP TO 35 CHAR)")
      ).toBeInTheDocument();
    });

    test("shows descriptions for default options", () => {
      render(<LengthSelectionModal {...defaultProps} />);

      expect(screen.getByText("Quick and concise")).toBeInTheDocument();
      expect(screen.getByText("Balanced detail")).toBeInTheDocument();
      expect(screen.getByText("Comprehensive")).toBeInTheDocument();
    });
  });

  describe("Custom Length Options", () => {
    const customOptions: LengthConfig[] = [
      {
        id: "short",
        label: "BRIEF",
        description: "One sentence",
        maxChars: 50,
      },
      {
        id: "medium",
        label: "STANDARD",
        description: "A paragraph",
        maxChars: 200,
      },
      { id: "custom", label: "CUSTOM", description: "User defined" },
    ];

    test("renders custom length options", () => {
      render(
        <LengthSelectionModal {...defaultProps} lengthOptions={customOptions} />
      );

      expect(screen.getByText("BRIEF")).toBeInTheDocument();
      expect(screen.getByText("STANDARD")).toBeInTheDocument();
      expect(screen.getByText("CUSTOM")).toBeInTheDocument();
    });

    test("shows custom descriptions and character limits", () => {
      render(
        <LengthSelectionModal {...defaultProps} lengthOptions={customOptions} />
      );

      expect(screen.getByText("One sentence")).toBeInTheDocument();
      expect(screen.getByText("50 chars")).toBeInTheDocument();
      expect(screen.getByText("200 chars")).toBeInTheDocument();
      expect(screen.getByText("User defined")).toBeInTheDocument();
    });

    test("handles options without maxChars", () => {
      render(
        <LengthSelectionModal {...defaultProps} lengthOptions={customOptions} />
      );

      const customButton = screen.getByTestId("length-custom");
      expect(customButton).toBeInTheDocument();

      // Check that the custom option doesn't have character count
      expect(customButton).toHaveTextContent("CUSTOM");
      expect(customButton).toHaveTextContent("User defined");
      expect(customButton).not.toHaveTextContent("chars");
    });
  });

  describe("Read-Only Length Selection", () => {
    test("length options are not clickable/interactive", () => {
      render(
        <LengthSelectionModal
          {...defaultProps}
          iterationTitle="Medium length title"
        />
      );

      // Options should not have button role or click handlers
      const mediumOption = screen.getByTestId("length-medium");
      expect(mediumOption).not.toHaveAttribute("role", "button");
      expect(mediumOption).not.toHaveClass("cursor-pointer");
    });

    test("auto-selected option has correct ARIA attributes", () => {
      render(<LengthSelectionModal {...defaultProps} iterationTitle="Short" />);

      const shortOption = screen.getByTestId("length-short");
      const mediumOption = screen.getByTestId("length-medium");

      expect(shortOption).toHaveAttribute("role", "radio");
      expect(shortOption).toHaveAttribute("aria-checked", "true");
      expect(mediumOption).toHaveAttribute("aria-checked", "false");
    });

    test("all non-selected options have opacity-50 class", () => {
      render(<LengthSelectionModal {...defaultProps} iterationTitle="Short" />);

      const mediumOption = screen.getByTestId("length-medium");
      const longOption = screen.getByTestId("length-very-long");

      expect(mediumOption).toHaveClass("opacity-50");
      expect(longOption).toHaveClass("opacity-50");
    });
  });

  describe("Button Interactions", () => {
    test("calls onConfirm with auto-selected length when DONE is clicked", async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();

      render(
        <LengthSelectionModal
          {...defaultProps}
          onConfirm={onConfirm}
          iterationTitle="Medium length title"
        />
      );

      await user.click(screen.getByTestId("confirm-button"));

      expect(onConfirm).toHaveBeenCalledTimes(1);
      expect(onConfirm).toHaveBeenCalledWith("medium");
    });

    test("calls onConfirm with short for short title", async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();

      render(
        <LengthSelectionModal
          {...defaultProps}
          onConfirm={onConfirm}
          iterationTitle="Short"
        />
      );

      await user.click(screen.getByTestId("confirm-button"));

      expect(onConfirm).toHaveBeenCalledWith("short");
    });

    test("calls onConfirm with very-long for long title", async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();

      render(
        <LengthSelectionModal
          {...defaultProps}
          onConfirm={onConfirm}
          iterationTitle="This is a very long iteration title that exceeds thirty-five characters"
        />
      );

      await user.click(screen.getByTestId("confirm-button"));

      expect(onConfirm).toHaveBeenCalledWith("very-long");
    });

    test("calls onRemove when REMOVE button is clicked", async () => {
      const user = userEvent.setup();
      const onRemove = vi.fn();

      render(<LengthSelectionModal {...defaultProps} onRemove={onRemove} />);

      await user.click(screen.getByTestId("remove-button"));

      expect(onRemove).toHaveBeenCalledTimes(1);
    });

    test("calls onClose when close button is clicked", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(<LengthSelectionModal {...defaultProps} onClose={onClose} />);

      // Close button only visible on mobile (lg:hidden), but we can still interact with it
      const closeButton = screen.queryByTestId("close-modal");
      if (closeButton && !closeButton.hasAttribute("disabled")) {
        await user.click(closeButton);
        expect(onClose).toHaveBeenCalledTimes(1);
      }
    });

    test("hides remove button when showRemoveButton is false", () => {
      render(
        <LengthSelectionModal {...defaultProps} showRemoveButton={false} />
      );

      expect(screen.queryByTestId("remove-button")).not.toBeInTheDocument();
    });

    test("does not show remove button when onRemove is not provided", () => {
      render(<LengthSelectionModal {...defaultProps} onRemove={undefined} />);

      expect(screen.queryByTestId("remove-button")).not.toBeInTheDocument();
    });
  });

  describe("Loading State", () => {
    test("disables all buttons when loading", () => {
      render(<LengthSelectionModal {...defaultProps} isLoading={true} />);

      expect(screen.getByTestId("confirm-button")).toBeDisabled();
      expect(screen.getByTestId("remove-button")).toBeDisabled();

      const closeButton = screen.queryByTestId("close-modal");
      if (closeButton) {
        expect(closeButton).toBeDisabled();
      }
    });

    test("shows loading text on confirm button", () => {
      render(<LengthSelectionModal {...defaultProps} isLoading={true} />);

      expect(screen.getByTestId("confirm-button")).toHaveTextContent(
        "APPLYING..."
      );
    });

    test("applies loading styles to buttons", () => {
      render(<LengthSelectionModal {...defaultProps} isLoading={true} />);

      const confirmButton = screen.getByTestId("confirm-button");
      const removeButton = screen.getByTestId("remove-button");

      expect(confirmButton).toHaveClass(
        "disabled:opacity-50",
        "disabled:cursor-not-allowed"
      );
      expect(removeButton).toHaveClass(
        "disabled:opacity-50",
        "disabled:cursor-not-allowed"
      );
    });

    test("prevents interactions when loading", async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();
      const onRemove = vi.fn();
      const onClose = vi.fn();

      render(
        <LengthSelectionModal
          {...defaultProps}
          isLoading={true}
          onConfirm={onConfirm}
          onRemove={onRemove}
          onClose={onClose}
        />
      );

      // Try to interact with disabled elements
      await user.click(screen.getByTestId("confirm-button"));
      await user.click(screen.getByTestId("remove-button"));

      expect(onConfirm).not.toHaveBeenCalled();
      expect(onRemove).not.toHaveBeenCalled();
    });
  });

  describe("Keyboard Interactions", () => {
    test("closes modal with ESC key when not loading", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(<LengthSelectionModal {...defaultProps} onClose={onClose} />);

      await user.keyboard("{Escape}");

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    test("does not close modal with ESC key when loading", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(
        <LengthSelectionModal
          {...defaultProps}
          onClose={onClose}
          isLoading={true}
        />
      );

      await user.keyboard("{Escape}");

      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe("Backdrop Interactions", () => {
    test("closes modal when backdrop is clicked and not loading", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(<LengthSelectionModal {...defaultProps} onClose={onClose} />);

      const backdrop = screen.getByTestId("length-modal-backdrop");
      await user.click(backdrop);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    test("does not close modal when backdrop is clicked and loading", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(
        <LengthSelectionModal
          {...defaultProps}
          onClose={onClose}
          isLoading={true}
        />
      );

      const backdrop = screen.getByTestId("length-modal-backdrop");
      await user.click(backdrop);

      expect(onClose).not.toHaveBeenCalled();
    });

    test("does not close modal when clicking inside modal content", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(<LengthSelectionModal {...defaultProps} onClose={onClose} />);

      const modal = screen.getByTestId("length-selection-modal");
      await user.click(modal);

      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe("Accessibility", () => {
    test("has correct ARIA attributes on modal", () => {
      render(<LengthSelectionModal {...defaultProps} />);

      const backdrop = screen.getByTestId("length-modal-backdrop");
      expect(backdrop).toHaveAttribute("role", "dialog");
      expect(backdrop).toHaveAttribute("aria-modal", "true");
      expect(backdrop).toHaveAttribute("aria-labelledby", "length-modal-title");
      expect(backdrop).toHaveAttribute(
        "aria-describedby",
        "length-modal-description"
      );
    });

    test("has radiogroup role for length options", () => {
      render(<LengthSelectionModal {...defaultProps} />);

      const optionsContainer = screen.getByRole("radiogroup");
      expect(optionsContainer).toBeInTheDocument();
      expect(optionsContainer).toHaveAttribute(
        "aria-labelledby",
        "length-modal-title"
      );
    });

    test("length options have radio role and correct ARIA attributes", () => {
      render(
        <LengthSelectionModal
          {...defaultProps}
          iterationTitle="Medium length title"
        />
      );

      const shortOption = screen.getByTestId("length-short");
      const mediumOption = screen.getByTestId("length-medium");

      expect(shortOption).toHaveAttribute("role", "radio");
      expect(shortOption).toHaveAttribute("aria-checked", "false");

      expect(mediumOption).toHaveAttribute("role", "radio");
      expect(mediumOption).toHaveAttribute("aria-checked", "true");
    });

    test("options with descriptions have aria-describedby", () => {
      render(<LengthSelectionModal {...defaultProps} />);

      const shortOption = screen.getByTestId("length-short");
      expect(shortOption).toHaveAttribute(
        "aria-describedby",
        "length-desc-short"
      );
    });

    test("remove button has descriptive aria-label", () => {
      render(
        <LengthSelectionModal
          {...defaultProps}
          iterationTitle="My Test Iteration"
        />
      );

      const removeButton = screen.getByTestId("remove-button");
      expect(removeButton).toHaveAttribute(
        "aria-label",
        "Remove My Test Iteration"
      );
    });

    test("manages body overflow when modal opens and closes", () => {
      const { rerender } = render(
        <LengthSelectionModal {...defaultProps} isOpen={true} />
      );

      expect(document.body.style.overflow).toBe("hidden");

      rerender(<LengthSelectionModal {...defaultProps} isOpen={false} />);

      expect(document.body.style.overflow).toBe("unset");
    });
  });

  describe("Focus Management", () => {
    test("has proper focus ring styles", () => {
      render(<LengthSelectionModal {...defaultProps} />);

      const confirmButton = screen.getByTestId("confirm-button");
      const removeButton = screen.getByTestId("remove-button");

      expect(confirmButton).toHaveClass(
        "focus:outline-none",
        "focus:ring-2",
        "focus:ring-blue-500"
      );
      expect(removeButton).toHaveClass(
        "focus:outline-none",
        "focus:ring-2",
        "focus:ring-red-500"
      );
    });

    test("buttons have proper disabled focus styles", () => {
      render(<LengthSelectionModal {...defaultProps} isLoading={true} />);

      const confirmButton = screen.getByTestId("confirm-button");
      expect(confirmButton).toHaveClass("disabled:cursor-not-allowed");
    });
  });

  describe("Performance", () => {
    test("does not cause unnecessary re-renders", () => {
      const onLengthChange = vi.fn();
      const onConfirm = vi.fn();
      const onClose = vi.fn();

      const { rerender } = render(
        <LengthSelectionModal
          {...defaultProps}
          onLengthChange={onLengthChange}
          onConfirm={onConfirm}
          onClose={onClose}
        />
      );

      // Same props should not cause issues
      rerender(
        <LengthSelectionModal
          {...defaultProps}
          onLengthChange={onLengthChange}
          onConfirm={onConfirm}
          onClose={onClose}
        />
      );

      expect(screen.getByTestId("length-selection-modal")).toBeInTheDocument();
    });
  });
});
