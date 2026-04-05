import React, { useState, useEffect } from 'react';
import { getRequest } from '../services/apiService';
import { toast } from 'react-toastify';
import { API_ENDPOINTS } from '../config';

const FormRecents = ({ formId, forms = [], onFormChange }) => {
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState([]);
  const [viewingValues, setViewingValues] = useState(null);
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
    getRequest(`${API_ENDPOINTS.FORMS}/${selectedFormId}/generated-files`)
      .then((res) => {
        const sorted = [...(res.data.files || [])].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setFiles(sorted);
      })
      .catch(() => {
        toast.error('Failed to load generated files.');
      })
      .finally(() => setLoading(false));
  }, [selectedFormId]);

  const handleFormChange = (e) => {
    const nextFormId = e.target.value;
    setSelectedFormId(nextFormId);
    if (typeof onFormChange === 'function') {
      onFormChange(nextFormId);
    }
  };

  const handleDownload = async (file) => {
    try {
      const response = await getRequest(
        `${API_ENDPOINTS.GENERATED_FILES}/${file.file_id}`,
        { responseType: 'blob' }
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

  const formatDate = (isoStr) => {
    const d = new Date(isoStr);
    return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  };

  return (
    <>
      <div className="content">
        <div className="section-title">Recents</div>

        <div className="recents-filter-row">
          <div className="recents-filter-group">
            <select id="recents-form-select" className="recents-form-select" value={selectedFormId} onChange={handleFormChange}>
              {forms.map((form) => (
                <option key={form.id} value={form.id}>
                  {form.fields?.title || 'Untitled Form'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {!selectedFormId ? (
          <div className="recents-empty">No files available.</div>
        ) : loading ? (
          <div className="recents-empty">Loading...</div>
        ) : files.length === 0 ? (
          <div className="recents-empty">No generated documents for this form yet.</div>
        ) : (
          <>
            <div className="recents-header-row">
              <div>File</div>
              <div>Generated At</div>
              <div>Fields Used</div>
              <div>Actions</div>
            </div>

            {files.map((file) => (
              <div key={file.file_id} className="recents-row">
                <div className="recents-filename" title={file.filename}>
                  {file.filename}
                </div>

                <div className="recents-date">{formatDate(file.created_at)}</div>

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
                  <button className="fix-btn" onClick={() => handleDownload(file)}>
                    Download
                  </button>
                </div>
              </div>
            ))}
          </>
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
    </>
  );
};

export default FormRecents;
