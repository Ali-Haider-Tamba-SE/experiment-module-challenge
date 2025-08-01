import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ExperimentModule } from "../components/ExperimentModule";
import { vi } from "vitest";

// Mock the child components
vi.mock("../components/ModuleHeader", () => ({
  ModuleHeader: ({ title, onToggle, onToggleLock, moduleId }: any) => (
    <div data-testid={`module-header-${moduleId}`}>
      <span>{title}</span>
      <button onClick={onToggle}>Toggle Expand</button>
      <button onClick={onToggleLock}>Toggle Lock</button>
    </div>
  ),
}));

vi.mock("../components/IterationItem", () => ({
  IterationItem: ({ iteration, onIterationClick }: any) => (
    <div data-testid={`iteration-${iteration.id}`}>
      <button onClick={() => onIterationClick(iteration.id)}>
        {iteration.title}
      </button>
    </div>
  ),
}));

vi.mock("../components/ModuleFooter", () => ({
  ModuleFooter: ({ moduleId, onAddIteration, onLock, onReset }: any) => (
    <div data-testid={`module-footer-${moduleId}`}>
      <button onClick={onAddIteration}>Add Iteration</button>
      <button onClick={onLock}>Lock</button>
      <button onClick={onReset}>Reset</button>
    </div>
  ),
}));

describe("ExperimentModule", () => {
  const mockModule = {
    id: "test-module-1",
    title: "Test Module",
    isLocked: false,
    isExpanded: true,
    iterations: [
      {
        id: "iter-1",
        title: "Iteration 1",
        isSelected: false,
        status: "completed" as const,
      },
      {
        id: "iter-2",
        title: "Iteration 2",
        isSelected: true,
        status: "completed" as const,
      },
    ],
  };

  const mockProps = {
    module: mockModule,
    onToggleExpand: vi.fn(),
    onToggleLock: vi.fn(),
    onLockModule: vi.fn(),
    onResetModule: vi.fn(),
    onAddIteration: vi.fn(),
    onToggleSelection: vi.fn(),
    onIterationClick: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders module with header and iterations when expanded and unlocked", () => {
    render(<ExperimentModule {...mockProps} />);

    expect(
      screen.getByTestId("experiment-module-test-module-1")
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("module-header-test-module-1")
    ).toBeInTheDocument();
    expect(screen.getByTestId("iteration-iter-1")).toBeInTheDocument();
    expect(screen.getByTestId("iteration-iter-2")).toBeInTheDocument();
    expect(
      screen.getByTestId("module-footer-test-module-1")
    ).toBeInTheDocument();
  });

  test("shows empty state when no iterations exist", () => {
    const emptyModule = { ...mockModule, iterations: [] };
    render(<ExperimentModule {...mockProps} module={emptyModule} />);

    expect(screen.getByText("No iterations yet")).toBeInTheDocument();
    expect(
      screen.getByText('Click "ADD ITERATION" to get started')
    ).toBeInTheDocument();
  });

  test("shows locked state message when module is expanded and locked", () => {
    const lockedModule = { ...mockModule, isLocked: true };
    render(<ExperimentModule {...mockProps} module={lockedModule} />);

    expect(screen.getByText("Module is locked")).toBeInTheDocument();
    expect(
      screen.getByText("Unlock to view and edit iterations")
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("module-footer-test-module-1")
    ).not.toBeInTheDocument();
  });

  test("hides content when module is collapsed", () => {
    const collapsedModule = { ...mockModule, isExpanded: false };
    render(<ExperimentModule {...mockProps} module={collapsedModule} />);

    expect(
      screen.getByTestId("module-header-test-module-1")
    ).toBeInTheDocument();
    expect(screen.queryByTestId("iteration-iter-1")).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("module-footer-test-module-1")
    ).not.toBeInTheDocument();
  });

  test("calls callback functions when header actions are triggered", async () => {
    const user = userEvent.setup();
    render(<ExperimentModule {...mockProps} />);

    await user.click(screen.getByText("Toggle Expand"));
    expect(mockProps.onToggleExpand).toHaveBeenCalledWith("test-module-1");

    await user.click(screen.getByText("Toggle Lock"));
    expect(mockProps.onToggleLock).toHaveBeenCalledWith("test-module-1");
  });

  test("calls callback functions when footer actions are triggered", async () => {
    const user = userEvent.setup();
    render(<ExperimentModule {...mockProps} />);

    await user.click(screen.getByText("Add Iteration"));
    expect(mockProps.onAddIteration).toHaveBeenCalledWith("test-module-1");

    await user.click(screen.getByText("Lock"));
    expect(mockProps.onLockModule).toHaveBeenCalledWith("test-module-1");

    await user.click(screen.getByText("Reset"));
    expect(mockProps.onResetModule).toHaveBeenCalledWith("test-module-1");
  });

  test("calls onIterationClick when iteration is clicked", async () => {
    const user = userEvent.setup();
    render(<ExperimentModule {...mockProps} />);

    await user.click(screen.getByText("Iteration 1"));
    expect(mockProps.onIterationClick).toHaveBeenCalledWith("iter-1");
  });

  test("applies custom empty state messages", () => {
    const emptyModule = { ...mockModule, iterations: [] };
    render(
      <ExperimentModule
        {...mockProps}
        module={emptyModule}
        emptyStateMessage="Custom empty message"
        emptyStateSubMessage="Custom sub message"
      />
    );

    expect(screen.getByText("Custom empty message")).toBeInTheDocument();
    expect(screen.getByText("Custom sub message")).toBeInTheDocument();
  });
});
