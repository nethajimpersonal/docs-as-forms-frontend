import React, { useState, useEffect } from 'react';
import { getRequest, deleteRequest } from '../services/apiService';
import { toast } from 'react-toastify';
import { API_ENDPOINTS } from '../config';
import ConfirmDeleteByNameModal from './ConfirmDeleteByNameModal';

const FormSaved = ({ formId, forms = [], onFormChange }) => {
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState([]);
  const [viewingValues, setViewingValues] = useState(null);
  const [deletingFile, setDeletingFile] = useState(null);
  const [deleteNameInput, setDeleteNameInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedFormId, setSelectedFormId] = useState(formId || forms[0]?.id || '');

  useEffect(() => {
    if (formId) {
      setSelectedFormId(formId);
      return;
    }

    if (!selectedFormId && forms.length > 0) {
      setSelectedFormId(forms[0].id);
    }
  }, [formId, forms, selectedFormId]);

  useEffect(() => {
    if (!selectedFormId) {
      setFiles([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    getRequest(`${API_ENDPOINTS.SAVED}/${selectedFormId}`, {
      params: { search_text: searchText.trim() }
    })
      .then((res) => {
        const sorted = [...(res.data.saved_submissions || res.data.files || [])].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setFiles(sorted);
      })
      .catch(() => {
        toast.error('Failed to load saved files.');
      })
      .finally(() => setLoading(false));
  }, [selectedFormId, searchText]);

  const handleFormChange = (e) => {
    const nextFormId = e.target.value;
    setSelectedFormId(nextFormId);
    if (typeof onFormChange === 'function') {
      onFormChange(nextFormId);
    }
  };

  const handleRegenerate = async (file) => {
    try {
      const response = await getRequest(
        `${API_ENDPOINTS.SAVED}/${file.submission_id}/re-generate`,
        {
          responseType: 'blob',
          params: { form_id: selectedFormId }
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Download started!');
    } catch {
      toast.error('Failed to download file.');
    }
  };

  const openDeleteModal = (file) => {
    setDeletingFile(file);
    setDeleteNameInput('');
  };

  const closeDeleteModal = () => {
    if (isDeleting) {
      return;
    }
    setDeletingFile(null);
    setDeleteNameInput('');
  };

  const handleDelete = async () => {
    if (!deletingFile) {
      return;
    }

    const expectedName = deletingFile.reference_text || deletingFile.filename || '';
    if (deleteNameInput.trim() !== expectedName) {
      toast.error('Please type the exact name to confirm deletion.');
      return;
    }

    try {
      setIsDeleting(true);
      await deleteRequest(`${API_ENDPOINTS.SAVED}/${selectedFormId}/${deletingFile.submission_id}`);
      setFiles((prevFiles) => prevFiles.filter((item) => item.submission_id !== deletingFile.submission_id));
      toast.success('Saved submission deleted successfully!');
      closeDeleteModal();
    } catch {
      toast.error('Failed to delete saved submission.');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (isoStr) => {
    const d = new Date(isoStr);
    return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  };

  return (
    <>
      <div className="content">
        <div className="section-title">Saved</div>

        <div className="recents-filter-row saved-filter-row">
          <div className="recents-filter-group">
            <select id="saved-form-select" className="recents-form-select" value={selectedFormId} onChange={handleFormChange}>
              {forms.map((form) => (
                <option key={form.id} value={form.id}>
                  {form.fields?.title || 'Untitled Form'}
                </option>
              ))}
            </select>
          </div>
          <div className="search-box">
            🔍
            <input
              type="text"
              placeholder="Search submissions"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
        </div>

        {!selectedFormId ? (
          <div className="recents-empty">No files available.</div>
        ) : loading ? (
          <div className="recents-empty">Loading...</div>
        ) : files.length === 0 ? (
          <div className="recents-empty">No saved documents for this form yet.</div>
        ) : (
          <div className="list-scroll-area">
            <div className="recents-header-row">
              <div className="slno-cell">Sl No</div>
              <div>Name</div>
              <div>Saved At</div>
              <div>Fields Used</div>
              <div>Actions</div>
            </div>

            {files.map((file, index) => (
              <div key={file.submission_id} className="recents-row">
                <div className="slno-cell">{index + 1}</div>
                <div className="recents-filename" title={file.reference_text}>
                  {file.reference_text}
                </div>

                <div className="recents-date">{formatDate(file.saved_at)}</div>

                <div className="recents-count-cell">
                  <div className="amount">{Object.keys(file.values_used || {}).length}</div>
                  <div className="amount-label">Fields</div>
                </div>

                <div className="row-actions recents-actions-cell">
                  <button
                    className="icon-btn recents-view-btn"
                    title="View field values"
                    onClick={() => setViewingValues(file)}
                  >
                    👁️
                  </button>
                  <button
                    className="icon-btn danger"
                    title="Delete saved submission"
                    onClick={() => openDeleteModal(file)}
                  >
                    🗑️
                  </button>
                  <button className="fix-btn" onClick={() => handleRegenerate(file)}>
                    Re-generate
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {viewingValues && (
        <div className="modal-overlay" onClick={() => setViewingValues(null)}>
          <div
            className="modal-content recents-values-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="recents-values-header">
              <div>
                <div className="recents-values-title">Field Values Used</div>
                <div className="recents-values-subtitle">{viewingValues.filename}</div>
              </div>
              <button
                className="filler-close"
                onClick={() => setViewingValues(null)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="recents-values-grid">
              {Object.entries(viewingValues.values_used || {}).map(([key, value]) => (
                <div key={key} className="recents-value-row">
                  <div className="recents-value-key">{key}</div>
                  <div className="recents-value-val">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {deletingFile && (
        <ConfirmDeleteByNameModal
          name={deletingFile.reference_text || deletingFile.filename || 'Untitled'}
          inputValue={deleteNameInput}
          onInputChange={setDeleteNameInput}
          onClose={closeDeleteModal}
          onConfirm={handleDelete}
          isDeleting={isDeleting}
        />
      )}
    </>
  );
};

export default FormSaved;
