import React, { useState } from 'react';
import { postRequest } from '../services/apiService';
import { toast } from 'react-toastify';
import { API_ENDPOINTS } from '../config';

const FormFiller = ({ form, onClose }) => {
  const [formData, setFormData] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const sections = JSON.parse(form.fields.sections);

  const handleInputChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
    // Clear error for this field when user starts typing
    if (fieldErrors[key]) {
      setFieldErrors({ ...fieldErrors, [key]: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const apiFormData = new FormData();
      apiFormData.append('values', JSON.stringify(formData));
      
      const response = await postRequest(`${API_ENDPOINTS.FORMS}/${form.id}/fill`, apiFormData, {
        responseType: 'blob'
      });

      // Create a blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${form.fields.title}.doc`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Form submitted and will be downloaded!');
      onClose();
    } catch (error) {
      // Handle validation errors from backend
      if (error.response?.data?.detail?.keys_not_in_document) {
        const invalidKeys = error.response.data.detail.keys_not_in_document;
        const errors = {};
        invalidKeys.forEach(key => {
          errors[key] = `This field is required or invalid`;
        });
        setFieldErrors(errors);
        toast.error('Please fix the validation errors below.');
      } else {
        toast.error('Error submitting form.');
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content filler-modal" onClick={(e) => e.stopPropagation()}>
        <div className="filler-topbar">
          <button className="filler-close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="filler-subtitle">{form.fields.title}</div>

        <form className="filler-body" onSubmit={handleSubmit}>
          {sections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="filler-section">
              <h3 className="filler-section-title">{section.name}</h3>
              <div className="filler-grid">
                {section.fields.map((field, fieldIndex) => (
                  <div key={fieldIndex} className="filler-field">
                    <label>{field.name}</label>
                    <input
                      type={field.datatype === 'date' ? 'date' : 'text'}
                      value={formData[field.key] || ''}
                      onChange={(e) => handleInputChange(field.key, e.target.value)}
                      required
                      style={fieldErrors[field.key] ? { borderColor: '#ef4444' } : {}}
                    />
                    <div className="filler-error">
                      {fieldErrors[field.key] && fieldErrors[field.key]}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="filler-actions">
            <button type="button" className="secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary">Submit</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormFiller;
