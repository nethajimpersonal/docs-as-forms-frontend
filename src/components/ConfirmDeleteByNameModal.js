import React from 'react';

const ConfirmDeleteByNameModal = ({
  name,
  inputValue,
  onInputChange,
  onClose,
  onConfirm,
  isDeleting = false
}) => {
  const isMatch = inputValue.trim() === name;

  return (
    <div className="modal-overlay" onClick={() => !isDeleting && onClose()}>
      <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
        <div className="delete-modal-header">
          <div>
            <h2>Confirm Delete</h2>
            <p>Type the exact name to delete this saved submission.</p>
          </div>
          <button className="delete-close" onClick={onClose} aria-label="Close" disabled={isDeleting}>
            ✕
          </button>
        </div>

        <div className="delete-name-box">
          <div className="delete-name-label">Name to confirm</div>
          <div className="delete-name-value">{name}</div>
        </div>

        <div className="delete-input">
          <input
            type="text"
            placeholder="Type the exact name to confirm"
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            disabled={isDeleting}
            autoFocus
          />
        </div>

        <div className="delete-actions">
          <button className="secondary" onClick={onClose} disabled={isDeleting}>Cancel</button>
          <button className="danger" onClick={onConfirm} disabled={!isMatch || isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteByNameModal;
