import { createContext, useCallback, useContext, useState } from "react";

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [request, setRequest] = useState(null);

  const confirm = useCallback((options = {}) => {
    return new Promise((resolve) => {
      setRequest({
        title: options.title || "Are you sure?",
        message: options.message || "",
        confirmLabel: options.confirmLabel || "Confirm",
        cancelLabel: options.cancelLabel || "Cancel",
        danger: !!options.danger,
        resolve,
      });
    });
  }, []);

  function handleConfirm() {
    request.resolve(true);
    setRequest(null);
  }

  function handleCancel() {
    request.resolve(false);
    setRequest(null);
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {request && (
        <div className="modal-overlay">
          <div className="modal confirm-modal">
            <h2>{request.title}</h2>
            {request.message && (
              <p className="modal-subtitle">{request.message}</p>
            )}
            <div className="modal-actions">
              <button type="button" className="secondary" onClick={handleCancel}>
                {request.cancelLabel}
              </button>
              <button
                type="button"
                className={request.danger ? "danger" : "primary"}
                onClick={handleConfirm}
              >
                {request.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return ctx;
}