import React, { useState } from 'react';
import Topbar from '../components/Topbar';
import Subnav from '../components/Subnav';
import FormList from '../components/FormList';
import FormSubmissions from '../components/FormRecents';
import FormSaved from '../components/FormSaved';

const ListPage = ({ isDarkMode, onToggleDarkMode }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All Forms');
  const [forms, setForms] = useState([]);
  const [submissionsFormId, setSubmissionsFormId] = useState(null);
  const [savedFormId, setSavedFormId] = useState(null);

  const handleViewSubmissions = (formId) => {
    setSubmissionsFormId(formId);
    setActiveTab('Submissions');
  };

  const handleViewSaved = (formId) => {
    setSavedFormId(formId);
    setActiveTab('Saved');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="form-list-page">
      <Topbar actionLabel="New Form" actionPath="/create" isDarkMode={isDarkMode} onToggleDarkMode={onToggleDarkMode} />
      <Subnav
        tabs={['All Forms', 'Submissions', 'Saved']}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
      {activeTab === 'All Forms' && (
        <FormList
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          onFormsLoaded={setForms}
          onViewSubmissions={handleViewSubmissions}
          onViewSaved={handleViewSaved}
        />
      )}
      {activeTab === 'Submissions' && (
        <FormSubmissions
          formId={submissionsFormId}
          forms={forms}
          onFormChange={setSubmissionsFormId}
        />
      )}
      {activeTab === 'Saved' && (
        <FormSaved
          formId={savedFormId}
          forms={forms}
          onFormChange={setSavedFormId}
        />
      )}
    </div>
  );
};

export default ListPage;

