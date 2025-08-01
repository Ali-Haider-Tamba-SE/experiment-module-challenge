import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

export type LengthOption = "short" | "medium" | "very-long" | "custom";

export interface LengthConfig {
  id: LengthOption;
  label: string;
  description?: string;
  maxChars?: number;
}

interface LengthSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedLength: LengthOption) => void;
  onRemove?: () => void;
  moduleId: string;
  iterationTitle: string;
  selectedLength: LengthOption;
  onLengthChange: (length: LengthOption) => void;
  lengthOptions?: LengthConfig[];
  showRemoveButton?: boolean;
  isLoading?: boolean;
  className?: string;
}

const DEFAULT_LENGTH_OPTIONS: LengthConfig[] = [
  {
    id: "short",
    label: "SHORT",
    description: "Quick and concise",
  },
  {
    id: "medium",
    label: "MEDIUM LENGTH",
    description: "Balanced detail",
  },
  {
    id: "very-long",
    label: "VERY VERY VERY LONG (UP TO 35 CHAR)",
    description: "Comprehensive",
  },
];

// Helper function to determine length category based on title length
const getLengthCategory = (title: string): LengthOption => {
  const titleLength = title.length;
  if (titleLength <= 15) {
    return "short";
  } else if (titleLength < 35) {
    return "medium";
  } else {
    return "very-long";
  }
};

export const LengthSelectionModal: React.FC<LengthSelectionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  onRemove,
  moduleId,
  iterationTitle,
  lengthOptions = DEFAULT_LENGTH_OPTIONS,
  showRemoveButton = true,
  isLoading = false,
  className = "",
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const firstButtonRef = useRef<HTMLDivElement>(null);

  // Automatically determine the length category based on title length
  const autoSelectedLength = getLengthCategory(iterationTitle);

  // Handle ESC key and body scroll
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen && !isLoading) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";

      // Focus first length option
      setTimeout(() => {
        firstButtonRef.current?.focus();
      }, 100);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose, isLoading]);

  // Handle backdrop click
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget && !isLoading) {
      onClose();
    }
  };

  // Handle confirm - use auto-selected length
  const handleConfirm = () => {
    if (!isLoading) {
      onConfirm(autoSelectedLength);
    }
  };

  // Handle remove
  const handleRemove = () => {
    if (!isLoading && onRemove) {
      onRemove();
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Tab") {
      const focusableElements = modalRef.current?.querySelectorAll(
        'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements && focusableElements.length > 0) {
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[
          focusableElements.length - 1
        ] as HTMLElement;

        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
      data-testid="length-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="length-modal-title"
      aria-describedby="length-modal-description"
    >
      <div
        ref={modalRef}
        className={`bg-gray-800 rounded-lg p-6 max-w-md w-full transform transition-all duration-200 ${className}`}
        data-testid="length-selection-modal"
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <span
              className="text-gray-400 text-sm font-mono"
              data-testid="modal-module-id"
            >
              {moduleId.toUpperCase()}
            </span>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 lg:hidden"
              data-testid="close-modal"
              aria-label="Close modal"
              disabled={isLoading}
            >
              <X size={16} />
            </button>
          </div>
          <span
            id="length-modal-title"
            className="text-white font-medium truncate max-w-[200px]"
            data-testid="modal-iteration-title"
            title={iterationTitle}
          >
            {iterationTitle}
          </span>
        </div>

        {/* Length Options - Read Only */}
        <div
          className="space-y-3 mb-6"
          id="length-modal-description"
          role="radiogroup"
          aria-labelledby="length-modal-title"
        >
          {lengthOptions.map((option, index) => (
            <div
              key={option.id}
              ref={index === 0 ? firstButtonRef : undefined}
              className={`w-full p-3 rounded-lg border-2 text-left font-medium transition-all duration-200 ${
                autoSelectedLength === option.id
                  ? "border-green-500 text-green-500 bg-transparent bg-opacity-10"
                  : "border-gray-600 text-gray-400 opacity-50"
              }`}
              data-testid={`length-${option.id}`}
              role="radio"
              aria-checked={autoSelectedLength === option.id}
              aria-describedby={
                option.description ? `length-desc-${option.id}` : undefined
              }
            >
              <div className="flex justify-between items-center">
                <span>{option.label}</span>
                {option.maxChars && (
                  <span className="text-xs opacity-75">
                    {option.maxChars} chars
                  </span>
                )}
              </div>
              {option.description && (
                <div
                  id={`length-desc-${option.id}`}
                  className="text-xs mt-1 opacity-75"
                >
                  {option.description}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          {showRemoveButton && onRemove && (
            <button
              onClick={handleRemove}
              disabled={isLoading}
              className="text-gray-400 hover:text-red-400 transition-colors font-medium px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="remove-button"
              aria-label={`Remove ${iterationTitle}`}
            >
              REMOVE
            </button>
          )}
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="text-white hover:text-gray-300 transition-colors font-medium px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="confirm-button"
          >
            {isLoading ? "APPLYING..." : "DONE"}
          </button>
        </div>
      </div>
    </div>
  );
};
