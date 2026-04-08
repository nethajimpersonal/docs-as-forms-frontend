import React from 'react';

const SaveAsModal = ({
  fileName,
  referenceText,
  onReferenceTextChange,
  onClose,
  onConfirm,
  isSaving = false
}) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content save-as-modal" onClick={(e) => e.stopPropagation()}>
        <div className="save-as-header">
          <div>
            <h2>Save Submission</h2>
            <p>Choose a save name for this submission.</p>
          </div>
          <button className="delete-close" onClick={onClose} aria-label="Close" disabled={isSaving}>
            ✕
          </button>
        </div>

        <div className="save-as-file">{fileName}</div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onConfirm();
          }}
        >
          <div className="save-as-input">
            <label htmlFor="save-as-reference">Save As</label>
            <input
              id="save-as-reference"
              type="text"
              value={referenceText}
              onChange={(e) => onReferenceTextChange(e.target.value)}
              placeholder="Enter save name"
              autoFocus
              disabled={isSaving}
            />
          </div>

          <div className="save-as-actions">
            <button type="button" className="secondary" onClick={onClose} disabled={isSaving}>
              Cancel
            </button>
            <button type="submit" className="primary" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SaveAsModal;
