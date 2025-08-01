import React from "react";
import { Lock, Unlock } from "lucide-react";

interface ModuleHeaderProps {
  title: string;
  isLocked: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onToggleLock: (e: React.MouseEvent) => void;
  moduleId: string;
  isEmpty: boolean;
}

export const ModuleHeader: React.FC<ModuleHeaderProps> = ({
  title,
  isLocked,
  isExpanded,
  onToggle,
  onToggleLock,
  moduleId,
  isEmpty,
}) => {
  const handleHeaderClick = () => {
    if (!isLocked) {
      onToggle();
    }
  };

  const handleLockClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleLock(e);
  };

  return (
    <div
      className={`flex items-center justify-between p-4 transition-colors ${
        isLocked ? "cursor-not-allowed" : "cursor-pointer hover:bg-gray-700"
      }
      `}
      onClick={handleHeaderClick}
      data-testid={`module-header-${moduleId}`}
      role="button"
      tabIndex={isLocked ? -1 : 0}
      aria-expanded={isExpanded}
      aria-label={`${title} - ${isLocked ? "Locked" : "Unlocked"} - ${
        isExpanded ? "Expanded" : "Collapsed"
      }`}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && !isLocked) {
          e.preventDefault();
          onToggle();
        }
      }}
    >
      <h2
        className={`text-xl font-medium ${
          isLocked || isEmpty ? "text-gray-500" : "text-white"
        }`}
      >
        {title}
      </h2>
      {!isEmpty && (
        <button
          onClick={handleLockClick}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              e.stopPropagation();
              handleLockClick(e as any);
            }
          }}
          className="text-gray-400 hover:text-white transition-colors p-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          data-testid={`lock-button-${moduleId}`}
          aria-label={isLocked ? "Unlock module" : "Lock module"}
          type="button"
        >
          {isLocked ? <Lock size={20} /> : <Unlock size={20} />}
        </button>
      )}
    </div>
  );
};
