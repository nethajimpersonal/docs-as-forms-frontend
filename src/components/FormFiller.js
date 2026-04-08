import React, { useState } from 'react';
import { postRequest } from '../services/apiService';
import { toast } from 'react-toastify';
import { API_ENDPOINTS } from '../config';

const FormFiller = ({ form, onClose }) => {
  const [formData, setFormData] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const sections = JSON.parse(form.fields.sections);
  const fontFamily = form.fields?.style?.font_family || 'Default';
  const fontSize = form.fields?.style?.font_size ? `${form.fields.style.font_size} pt` : 'Default';

  const handleInputChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
    // Clear error for this field when user starts typing
    if (fieldErrors[key]) {
      setFieldErrors({ ...fieldErrors, [key]: null });
    }
  };

  const submitForm = async (closeAfterSubmit) => {
    if (isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      const apiFormData = new FormData();
      apiFormData.append('values', JSON.stringify(formData));
      
      const response = await postRequest(`${API_ENDPOINTS.FORMS}/${form.id}/submit`, apiFormData, {
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

      if (closeAfterSubmit) {
        toast.success('Form submitted and will be downloaded!');
        onClose();
      } else {
        setFormData({});
        setFieldErrors({});
        toast.success('Form submitted! Enter another set of values.');
      }
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await submitForm(true);
  };

  const handleSubmitAndContinue = async () => {
    await submitForm(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content filler-modal" onClick={(e) => e.stopPropagation()}>
        <div className="filler-topbar">
          <button className="filler-close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="filler-heading-row">
          <div className="filler-subtitle">{form.fields.title}</div>
          <div className="filler-style-meta">
            <div className="filler-meta-box">
              <span>Font Family</span>
              <strong>{fontFamily}</strong>
            </div>
            <div className="filler-meta-box">
              <span>Font Size</span>
              <strong>{fontSize}</strong>
            </div>
          </div>
        </div>

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
            <button
              type="button"
              className="secondary add-another-btn"
              onClick={handleSubmitAndContinue}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit & Add Another'}
            </button>
            <button type="submit" className="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormFiller;
