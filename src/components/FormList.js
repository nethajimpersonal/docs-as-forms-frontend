import React, { useState, useEffect } from 'react';
import { getRequest, deleteRequest } from '../services/apiService';
import { toast } from 'react-toastify';
import { API_ENDPOINTS } from '../config';
import FormFiller from './FormFiller';

const FormList = ({ searchTerm = '', onSearchTermChange, onFormsLoaded, onViewSubmissions, onViewSaved }) => {
  const [selectedForm, setSelectedForm] = useState(null);
  const [forms, setForms] = useState([]);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, formId: null, code: null, userInput: '' });

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const response = await getRequest(API_ENDPOINTS.FORMS);
        setForms(response.data.data);
      } catch (error) {
        console.error('Error fetching forms:', error);
      }
    };
    fetchForms();
  }, []);

  useEffect(() => {
    if (typeof onFormsLoaded === 'function') {
      onFormsLoaded(forms);
    }
  }, [forms, onFormsLoaded]);

  const handleDownload = async (templateId, title) => {
    try {
      const response = await getRequest(`${API_ENDPOINTS.DOWNLOAD_TEMPLATE}/${templateId}`, { responseType: 'blob' });
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${title}.doc`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Template download started!');
    } catch (error) {
      toast.error('Failed to download template.');
    }
  };

  const generateRandomCode = () => {
    return Math.floor(Math.random() * 900000) + 100000;
  };

  const handleDeleteClick = (formId) => {
    const randomCode = generateRandomCode();
    setDeleteModal({ isOpen: true, formId, code: randomCode, userInput: '' });
  };

  const handleDeleteConfirm = async () => {
    if (deleteModal.userInput === deleteModal.code.toString()) {
      try {
        await deleteRequest(`${API_ENDPOINTS.FORMS}/${deleteModal.formId}`);
        setForms(forms.filter(form => form.id !== deleteModal.formId));
        setDeleteModal({ isOpen: false, formId: null, code: null, userInput: '' });
        toast.success('Form deleted successfully!');
      } catch (error) {
        toast.error('Error deleting form.');
      }
    } else {
      toast.error('Invalid code. Please try again.');
    }
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, formId: null, code: null, userInput: '' });
  };

  const filteredForms = forms.filter((form) => {
    const title = (form.fields?.title || '').toLowerCase();
    return title.includes(searchTerm.trim().toLowerCase());
  });

  return (
    <>
      <div className="content">
        <div className="list-title-row">
          <div className="section-title">Form Templates</div>
          <div className="search-box">
            🔍
            <input
              type="text"
              placeholder="Search by title"
              value={searchTerm}
              onChange={(e) => onSearchTermChange && onSearchTermChange(e.target.value)}
            />
          </div>
        </div>

        <div className="list-scroll-area">
          <div className="list-header-row">
            <div className="slno-cell">Sl No</div>
            <div>Title</div>
            <div>Description</div>
            <div>Actions</div>
          </div>

          {filteredForms.length === 0 ? (
            <p>No forms available.</p>
          ) : (
            filteredForms.map((form, index) => {
              const title = form.fields.title;
              const description = form.fields.description;
              return (
                <div key={form.id} className="invoice-row">
                  <div className="slno-cell">{index + 1}</div>
                  <div>
                    <div className="invoice-date">{title}</div>
                  </div>

                  <div className="description-cell">
                    <div className="client-name description-clamp" title={description}>
                      {description}
                    </div>
                    <span className="description-tooltip">{description}</span>
                  </div>

                  <div className="row-actions">
                    <button className="pdf-btn" onClick={() => handleDownload(form.template_id, title)}>
                      ⬇️ Template
                    </button>
                    <button
                      className="icon-btn recents-icon-btn"
                      title="View Submissions"
                      onClick={() => onViewSubmissions && onViewSubmissions(form.id)}
                    >
                        📑
                    </button>
                    <button
                      className="icon-btn recents-save-btn"
                      title="View Saved"
                      onClick={() => onViewSaved && onViewSaved(form.id)}
                    >
                      🗂️
                    </button>
                    <button className="fix-btn" onClick={() => setSelectedForm(form)}>Fill Form</button>
                    <button className="icon-btn danger" title="Delete" onClick={() => handleDeleteClick(form.id)}>🗑️</button>
                  </div>

                </div>
              );
            })
          )}
        </div>
      </div>
      {selectedForm && (
        <FormFiller
          form={selectedForm}
          onClose={() => setSelectedForm(null)}
        />
      )}
      {deleteModal.isOpen && (
        <div className="modal-overlay" onClick={closeDeleteModal}>
          <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="delete-modal-header">
              <div>
                <h2>Confirm Delete</h2>
                <p>This action cannot be undone.</p>
              </div>
              <button className="delete-close" onClick={closeDeleteModal} aria-label="Close">✕</button>
            </div>

            <div className="delete-code-box">
              <div className="delete-code-label">Confirmation Code</div>
              <div className="delete-code-value">{deleteModal.code}</div>
            </div>

            <div className="delete-input">
              <input
                type="text"
                placeholder="Enter the above 6-digit code to confirm"
                value={deleteModal.userInput}
                onChange={(e) => setDeleteModal({ ...deleteModal, userInput: e.target.value })}
                maxLength="6"
              />
            </div>

            <div className="delete-actions">
              <button className="secondary" onClick={closeDeleteModal}>Cancel</button>
              <button className="danger" onClick={handleDeleteConfirm}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FormList;
