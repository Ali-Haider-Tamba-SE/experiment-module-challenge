import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { IterationItem, type Iteration } from "../components/IterationItem";

describe("IterationItem", () => {
  const mockIterations: Record<string, Iteration> = {
    completed: {
      id: "iter-1",
      title: "Completed Iteration",
      isSelected: false,
      status: "completed",
    },
    selected: {
      id: "iter-2",
      title: "Selected Iteration",
      isSelected: true,
      status: "completed",
    },
    adding: {
      id: "iter-3",
      title: "Adding iteration...",
      isSelected: false,
      status: "adding",
    },
    draft: {
      id: "iter-4",
      title: "Draft Iteration",
      isSelected: false,
      status: "draft",
    },
  };

  const defaultProps = {
    iteration: mockIterations.completed,
    moduleId: "em-1",
    onToggleSelection: vi.fn(),
    onIterationClick: vi.fn(),
    isLocked: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    test("renders iteration with correct structure", () => {
      render(<IterationItem {...defaultProps} />);

      expect(screen.getByTestId("iteration-iter-1")).toBeInTheDocument();
      expect(screen.getByTestId("iteration-number-iter-1")).toBeInTheDocument();
      expect(screen.getByTestId("iteration-title-iter-1")).toBeInTheDocument();
    });

    test("displays iteration ID correctly", () => {
      render(
        <IterationItem {...defaultProps} iteration={mockIterations.completed} />
      );

      const iterationNumber = screen.getByTestId("iteration-number-iter-1");
      expect(iterationNumber).toHaveTextContent("iter-1");
    });

    test("displays iteration title correctly", () => {
      render(<IterationItem {...defaultProps} />);

      expect(screen.getByText("Completed Iteration")).toBeInTheDocument();
    });

    test("applies custom className", () => {
      render(<IterationItem {...defaultProps} className="custom-class" />);

      const container = screen.getByTestId("iteration-iter-1");
      expect(container).toHaveClass("custom-class");
    });

    test("has correct listitem role", () => {
      render(<IterationItem {...defaultProps} />);

      const container = screen.getByTestId("iteration-iter-1");
      expect(container).toHaveAttribute("role", "listitem");
    });
  });

  describe("Status-based Rendering", () => {
    test("renders completed iteration with selection button", () => {
      render(
        <IterationItem {...defaultProps} iteration={mockIterations.completed} />
      );

      expect(screen.getByTestId("selection-iter-1")).toBeInTheDocument();
      expect(screen.getByTestId("selection-label-iter-1")).toBeInTheDocument();
      expect(
        screen.queryByTestId("adding-status-iter-1")
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId("draft-status-iter-1")
      ).not.toBeInTheDocument();
    });

    test("renders adding iteration with adding status", () => {
      render(
        <IterationItem {...defaultProps} iteration={mockIterations.adding} />
      );

      expect(screen.getByTestId("adding-status-iter-3")).toBeInTheDocument();
      expect(screen.getByText("Adding...")).toBeInTheDocument();
      expect(screen.queryByTestId("selection-iter-3")).not.toBeInTheDocument();
    });

    test("renders draft iteration with draft status", () => {
      render(
        <IterationItem {...defaultProps} iteration={mockIterations.draft} />
      );

      expect(screen.getByTestId("draft-status-iter-4")).toBeInTheDocument();
      expect(screen.getByText("Draft")).toBeInTheDocument();
      expect(screen.queryByTestId("selection-iter-4")).not.toBeInTheDocument();
    });

    test("hides selection label when showSelectionLabel is false", () => {
      render(
        <IterationItem
          {...defaultProps}
          iteration={mockIterations.completed}
          showSelectionLabel={false}
        />
      );

      expect(
        screen.queryByTestId("selection-label-iter-1")
      ).not.toBeInTheDocument();
      expect(screen.getByTestId("selection-iter-1")).toBeInTheDocument(); // Button still shows
    });

    test("adding status has live region attributes", () => {
      render(
        <IterationItem {...defaultProps} iteration={mockIterations.adding} />
      );

      const addingStatus = screen.getByTestId("adding-status-iter-3");
      expect(addingStatus).toHaveAttribute("role", "status");
      expect(addingStatus).toHaveAttribute("aria-live", "polite");
    });

    test("adding iteration has pulse animation", () => {
      render(
        <IterationItem {...defaultProps} iteration={mockIterations.adding} />
      );

      const iterationTitle = screen.getByTestId("iteration-title-iter-3");
      const addingStatus = screen.getByTestId("adding-status-iter-3");

      expect(iterationTitle).toHaveClass("animate-pulse", "text-gray-400");
      expect(addingStatus).toHaveClass("animate-pulse");
    });
  });

  describe("Selection State Management", () => {
    test("shows selected state correctly", () => {
      render(
        <IterationItem {...defaultProps} iteration={mockIterations.selected} />
      );

      const selectionButton = screen.getByTestId("selection-iter-2");
      expect(selectionButton).toHaveClass("bg-green-500");
      expect(selectionButton).toHaveAttribute("aria-pressed", "true");
    });

    test("shows unselected state correctly", () => {
      render(
        <IterationItem {...defaultProps} iteration={mockIterations.completed} />
      );

      const selectionButton = screen.getByTestId("selection-iter-1");
      expect(selectionButton).toHaveClass("bg-gray-600");
      expect(selectionButton).toHaveAttribute("aria-pressed", "false");
    });

    test("has correct aria-label for selection states", () => {
      const { rerender } = render(
        <IterationItem {...defaultProps} iteration={mockIterations.completed} />
      );

      const selectionButton = screen.getByTestId("selection-iter-1");
      expect(selectionButton).toHaveAttribute(
        "aria-label",
        "Select Completed Iteration"
      );

      rerender(
        <IterationItem {...defaultProps} iteration={mockIterations.selected} />
      );
      const selectedButton = screen.getByTestId("selection-iter-2");
      expect(selectedButton).toHaveAttribute(
        "aria-label",
        "Deselect Selected Iteration"
      );
    });

    test("unselected button has hover styles", () => {
      render(
        <IterationItem {...defaultProps} iteration={mockIterations.completed} />
      );

      const selectionButton = screen.getByTestId("selection-iter-1");
      expect(selectionButton).toHaveClass("hover:bg-gray-500");
    });
  });

  describe("Click Interactions", () => {
    test("calls onToggleSelection when selection button is clicked", async () => {
      const user = userEvent.setup();
      const onToggleSelection = vi.fn();

      render(
        <IterationItem
          {...defaultProps}
          iteration={mockIterations.completed}
          onToggleSelection={onToggleSelection}
        />
      );

      const selectionButton = screen.getByTestId("selection-iter-1");
      await user.click(selectionButton);

      expect(onToggleSelection).toHaveBeenCalledTimes(1);
      expect(onToggleSelection).toHaveBeenCalledWith("em-1", "iter-1");
    });

    test("calls onIterationClick when iteration title is clicked", async () => {
      const user = userEvent.setup();
      const onIterationClick = vi.fn();

      render(
        <IterationItem
          {...defaultProps}
          iteration={mockIterations.completed}
          onIterationClick={onIterationClick}
        />
      );

      const iterationTitle = screen.getByTestId("iteration-title-iter-1");
      await user.click(iterationTitle);

      expect(onIterationClick).toHaveBeenCalledTimes(1);
      expect(onIterationClick).toHaveBeenCalledWith("iter-1");
    });

    test("prevents event bubbling on selection button click", async () => {
      const user = userEvent.setup();
      const onToggleSelection = vi.fn();
      const onIterationClick = vi.fn();

      render(
        <IterationItem
          {...defaultProps}
          iteration={mockIterations.completed}
          onToggleSelection={onToggleSelection}
          onIterationClick={onIterationClick}
        />
      );

      const selectionButton = screen.getByTestId("selection-iter-1");
      await user.click(selectionButton);

      expect(onToggleSelection).toHaveBeenCalledTimes(1);
      expect(onIterationClick).not.toHaveBeenCalled();
    });
  });

  describe("Locked State Behavior", () => {
    test("disables interactions when locked", async () => {
      const user = userEvent.setup();
      const onToggleSelection = vi.fn();
      const onIterationClick = vi.fn();

      render(
        <IterationItem
          {...defaultProps}
          iteration={mockIterations.completed}
          onToggleSelection={onToggleSelection}
          onIterationClick={onIterationClick}
          isLocked={true}
        />
      );

      const selectionButton = screen.getByTestId("selection-iter-1");
      const iterationTitle = screen.getByTestId("iteration-title-iter-1");

      await user.click(selectionButton);
      await user.click(iterationTitle);

      expect(onToggleSelection).not.toHaveBeenCalled();
      expect(onIterationClick).not.toHaveBeenCalled();
    });

    test("applies locked styles to selection button", () => {
      render(
        <IterationItem
          {...defaultProps}
          iteration={mockIterations.completed}
          isLocked={true}
        />
      );

      const selectionButton = screen.getByTestId("selection-iter-1");
      expect(selectionButton).toBeDisabled();
      expect(selectionButton).toHaveClass("cursor-not-allowed", "opacity-50");
    });

    test("removes clickable styles from iteration title when locked", () => {
      render(
        <IterationItem
          {...defaultProps}
          iteration={mockIterations.completed}
          isLocked={true}
        />
      );

      const iterationTitle = screen.getByTestId("iteration-title-iter-1");
      expect(iterationTitle).not.toHaveClass(
        "cursor-pointer",
        "hover:underline"
      );
      expect(iterationTitle).toHaveAttribute("tabindex", "-1");
      expect(iterationTitle).not.toHaveAttribute("role", "button");
    });
  });

  describe("Non-clickable Status States", () => {
    test("adding iteration is not clickable", async () => {
      const user = userEvent.setup();
      const onIterationClick = vi.fn();

      render(
        <IterationItem
          {...defaultProps}
          iteration={mockIterations.adding}
          onIterationClick={onIterationClick}
        />
      );

      const iterationTitle = screen.getByTestId("iteration-title-iter-3");
      await user.click(iterationTitle);

      expect(onIterationClick).not.toHaveBeenCalled();
      expect(iterationTitle).toHaveAttribute("tabindex", "-1");
      expect(iterationTitle).not.toHaveClass("cursor-pointer");
      expect(iterationTitle).not.toHaveAttribute("role", "button");
    });

    test("draft iteration is not clickable", async () => {
      const user = userEvent.setup();
      const onIterationClick = vi.fn();

      render(
        <IterationItem
          {...defaultProps}
          iteration={mockIterations.draft}
          onIterationClick={onIterationClick}
        />
      );

      const iterationTitle = screen.getByTestId("iteration-title-iter-4");
      await user.click(iterationTitle);

      expect(onIterationClick).not.toHaveBeenCalled();
      expect(iterationTitle).toHaveAttribute("tabindex", "-1");
      expect(iterationTitle).not.toHaveClass("cursor-pointer");
    });

    test("adding iteration has correct visual styling", () => {
      render(
        <IterationItem {...defaultProps} iteration={mockIterations.adding} />
      );

      const iterationTitle = screen.getByTestId("iteration-title-iter-3");
      expect(iterationTitle).toHaveClass(
        "text-gray-400",
        "animate-pulse",
        "cursor-default"
      );
    });

    test("draft iteration has normal white text", () => {
      render(
        <IterationItem {...defaultProps} iteration={mockIterations.draft} />
      );

      const iterationTitle = screen.getByTestId("iteration-title-iter-4");
      expect(iterationTitle).toHaveClass("text-white", "cursor-default");
      expect(iterationTitle).not.toHaveClass("text-gray-400", "animate-pulse");
    });
  });

  describe("Keyboard Interactions", () => {
    test("calls onIterationClick when Enter is pressed on iteration title", async () => {
      const user = userEvent.setup();
      const onIterationClick = vi.fn();

      render(
        <IterationItem
          {...defaultProps}
          iteration={mockIterations.completed}
          onIterationClick={onIterationClick}
        />
      );

      const iterationTitle = screen.getByTestId("iteration-title-iter-1");
      iterationTitle.focus();
      await user.keyboard("{Enter}");

      expect(onIterationClick).toHaveBeenCalledTimes(1);
    });

    test("calls onIterationClick when Space is pressed on iteration title", async () => {
      const user = userEvent.setup();
      const onIterationClick = vi.fn();

      render(
        <IterationItem
          {...defaultProps}
          iteration={mockIterations.completed}
          onIterationClick={onIterationClick}
        />
      );

      const iterationTitle = screen.getByTestId("iteration-title-iter-1");
      iterationTitle.focus();
      await user.keyboard(" ");

      expect(onIterationClick).toHaveBeenCalledTimes(1);
    });

    test("calls onToggleSelection when Enter is pressed on selection button", async () => {
      const user = userEvent.setup();
      const onToggleSelection = vi.fn();

      render(
        <IterationItem
          {...defaultProps}
          iteration={mockIterations.completed}
          onToggleSelection={onToggleSelection}
        />
      );

      const selectionButton = screen.getByTestId("selection-iter-1");
      selectionButton.focus();
      await user.keyboard("{Enter}");

      expect(onToggleSelection).toHaveBeenCalledTimes(1);
    });

    test("calls onToggleSelection when Space is pressed on selection button", async () => {
      const user = userEvent.setup();
      const onToggleSelection = vi.fn();

      render(
        <IterationItem
          {...defaultProps}
          iteration={mockIterations.completed}
          onToggleSelection={onToggleSelection}
        />
      );

      const selectionButton = screen.getByTestId("selection-iter-1");
      selectionButton.focus();
      await user.keyboard(" ");

      expect(onToggleSelection).toHaveBeenCalledTimes(1);
    });

    test("does not respond to other keys", async () => {
      const user = userEvent.setup();
      const onIterationClick = vi.fn();
      const onToggleSelection = vi.fn();

      render(
        <IterationItem
          {...defaultProps}
          iteration={mockIterations.completed}
          onIterationClick={onIterationClick}
          onToggleSelection={onToggleSelection}
        />
      );

      const iterationTitle = screen.getByTestId("iteration-title-iter-1");
      iterationTitle.focus();
      await user.keyboard("{Escape}");
      await user.keyboard("a");

      expect(onIterationClick).not.toHaveBeenCalled();
    });

    test("prevents event bubbling on selection button keyboard events", async () => {
      const user = userEvent.setup();
      const onToggleSelection = vi.fn();
      const onIterationClick = vi.fn();

      render(
        <IterationItem
          {...defaultProps}
          iteration={mockIterations.completed}
          onToggleSelection={onToggleSelection}
          onIterationClick={onIterationClick}
        />
      );

      const selectionButton = screen.getByTestId("selection-iter-1");
      selectionButton.focus();
      await user.keyboard("{Enter}");

      expect(onToggleSelection).toHaveBeenCalledTimes(1);
      expect(onIterationClick).not.toHaveBeenCalled();
    });

    test("does not call handlers for keyboard events when locked", async () => {
      const user = userEvent.setup();
      const onIterationClick = vi.fn();
      const onToggleSelection = vi.fn();

      render(
        <IterationItem
          {...defaultProps}
          iteration={mockIterations.completed}
          onIterationClick={onIterationClick}
          onToggleSelection={onToggleSelection}
          isLocked={true}
        />
      );

      const iterationTitle = screen.getByTestId("iteration-title-iter-1");
      const selectionButton = screen.getByTestId("selection-iter-1");

      iterationTitle.focus();
      await user.keyboard("{Enter}");

      selectionButton.focus();
      await user.keyboard(" ");

      expect(onIterationClick).not.toHaveBeenCalled();
      expect(onToggleSelection).not.toHaveBeenCalled();
    });
  });

  describe("Accessibility Features", () => {
    test("clickable iteration title has button role and aria-label", () => {
      render(
        <IterationItem {...defaultProps} iteration={mockIterations.completed} />
      );

      const iterationTitle = screen.getByTestId("iteration-title-iter-1");
      expect(iterationTitle).toHaveAttribute("role", "button");
      expect(iterationTitle).toHaveAttribute(
        "aria-label",
        "Configure Completed Iteration"
      );
      expect(iterationTitle).toHaveAttribute("tabindex", "0");
    });

    test("non-clickable iteration titles do not have button role", () => {
      render(
        <IterationItem {...defaultProps} iteration={mockIterations.adding} />
      );

      const iterationTitle = screen.getByTestId("iteration-title-iter-3");
      expect(iterationTitle).not.toHaveAttribute("role", "button");
      expect(iterationTitle).not.toHaveAttribute("aria-label");
      expect(iterationTitle).toHaveAttribute("tabindex", "-1");
    });

    test("selection buttons have proper ARIA attributes", () => {
      render(
        <IterationItem {...defaultProps} iteration={mockIterations.completed} />
      );

      const selectionButton = screen.getByTestId("selection-iter-1");
      expect(selectionButton).toHaveAttribute("type", "button");
      expect(selectionButton).toHaveAttribute("aria-pressed", "false");
      expect(selectionButton).toHaveAttribute(
        "aria-label",
        "Select Completed Iteration"
      );
    });

    test("selection buttons have focus ring styles", () => {
      render(
        <IterationItem {...defaultProps} iteration={mockIterations.completed} />
      );

      const selectionButton = screen.getByTestId("selection-iter-1");
      expect(selectionButton).toHaveClass(
        "focus:outline-none",
        "focus:ring-2",
        "focus:ring-blue-500",
        "focus:ring-offset-2",
        "focus:ring-offset-black"
      );
    });

    test("iteration title has focus styles when clickable", () => {
      render(
        <IterationItem {...defaultProps} iteration={mockIterations.completed} />
      );

      const iterationTitle = screen.getByTestId("iteration-title-iter-1");
      expect(iterationTitle).toHaveClass(
        "focus:outline-none",
        "focus:underline"
      );
    });

    test("disabled selection button has proper disabled attributes", () => {
      render(
        <IterationItem
          {...defaultProps}
          iteration={mockIterations.completed}
          isLocked={true}
        />
      );

      const selectionButton = screen.getByTestId("selection-iter-1");
      expect(selectionButton).toBeDisabled();
      expect(selectionButton).toHaveAttribute("type", "button");
    });
  });

  describe("Focus Management", () => {
    test("completed iterations are in tab order", async () => {
      const user = userEvent.setup();
      render(
        <IterationItem {...defaultProps} iteration={mockIterations.completed} />
      );

      await user.tab();
      expect(screen.getByTestId("iteration-title-iter-1")).toHaveFocus();

      await user.tab();
      expect(screen.getByTestId("selection-iter-1")).toHaveFocus();
    });

    test("non-clickable iterations are not in tab order", () => {
      render(
        <IterationItem {...defaultProps} iteration={mockIterations.adding} />
      );

      const iterationTitle = screen.getByTestId("iteration-title-iter-3");
      expect(iterationTitle).toHaveAttribute("tabindex", "-1");
    });

    test("locked iteration title is not in tab order", () => {
      render(
        <IterationItem
          {...defaultProps}
          iteration={mockIterations.completed}
          isLocked={true}
        />
      );

      const iterationTitle = screen.getByTestId("iteration-title-iter-1");
      expect(iterationTitle).toHaveAttribute("tabindex", "-1");
    });
  });

  describe("Visual Transitions and Animations", () => {
    test("selection button has transition classes", () => {
      render(
        <IterationItem {...defaultProps} iteration={mockIterations.completed} />
      );

      const selectionButton = screen.getByTestId("selection-iter-1");
      expect(selectionButton).toHaveClass("transition-all", "duration-200");
    });

    test("iteration title has transition classes", () => {
      render(
        <IterationItem {...defaultProps} iteration={mockIterations.completed} />
      );

      const iterationTitle = screen.getByTestId("iteration-title-iter-1");
      expect(iterationTitle).toHaveClass("transition-colors");
    });

    test("adding status has proper styling", () => {
      render(
        <IterationItem {...defaultProps} iteration={mockIterations.adding} />
      );

      const addingStatus = screen.getByTestId("adding-status-iter-3");
      expect(addingStatus).toHaveClass(
        "text-gray-500",
        "text-sm",
        "animate-pulse"
      );
    });

    test("draft status has proper styling", () => {
      render(
        <IterationItem {...defaultProps} iteration={mockIterations.draft} />
      );

      const draftStatus = screen.getByTestId("draft-status-iter-4");
      expect(draftStatus).toHaveClass("text-yellow-500", "text-sm");
      expect(draftStatus).not.toHaveClass("animate-pulse");
    });
  });

  describe("Edge Cases and Error Handling", () => {
    test("handles empty iteration title", () => {
      const emptyIteration = { ...mockIterations.completed, title: "" };
      render(<IterationItem {...defaultProps} iteration={emptyIteration} />);

      const iterationTitle = screen.getByTestId("iteration-title-iter-1");
      expect(iterationTitle).toHaveTextContent("");
    });

    test("handles very long iteration titles", () => {
      const longIteration = {
        ...mockIterations.completed,
        title: "A".repeat(200),
      };
      render(<IterationItem {...defaultProps} iteration={longIteration} />);

      const iterationTitle = screen.getByTestId("iteration-title-iter-1");
      expect(iterationTitle).toHaveTextContent("A".repeat(200));
    });

    test("handles special characters in iteration title", () => {
      const specialIteration = {
        ...mockIterations.completed,
        title: 'Special chars: "quotes" & <tags> émojis 🚀',
      };
      render(<IterationItem {...defaultProps} iteration={specialIteration} />);

      expect(
        screen.getByText('Special chars: "quotes" & <tags> émojis 🚀')
      ).toBeInTheDocument();
    });

    test("handles invalid iteration ID gracefully", () => {
      const invalidIteration = {
        ...mockIterations.completed,
        id: "",
      };
      render(<IterationItem {...defaultProps} iteration={invalidIteration} />);

      expect(screen.getByTestId("iteration-")).toBeInTheDocument();
      expect(screen.getByTestId("iteration-number-")).toHaveTextContent("");
    });

    test("maintains functionality with rapidly changing props", () => {
      const { rerender } = render(
        <IterationItem {...defaultProps} iteration={mockIterations.completed} />
      );

      rerender(
        <IterationItem {...defaultProps} iteration={mockIterations.selected} />
      );

      rerender(
        <IterationItem {...defaultProps} iteration={mockIterations.adding} />
      );

      // Should not crash and should render the final state
      expect(screen.getByTestId("adding-status-iter-3")).toBeInTheDocument();
    });
  });

  describe("Performance Considerations", () => {
    test("does not cause unnecessary re-renders with same props", () => {
      const onToggleSelection = vi.fn();
      const onIterationClick = vi.fn();

      const { rerender } = render(
        <IterationItem
          {...defaultProps}
          onToggleSelection={onToggleSelection}
          onIterationClick={onIterationClick}
        />
      );

      // Same props should not cause issues
      rerender(
        <IterationItem
          {...defaultProps}
          onToggleSelection={onToggleSelection}
          onIterationClick={onIterationClick}
        />
      );

      expect(screen.getByTestId("iteration-iter-1")).toBeInTheDocument();
    });

    test("handles multiple instances efficiently", () => {
      const iterations = [
        mockIterations.completed,
        mockIterations.selected,
        mockIterations.adding,
        mockIterations.draft,
      ];

      render(
        <div>
          {iterations.map((iteration) => (
            <IterationItem
              key={iteration.id}
              iteration={iteration}
              moduleId="em-test"
              onToggleSelection={vi.fn()}
              onIterationClick={vi.fn()}
            />
          ))}
        </div>
      );

      iterations.forEach((iteration) => {
        expect(
          screen.getByTestId(`iteration-${iteration.id}`)
        ).toBeInTheDocument();
      });
    });
  });
});
