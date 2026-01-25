import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_ENDPOINTS, API_BASE_URL } from '../config';
import FormFiller from './FormFiller';

const FormList = () => {
  const [selectedForm, setSelectedForm] = useState(null);
  const [forms, setForms] = useState([]);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, formId: null, code: null, userInput: '' });

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const response = await axios.get(API_ENDPOINTS.FORMS);
        setForms(response.data.data);
      } catch (error) {
        console.error('Error fetching forms:', error);
      }
    };
    fetchForms();
  }, []);

  const handleView = (fileUrl) => {
    window.open(fileUrl, '_blank');
  };

  const handleDownload = (fileUrl, title) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = `${title}.doc`;
    link.click();
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
        await axios.delete(`${API_ENDPOINTS.FORMS}/${deleteModal.formId}`);
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

  return (
    <div className="container">
      <h2>Form List</h2>
      {forms.length === 0 ? (
        <p>No forms available.</p>
      ) : (
        forms.map((form) => {
          const title = form.fields.title;
          const description = form.fields.description;
          const fileUrl = `${API_BASE_URL}/api/${form.template_path}`;
          return (
            <div key={form.id} className="section-card">
              <h3>{title}</h3>
              <p>{description}</p>
              <div className="actions">
                <button className="primary" onClick={() => handleView(fileUrl)}>View File</button>
                <button className="secondary" onClick={() => handleDownload(fileUrl, title)}>Download File</button>
                <button className="primary" onClick={() => setSelectedForm(form)}>Fill</button>
                <button className="danger" onClick={() => handleDeleteClick(form.id)}>Delete</button>
              </div>
            </div>
          );
        })
      )}
      {selectedForm && (
        <FormFiller
          form={selectedForm}
          onClose={() => setSelectedForm(null)}
        />
      )}
      {deleteModal.isOpen && (
        <div className="modal-overlay" onClick={closeDeleteModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ borderTop: '4px solid #ef4444' }}>
            <h2 style={{ color: '#ef4444' }}>Confirm Delete</h2>
            <p>This action cannot be undone. Enter the code below to confirm deletion:</p>
            <div style={{
              backgroundColor: '#fef2f2',
              border: '2px solid #ef4444',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '16px',
              textAlign: 'center'
            }}>
              <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: '12px' }}>Verification Code</p>
              <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#ef4444', letterSpacing: '4px' }}>
                {deleteModal.code}
              </p>
            </div>
            <div className="form-group">
              <label>Enter Code:</label>
              <input
                type="text"
                placeholder="Enter the 6-digit code"
                value={deleteModal.userInput}
                onChange={(e) => setDeleteModal({ ...deleteModal, userInput: e.target.value })}
                maxLength="6"
              />
            </div>
            <div className="actions">
              <button className="secondary" onClick={closeDeleteModal}>Cancel</button>
              <button className="danger" onClick={handleDeleteConfirm}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormList;
