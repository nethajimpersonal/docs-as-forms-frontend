import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_ENDPOINTS } from '../config';

const FormCreator = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sections, setSections] = useState([]);
  const [file, setFile] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

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
      await axios.post(API_ENDPOINTS.FORMS, formData);
      toast.success('Form created successfully!');
      // Reset form
      setTitle('');
      setDescription('');
      setSections([]);
      setFile(null);
      setFieldErrors({});
    } catch (error) {
      // Handle validation errors from backend
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
    <div className="container">
      <h2>Create Form</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title:</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Description:</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Upload DOC File:</label>
          <input type="file" accept=".doc,.docx" onChange={(e) => setFile(e.target.files[0])} required />
        </div>
        <h3>Sections</h3>
        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="section-card">
            <div className="form-group">
              <label>Section Name:</label>
              <input
                type="text"
                value={section.name}
                onChange={(e) => updateSectionName(sectionIndex, e.target.value)}
                required
              />
            </div>
            <button type="button" className="danger" onClick={() => removeSection(sectionIndex)}>Remove Section</button>
            <h4>Fields</h4>
            {section.fields.map((field, fieldIndex) => (
              <div key={fieldIndex} className="field-row">
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
                <div style={{ position: 'relative', flex: 1, minHeight: '44px' }}>
                  <input
                    type="text"
                    placeholder="Unique Key"
                    value={field.key}
                    onChange={(e) => updateField(sectionIndex, fieldIndex, 'key', e.target.value)}
                    required
                    style={fieldErrors[field.key] ? { borderColor: '#ef4444' } : {}}
                  />
                  <div style={{
                    color: '#ef4444',
                    fontSize: '11px',
                    marginTop: '2px',
                    height: '16px'
                  }}>
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
    </div>
  );
};

export default FormCreator;
