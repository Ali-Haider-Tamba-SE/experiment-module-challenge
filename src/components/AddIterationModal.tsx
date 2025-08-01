import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface AddIterationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (prompt?: string) => void;
  title?: string;
  isLoading?: boolean;
  className?: string;
  nextIterationNumber?: number;
}

export const AddIterationModal: React.FC<AddIterationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Experiment Module",
  isLoading = false,
  className = "",
  nextIterationNumber,
}) => {
  const [prompt, setPrompt] = React.useState("");
  const [showPromptInput, setShowPromptInput] = React.useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);

  const handleClose = () => {
    setPrompt("");
    setShowPromptInput(false);
    onClose();
  };

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";

      // Focus first focusable element
      setTimeout(() => {
        firstFocusableRef.current?.focus();
      }, 100);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Handle backdrop click
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      handleClose();
    }
  };

  // Handle form submission
  const handleSubmit = () => {
    onConfirm(showPromptInput ? prompt.trim() || undefined : undefined);
    setPrompt("");
  };

  // Handle Enter key for form submission
  const handleInputKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && event.ctrlKey) {
      event.preventDefault();
      setPrompt("");
      handleSubmit();
    }
  };

  // Handle generate click
  const handleGenerate = () => {
    // In real app, this would call an AI service to generate a prompt
    const generatedPrompts = [
      "Create a compelling product description",
      "Write a social media post about innovation",
      "Generate a customer feedback survey",
      "Draft an email newsletter introduction",
      "Create a blog post outline about technology trends",
    ];

    const randomPrompt =
      generatedPrompts[Math.floor(Math.random() * generatedPrompts.length)];
    setPrompt(randomPrompt);
    setShowPromptInput(true);
  };

  // Handle key navigation within modal
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Tab") {
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
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
      data-testid="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <div
        ref={modalRef}
        className={`bg-gray-800 rounded-lg p-6 max-w-md w-full transform transition-all duration-200 ${className}`}
        data-testid="add-iteration-modal"
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 id="modal-title" className="text-white text-xl font-medium">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            data-testid="close-modal"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <div>
          {/* Module Info */}
          <div className="bg-black rounded-lg p-4 mb-6">
            <div className="text-gray-400 text-sm mb-2" data-testid="module-id">
              {`EM - ${nextIterationNumber}`}
            </div>
            <div className="text-gray-400" data-testid="status-text">
              {isLoading ? "Adding iteration..." : "Ready to add iteration"}
            </div>
          </div>

          {/* Prompt Input Section */}
          {showPromptInput ? (
            <div className="bg-black rounded-lg p-4 mb-6">
              <label
                htmlFor="prompt-input"
                className="block text-gray-300 text-sm font-medium mb-3"
              >
                Iteration Prompt
              </label>
              <textarea
                id="prompt-input"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="Enter your prompt here or generate one... (Ctrl+Enter to submit)"
                className="w-full bg-gray-900 text-white rounded-md px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                rows={3}
                data-testid="prompt-input"
                disabled={isLoading}
              />
              <div className="flex justify-end mt-2">
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="text-blue-400 hover:text-blue-300 text-sm underline cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="generate-prompt"
                  disabled={isLoading}
                >
                  Generate prompt
                </button>
              </div>
            </div>
          ) : (
            /* Instructions */
            <div className="bg-black rounded-lg p-4 mb-6">
              <div className="text-gray-400" id="modal-description">
                To add a new iteration, start typing a prompt or{" "}
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="underline cursor-pointer hover:text-white transition-colors disabled:opacity-50"
                  data-testid="generate-link"
                  disabled={isLoading}
                >
                  generate
                </button>{" "}
                one.
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <button
              ref={firstFocusableRef}
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors font-medium px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
              data-testid="cancel-button"
              disabled={isLoading}
            >
              CANCEL
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="text-white hover:text-gray-300 transition-colors font-medium px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="confirm-button"
              disabled={isLoading}
            >
              {isLoading ? "ADDING..." : "DONE"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
