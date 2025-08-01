import React from "react";

export interface Iteration {
  id: string;
  title: string;
  isSelected: boolean;
  status: "completed" | "adding" | "draft";
}

interface IterationItemProps {
  iteration: Iteration;
  moduleId: string;
  onToggleSelection: (moduleId: string, iterationId: string) => void;
  onIterationClick: (iterationId: string) => void;
  isLocked?: boolean;
  showSelectionLabel?: boolean;
  className?: string;
}

export const IterationItem: React.FC<IterationItemProps> = ({
  iteration,
  moduleId,
  onToggleSelection,
  onIterationClick,
  isLocked = false,
  showSelectionLabel = true,
  className = "",
}) => {
  const handleSelectionToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLocked && iteration.status === "completed") {
      onToggleSelection(moduleId, iteration.id);
    }
  };

  const handleIterationClick = () => {
    if (!isLocked && iteration.status === "completed") {
      onIterationClick(iteration.id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleIterationClick();
    }
  };

  const handleSelectionKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      e.stopPropagation();
      handleSelectionToggle(e as any);
    }
  };

  const isClickable = !isLocked && iteration.status === "completed";

  return (
    <div
      className={`flex items-center justify-between p-4 border-b border-gray-700 last:border-b-0 ${className}`}
      data-testid={`iteration-${iteration.id}`}
      role="listitem"
    >
      <div className="flex items-center space-x-4 flex-1">
        <span
          className="text-gray-400 text-sm font-mono min-w-[40px]"
          data-testid={`iteration-number-${iteration.id}`}
        >
          {iteration.id}
        </span>
        <span
          className={`flex-1 transition-colors ${
            iteration.status === "adding"
              ? "text-gray-400 animate-pulse"
              : "text-white"
          } ${
            isClickable
              ? "cursor-pointer hover:underline focus:outline-none focus:underline"
              : iteration.status === "adding"
              ? "cursor-default"
              : "cursor-default"
          }`}
          onClick={handleIterationClick}
          onKeyDown={handleKeyDown}
          tabIndex={isClickable ? 0 : -1}
          role={isClickable ? "button" : undefined}
          aria-label={isClickable ? `Configure ${iteration.title}` : undefined}
          data-testid={`iteration-title-${iteration.id}`}
        >
          {iteration.title}
        </span>
      </div>

      <div className="flex items-center space-x-3">
        {iteration.status === "completed" && (
          <>
            {showSelectionLabel && (
              <span
                className="text-gray-400 text-sm"
                data-testid={`selection-label-${iteration.id}`}
              >
                Selection
              </span>
            )}
            <button
              onClick={handleSelectionToggle}
              onKeyDown={handleSelectionKeyDown}
              disabled={isLocked}
              className={`w-3 h-3 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black ${
                iteration.isSelected
                  ? "bg-green-500"
                  : "bg-gray-600 hover:bg-gray-500"
              } ${
                isLocked ? "cursor-not-allowed opacity-50" : "cursor-pointer"
              }`}
              data-testid={`selection-${iteration.id}`}
              aria-label={`${iteration.isSelected ? "Deselect" : "Select"} ${
                iteration.title
              }`}
              aria-pressed={iteration.isSelected}
              type="button"
            />
          </>
        )}

        {iteration.status === "adding" && (
          <div
            className="text-gray-500 text-sm animate-pulse"
            data-testid={`adding-status-${iteration.id}`}
            role="status"
            aria-live="polite"
          >
            Adding...
          </div>
        )}

        {iteration.status === "draft" && (
          <div
            className="text-yellow-500 text-sm"
            data-testid={`draft-status-${iteration.id}`}
          >
            Draft
          </div>
        )}
      </div>
    </div>
  );
};
