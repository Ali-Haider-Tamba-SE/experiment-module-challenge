import React from "react";
import { ModuleHeader } from "./ModuleHeader";
import { IterationItem, type Iteration } from "./IterationItem";
import { ModuleFooter } from "./ModuleFooter";

export interface ExperimentModuleData {
  id: string;
  title: string;
  isLocked: boolean;
  isExpanded: boolean;
  iterations: Iteration[];
}

interface ExperimentModuleProps {
  module: ExperimentModuleData;
  onToggleExpand: (moduleId: string) => void;
  onToggleLock: (moduleId: string) => void;
  onLockModule: (moduleId: string) => void;
  onResetModule: (moduleId: string) => void;
  onAddIteration: (moduleId: string) => void;
  onToggleSelection: (moduleId: string, iterationId: string) => void;
  onIterationClick: (iterationId: string) => void;
  isLoading?: boolean;
  currentModuleId?: string;
  className?: string;
  showEmptyState?: boolean;
  emptyStateMessage?: string;
  emptyStateSubMessage?: string;
}

export const ExperimentModule: React.FC<ExperimentModuleProps> = ({
  module,
  onToggleExpand,
  onToggleLock,
  onLockModule,
  onResetModule,
  onAddIteration,
  onToggleSelection,
  onIterationClick,
  isLoading = false,
  currentModuleId = "",
  className = "",
  showEmptyState = true,
  emptyStateMessage = "No iterations yet",
  emptyStateSubMessage = 'Click "ADD ITERATION" to get started',
}) => {
  const isCurrentlyLoading = isLoading && currentModuleId === module.id;

  return (
    <div
      className={`bg-gray-800 rounded-lg overflow-hidden ${className}`}
      data-testid={`experiment-module-${module.id}`}
    >
      {/* Module Header */}
      <ModuleHeader
        isEmpty={module.iterations.length === 0}
        title={module.title}
        isLocked={module.isLocked}
        isExpanded={module.isExpanded}
        onToggle={() => onToggleExpand(module.id)}
        onToggleLock={() => onToggleLock(module.id)}
        moduleId={module.id}
      />

      {/* Module Content */}
      {module.isExpanded && !module.isLocked && (
        <div className="px-4 pb-4">
          {/* Iteration List */}
          {module.iterations.length > 0 ? (
            <div className="bg-black rounded-lg overflow-hidden mb-6">
              {module.iterations.map((iteration) => (
                <IterationItem
                  key={iteration.id}
                  iteration={iteration}
                  moduleId={module.id}
                  onToggleSelection={onToggleSelection}
                  onIterationClick={onIterationClick}
                  isLocked={module.isLocked}
                />
              ))}
            </div>
          ) : showEmptyState ? (
            /* Empty State */
            <div className="bg-black rounded-lg p-8 text-center mb-6">
              <p className="text-gray-500 text-sm">{emptyStateMessage}</p>
              <p className="text-gray-600 text-xs mt-1">
                {emptyStateSubMessage}
              </p>
            </div>
          ) : null}

          {/* Module Footer */}
          <ModuleFooter
            moduleId={module.id}
            onLock={() => onLockModule(module.id)}
            onReset={() => onResetModule(module.id)}
            onAddIteration={() => onAddIteration(module.id)}
            isLocked={module.isLocked}
            isLoading={isCurrentlyLoading}
          />
        </div>
      )}

      {/* Locked Expanded State */}
      {module.isExpanded && module.isLocked && (
        <div className="px-4 pb-4">
          <div className="bg-black rounded-lg p-8 text-center">
            <p className="text-gray-500 text-sm">Module is locked</p>
            <p className="text-gray-600 text-xs mt-1">
              Unlock to view and edit iterations
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
