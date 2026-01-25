import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { postRequest } from '../services/apiService';
import { toast } from 'react-toastify';
import { API_ENDPOINTS } from '../config';
import { useAuth } from '../context/AuthContext';

const FormCreator = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sections, setSections] = useState([]);
  const [file, setFile] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();
  const { logout } = useAuth();

  const addSection = () => {
    setSections([...sections, { name: '', fields: [] }]);
  };

  const updateSectionName = (index, name) => {
    const newSections = [...sections];
    newSections[index].name = name;
    setSections(newSections);
  };

  const addField = (sectionIndex) => {
    const newSections = [...sections];
    newSections[sectionIndex].fields.push({ name: '', datatype: 'string', key: '' });
    setSections(newSections);
  };

  const updateField = (sectionIndex, fieldIndex, key, value) => {
    const newSections = [...sections];
    newSections[sectionIndex].fields[fieldIndex][key] = value;
    setSections(newSections);
    
    // Clear error for this field when user edits the key
    if (key === 'key' && fieldErrors[value]) {
      setFieldErrors({ ...fieldErrors, [value]: null });
    }
  };

  const removeSection = (index) => {
    setSections(sections.filter((_, i) => i !== index));
  };

  const removeField = (sectionIndex, fieldIndex) => {
    const newSections = [...sections];
    newSections[sectionIndex].fields = newSections[sectionIndex].fields.filter((_, i) => i !== fieldIndex);
    setSections(newSections);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please upload a DOC file.');
      return;
    }
    const fields = {
      title,
      description,
      sections: JSON.stringify(sections)
    }
    const formData = new FormData();
    formData.append('fields',JSON.stringify(fields));
    formData.append('file', file);

    try {
      await postRequest(API_ENDPOINTS.FORMS, formData);
      toast.success('Form created successfully!');
      setTitle('');
      setDescription('');
      setSections([]);
      setFile(null);
      setFieldErrors({});
    } catch (error) {
      if (error.response?.data?.detail?.unknown_keys) {
        const unknownKeys = error.response.data.detail.unknown_keys;
        const errors = {};
        unknownKeys.forEach(key => {
          errors[key] = `This key is not valid in the document`;
        });
        setFieldErrors(errors);
        toast.error('Please fix the validation errors below.');
      } else {
        toast.error('Error creating form.');
      }
    }
  };

  return (
    <div className="form-creator-page">
      <div className="topbar">
        <div className="topbar-left">
          <div className="logo">D2F</div>
          <div className="nav-links">
            <span className="active">Create</span>
          </div>
        </div>
        <div className="topbar-right">
          <button className="new-invoice-btn" onClick={() => navigate('/list')}>Form List</button>
          <button className="logout-topbar-btn" onClick={logout}>Logout</button>
          <div className="avatar" />
        </div>
      </div>

      <div className="subnav">
        <div className="subnav-tabs">
          <span className="active">Details</span>
          <span>Sections</span>
          <span>Review</span>
        </div>
        <div className="subnav-actions">
          <div className="pill">Builder</div>
        </div>
      </div>

      <div className="content">
        <div className="section-title">Create Form</div>
        <div className="creator-layout">
          <form className="creator-card" onSubmit={handleSubmit}>
          <div className="creator-grid">
            <div className="form-group">
              <label>Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Upload DOC File</label>
              <input type="file" accept=".doc,.docx" onChange={(e) => setFile(e.target.files[0])} required />
            </div>
          </div>

          <h3 className="creator-section-title">Sections</h3>
          {sections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="creator-section-card">
              <div className="form-group">
                <label>Section Name</label>
                <input
                  type="text"
                  value={section.name}
                  onChange={(e) => updateSectionName(sectionIndex, e.target.value)}
                  required
                />
              </div>
              <button type="button" className="danger" onClick={() => removeSection(sectionIndex)}>Remove Section</button>
              <h4 className="creator-fields-title">Fields</h4>
              {section.fields.map((field, fieldIndex) => (
                <div key={fieldIndex} className="creator-field-row">
                  <input
                    type="text"
                    placeholder="Field Name"
                    value={field.name}
                    onChange={(e) => updateField(sectionIndex, fieldIndex, 'name', e.target.value)}
                    required
                  />
                  <select
                    value={field.datatype}
                    onChange={(e) => updateField(sectionIndex, fieldIndex, 'datatype', e.target.value)}
                  >
                    <option value="string">Text</option>
                    <option value="date">Date</option>
                    <option value="number">Number</option>
                  </select>
                  <div className="creator-field-key">
                    <input
                      type="text"
                      placeholder="Unique Key"
                      value={field.key}
                      onChange={(e) => updateField(sectionIndex, fieldIndex, 'key', e.target.value)}
                      required
                      style={fieldErrors[field.key] ? { borderColor: '#ef4444' } : {}}
                    />
                    <div className="creator-error">
                      {fieldErrors[field.key] && fieldErrors[field.key]}
                    </div>
                  </div>
                  <button type="button" className="danger" onClick={() => removeField(sectionIndex, fieldIndex)}>Remove Field</button>
                </div>
              ))}
              <button type="button" className="secondary" onClick={() => addField(sectionIndex)}>Add Field</button>
            </div>
          ))}

          <div className="actions">
            <button type="button" className="secondary" onClick={addSection}>Add Section</button>
            <button type="submit" className="primary">Create Form</button>
          </div>
          </form>

          <aside className="creator-preview">
            <div className="preview-header">
              <div>
                <div className="preview-title">Live Preview</div>
                <div className="preview-subtitle">How it will look in Form Filler</div>
              </div>
            </div>

            <div className="preview-card">
              <div className="preview-form-title">{title || 'Form Title'}</div>
              <div className="preview-form-subtitle">{description || 'Form description will appear here.'}</div>

              {sections.length === 0 ? (
                <div className="preview-empty">Add sections and fields to see a preview.</div>
              ) : (
                sections.map((section, sectionIndex) => (
                  <div key={sectionIndex} className="preview-section">
                    <div className="preview-section-title">{section.name || `Section ${sectionIndex + 1}`}</div>
                    <div className="preview-grid">
                      {section.fields.map((field, fieldIndex) => (
                        <div key={fieldIndex} className="preview-field">
                          <label>{field.name || 'Field Name'}</label>
                          <div className="preview-input">
                            {field.datatype === 'date' ? 'YYYY-MM-DD' : 'Enter value'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default FormCreator;