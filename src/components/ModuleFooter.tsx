import React from "react";
import { Plus, Lock, RotateCcw } from "lucide-react";

export interface ActionButton {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: "default" | "primary" | "danger" | "success";
  ariaLabel?: string;
}

interface ModuleFooterProps {
  moduleId: string;
  onLock?: () => void;
  onReset?: () => void;
  onAddIteration?: () => void;
  customActions?: ActionButton[];
  showLockAction?: boolean;
  showResetAction?: boolean;
  showAddAction?: boolean;
  isLocked?: boolean;
  isLoading?: boolean;
  addIterationLabel?: string;
  lockLabel?: string;
  resetLabel?: string;
  className?: string;
  spacing?: "compact" | "normal" | "wide";
  alignment?: "left" | "center" | "right";
  iconSize?: number;
}

export const ModuleFooter: React.FC<ModuleFooterProps> = ({
  moduleId,
  onLock,
  onReset,
  onAddIteration,
  customActions = [],
  showLockAction = true,
  showResetAction = true,
  showAddAction = true,
  isLocked = false,
  isLoading = false,
  addIterationLabel = "ADD ITERATION",
  lockLabel,
  resetLabel = "RESET",
  className = "",
  spacing = "normal",
  alignment = "center",
  iconSize = 16,
}) => {
  // Determine lock label based on state
  const effectiveLockLabel = lockLabel || (isLocked ? "UNLOCK" : "LOCK");

  // Get spacing classes
  const getSpacingClass = () => {
    switch (spacing) {
      case "compact":
        return "space-x-3";
      case "wide":
        return "space-x-8";
      default:
        return "space-x-6";
    }
  };

  // Get alignment classes
  const getAlignmentClass = () => {
    switch (alignment) {
      case "left":
        return "justify-start";
      case "right":
        return "justify-end";
      default:
        return "justify-center";
    }
  };

  // Get variant classes
  const getVariantClasses = (variant: ActionButton["variant"] = "default") => {
    const baseClasses =
      "transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 rounded px-2 py-1";

    switch (variant) {
      case "primary":
        return `${baseClasses} text-blue-400 hover:text-blue-300 focus:ring-blue-500`;
      case "danger":
        return `${baseClasses} text-red-400 hover:text-red-300 focus:ring-red-500`;
      case "success":
        return `${baseClasses} text-green-400 hover:text-green-300 focus:ring-green-500`;
      default:
        return `${baseClasses} text-gray-400 hover:text-white focus:ring-gray-500`;
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent, action: () => void) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (!isLoading) {
        action();
      }
    }
  };

  // Default actions
  const defaultActions: ActionButton[] = [];

  if (showLockAction && onLock) {
    defaultActions.push({
      id: "lock",
      label: effectiveLockLabel,
      icon: <Lock size={iconSize} />,
      onClick: onLock,
      disabled: isLoading,
      variant: isLocked ? "success" : "default",
      ariaLabel: `${isLocked ? "Unlock" : "Lock"} module ${moduleId}`,
    });
  }

  if (showResetAction && onReset) {
    defaultActions.push({
      id: "reset",
      label: resetLabel,
      icon: <RotateCcw size={iconSize} />,
      onClick: onReset,
      disabled: isLoading,
      variant: "default",
      ariaLabel: `Reset module ${moduleId}`,
    });
  }

  if (showAddAction && onAddIteration) {
    defaultActions.push({
      id: "add",
      label: addIterationLabel,
      icon: <Plus size={iconSize} />,
      onClick: onAddIteration,
      disabled: isLoading || isLocked,
      variant: "primary",
      ariaLabel: `Add iteration to module ${moduleId}`,
    });
  }

  // Combine default and custom actions
  const allActions = [...defaultActions, ...customActions];

  if (allActions.length === 0) {
    return null;
  }

  return (
    <div
      className={`flex items-center mt-6 ${getAlignmentClass()} ${getSpacingClass()} ${className}`}
      data-testid={`module-footer-${moduleId}`}
      role="toolbar"
      aria-label={`Actions for module ${moduleId}`}
    >
      {allActions.map((action) => (
        <button
          key={action.id}
          onClick={action.onClick}
          onKeyDown={(e) => handleKeyDown(e, action.onClick)}
          disabled={action.disabled || isLoading}
          className={`${getVariantClasses(action.variant)} ${
            action.disabled || isLoading
              ? "opacity-50 cursor-not-allowed"
              : "cursor-pointer"
          } ${action.icon ? "flex items-center space-x-2" : ""}`}
          data-testid={`${action.id}-action-${moduleId}`}
          aria-label={action.ariaLabel || action.label}
          type="button"
        >
          {action.icon && (
            <span className="flex-shrink-0" aria-hidden="true">
              {action.icon}
            </span>
          )}
          <span>{action.label}</span>
        </button>
      ))}
    </div>
  );
};
