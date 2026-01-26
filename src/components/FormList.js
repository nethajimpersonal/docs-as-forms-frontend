import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRequest, deleteRequest } from '../services/apiService';
import { toast } from 'react-toastify';
import { API_ENDPOINTS, API_BASE_URL } from '../config';
import FormFiller from './FormFiller';
import { useAuth } from '../context/AuthContext';

const FormList = () => {
  const [selectedForm, setSelectedForm] = useState(null);
  const [forms, setForms] = useState([]);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, formId: null, code: null, userInput: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => setShowLogoutConfirm(true);
  const cancelLogout = () => setShowLogoutConfirm(false);
  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    logout();
  };

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

  const handleDownload = async (templatePath, title) => {
    try {
      const response = await getRequest(templatePath, { responseType: 'blob' });
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
    <div className="form-list-page">
      <div className="topbar">
        <div className="topbar-left">
          <div className="logo">D2F</div>
          <div className="nav-links">
            <span className="active">Forms</span>
          </div>
        </div>
        <div className="topbar-right">
          <button className="new-invoice-btn" onClick={() => navigate('/create')}>New Form</button>
          <button className="logout-topbar-btn" onClick={handleLogout}>Logout</button>
          <div className="avatar" />
        </div>
      </div>

      <div className="subnav">
        <div className="subnav-tabs">
          <span className="active">All Forms</span>
          <span>Recent</span>
          <span>Archived</span>
        </div>
        <div className="subnav-actions">
          <div className="pill">{forms.length} Total</div>
          <div className="search-box">
            🔍
            <input
              type="text"
              placeholder="Search by title"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="content">
        <div className="section-title">Form Templates</div>

        <div className="list-header-row">
          <div>Title</div>
          <div>Description</div>
          <div>Fields</div>
          <div>Template</div>
          <div>Actions</div>
        </div>

        {filteredForms.length === 0 ? (
          <p>No forms available.</p>
        ) : (
          filteredForms.map((form) => {
            const title = form.fields.title;
            const description = form.fields.description;
            const templatePath = `/api/${form.template_path}`;
            const sections = JSON.parse(form.fields.sections || '[]');
            const fieldCount = sections.reduce((count, section) => count + (section.fields?.length || 0), 0);
            return (
              <div key={form.id} className="invoice-row">
                <div>
                  <div className="invoice-date">{title}</div>
                </div>

                <div className="description-cell">
                  <div className="client-name description-clamp" title={description}>
                    {description}
                  </div>
                  <span className="description-tooltip">{description}</span>
                </div>

                <div>
                  <div className="amount">{fieldCount}</div>
                  <div className="amount-label">Fields</div>
                </div>

                <button className="pdf-btn" onClick={() => handleDownload(templatePath, title)}>
                  Download template
                </button>

                <div className="row-actions">
                  <button className="fix-btn" onClick={() => setSelectedForm(form)}>Fill Form</button>
                  <button className="icon-btn danger" title="Delete" onClick={() => handleDeleteClick(form.id)}>🗑️</button>
                </div>

              </div>
            );
          })
        )}
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
      {showLogoutConfirm && (
        <div className="modal-overlay" onClick={cancelLogout}>
          <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Logout?</h3>
            <p>You will be signed out of Docs as Forms.</p>
            <div className="confirm-actions">
              <button className="secondary" type="button" onClick={cancelLogout}>Cancel</button>
              <button className="danger" type="button" onClick={confirmLogout}>Logout</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormList;
