import React, { useState } from "react";
import { Plus } from "lucide-react";

import {
  ExperimentModule,
  type ExperimentModuleData,
} from "../../components/ExperimentModule";
import { AddIterationModal } from "../../components/AddIterationModal";
import {
  LengthSelectionModal,
  type LengthOption,
} from "../../components/LengthSelectionModal";

const ExperimentModuleApp: React.FC = () => {
  const [modules, setModules] = useState<ExperimentModuleData[]>([
    {
      id: "em-1",
      title: "Experiment Module",
      isLocked: false,
      isExpanded: false,
      iterations: [],
    },
  ]);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showLengthModal, setShowLengthModal] = useState(false);
  const [currentModuleId, setCurrentModuleId] = useState<string>("");
  const [currentIterationId, setCurrentIterationId] = useState<string>("");
  const [selectedLength, setSelectedLength] = useState<LengthOption>("short");
  const [isProcessing, setIsProcessing] = useState(false);

  // Add new module
  const addNewModule = () => {
    const newModuleId = `em-${modules.length + 1}`;
    const newModule: ExperimentModuleData = {
      id: newModuleId,
      title: "Experiment Module",
      isLocked: false,
      isExpanded: false,
      iterations: [],
    };
    setModules((prev) => [...prev, newModule]);
  };

  // Module operations
  const handleToggleExpand = (moduleId: string) => {
    setModules((prev) =>
      prev.map((module) =>
        module.id === moduleId
          ? { ...module, isExpanded: !module.isExpanded }
          : module
      )
    );
  };

  const handleToggleLock = (moduleId: string) => {
    setModules((prev) =>
      prev.map((module) =>
        module.id === moduleId
          ? {
              ...module,
              isLocked: !module.isLocked,
              // Collapse when locking
              isExpanded: module.isLocked ? module.isExpanded : false,
            }
          : module
      )
    );
  };

  const handleLockModule = (moduleId: string) => {
    setModules((prev) =>
      prev.map((module) =>
        module.id === moduleId
          ? { ...module, isLocked: true, isExpanded: false }
          : module
      )
    );
  };

  const handleResetModule = (moduleId: string) => {
    setModules((prev) =>
      prev.map((module) =>
        module.id === moduleId
          ? {
              ...module,
              iterations: module.iterations.map((iteration) => ({
                ...iteration,
                isSelected: false,
              })),
            }
          : module
      )
    );
  };

  // Iteration operations
  const handleToggleSelection = (moduleId: string, iterationId: string) => {
    setModules((prev) =>
      prev.map((module) =>
        module.id === moduleId
          ? {
              ...module,
              iterations: module.iterations.map((iteration) =>
                iteration.id === iterationId
                  ? { ...iteration, isSelected: !iteration.isSelected }
                  : iteration
              ),
            }
          : module
      )
    );
  };

  const handleAddIteration = (moduleId: string) => {
    setCurrentModuleId(moduleId);
    setShowAddModal(true);
  };

  const handleAddIterationComplete = (prompt?: string) => {
    const nextIterationNumber = getNextIterationNumber(currentModuleId);
    const newIterationId = `EM-${nextIterationNumber}`;

    // Add iteration with "adding" status
    setModules((prev) =>
      prev.map((module) =>
        module.id === currentModuleId
          ? {
              ...module,
              iterations: [
                ...module.iterations,
                {
                  id: newIterationId,
                  title: "Adding iteration...",
                  isSelected: false,
                  status: "adding" as const,
                },
              ],
            }
          : module
      )
    );

    setShowAddModal(false);
    setIsProcessing(true);

    // Simulate API call completion
    setTimeout(() => {
      setModules((prev) =>
        prev.map((module) =>
          module.id === currentModuleId
            ? {
                ...module,
                iterations: module.iterations.map((iteration) =>
                  iteration.id === newIterationId
                    ? {
                        ...iteration,
                        title: prompt || "Iteration title",
                        status: "completed" as const,
                      }
                    : iteration
                ),
              }
            : module
        )
      );
      setIsProcessing(false);
    }, 2000);
  };

  const handleIterationClick = (iterationId: string) => {
    // Find the iteration to get current module context
    let foundModuleId = "";
    modules.forEach((module) => {
      if (module.iterations.some((iter) => iter.id === iterationId)) {
        foundModuleId = module.id;
      }
    });

    setCurrentModuleId(foundModuleId);
    setCurrentIterationId(iterationId);
    setShowLengthModal(true);
  };

  const handleLengthConfirm = (length: LengthOption) => {
    console.log(`Applied length ${length} to iteration ${currentIterationId}`);
    setShowLengthModal(false);
    // In a real app, this would update the iteration with the selected length
  };

  const handleRemoveIteration = () => {
    setModules((prev) =>
      prev.map((module) =>
        module.id === currentModuleId
          ? {
              ...module,
              iterations: module.iterations.filter(
                (iteration) => iteration.id !== currentIterationId
              ),
            }
          : module
      )
    );
    setShowLengthModal(false);
  };

  const getNextIterationNumber = (moduleId: string) => {
    const module = modules.find((m) => m.id === moduleId);
    return (module?.iterations.length || 0) + 1;
  };

  const getLastIterationNumber = (moduleId: string) => {
    const module = modules.find((m) => m.id === moduleId);
    const lastIteration = module?.iterations[module?.iterations.length - 1];
    if (!lastIteration) {
      return 1;
    }
    const lastIterationNumber = Number(lastIteration.id.split("-")[1]);
    return lastIterationNumber + 1;
  };

  // Get current iteration for length modal
  const getCurrentIteration = () => {
    const module = modules.find((m) => m.id === currentModuleId);
    return module?.iterations.find((iter) => iter.id === currentIterationId);
  };

  const currentIteration = getCurrentIteration();

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Experiment Modules
          </h1>
          <button
            onClick={addNewModule}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
            data-testid="add-new-module"
          >
            <Plus size={16} />
            <span>Add Module</span>
          </button>
        </div>

        {/* Render modules using the reusable ExperimentModule component */}
        <div className="space-y-4">
          {modules.map((module) => (
            <ExperimentModule
              key={module.id}
              module={module}
              onToggleExpand={handleToggleExpand}
              onToggleLock={handleToggleLock}
              onLockModule={handleLockModule}
              onResetModule={handleResetModule}
              onAddIteration={handleAddIteration}
              onToggleSelection={handleToggleSelection}
              onIterationClick={handleIterationClick}
              isLoading={isProcessing}
              currentModuleId={currentModuleId}
            />
          ))}
        </div>

        {/* Help Text */}
        {modules.length === 1 && modules[0].iterations.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-600 text-sm">
              Click on a module header to expand it and start adding iterations.
            </p>
            <p className="text-gray-500 text-xs mt-1">
              Use the "Add Module" button above to create additional experiment
              modules.
            </p>
          </div>
        )}
      </div>

      {/* Add Iteration Modal */}
      <AddIterationModal
        nextIterationNumber={getLastIterationNumber(currentModuleId)}
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onConfirm={handleAddIterationComplete}
        title="Experiment Module"
        isLoading={isProcessing}
      />

      {/* Length Selection Modal */}
      <LengthSelectionModal
        isOpen={showLengthModal}
        onClose={() => setShowLengthModal(false)}
        onConfirm={handleLengthConfirm}
        onRemove={handleRemoveIteration}
        moduleId={currentModuleId}
        iterationTitle={currentIteration?.title || "Iteration"}
        selectedLength={selectedLength}
        onLengthChange={setSelectedLength}
        isLoading={isProcessing}
      />
    </div>
  );
};

export default ExperimentModuleApp;
