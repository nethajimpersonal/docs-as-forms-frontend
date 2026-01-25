import React, { useState } from 'react';
import axios from 'axios';
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
      
      const response = await axios.post(`${API_ENDPOINTS.FORMS}/${form.id}/fill`, apiFormData, {
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
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Fill Form: {form.fields.title}</h2>
        <form onSubmit={handleSubmit}>
          {sections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="section-card">
              <h3>{section.name}</h3>
              {section.fields.map((field, fieldIndex) => (
                <div key={fieldIndex} className="form-group">
                  <label>{field.name}</label>
                  <div style={{ position: 'relative', minHeight: '54px' }}>
                    <input
                      type={field.datatype === 'date' ? 'date' : 'text'}
                      value={formData[field.key] || ''}
                      onChange={(e) => handleInputChange(field.key, e.target.value)}
                      required
                      style={fieldErrors[field.key] ? { borderColor: '#ef4444' } : {}}
                    />
                    <div style={{
                      color: '#ef4444',
                      fontSize: '12px',
                      marginTop: '4px',
                      height: '16px'
                    }}>
                      {fieldErrors[field.key] && fieldErrors[field.key]}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
          <div className="actions">
            <button type="button" className="secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary">Submit</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormFiller;
