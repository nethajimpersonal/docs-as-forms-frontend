import React, { useState } from 'react';
import Topbar from '../components/Topbar';
import Subnav from '../components/Subnav';
import FormList from '../components/FormList';
import FormRecents from '../components/FormRecents';

const ListPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [formCount, setFormCount] = useState(0);
  const [activeTab, setActiveTab] = useState('All Forms');
  const [forms, setForms] = useState([]);
  const [recentsFormId, setRecentsFormId] = useState(null);

  const handleViewRecents = (formId) => {
    setRecentsFormId(formId);
    setActiveTab('Recents');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const subnavRight = activeTab === 'All Forms' ? (
    <>
      <div className="pill">{formCount} Total</div>
      <div className="search-box">
        🔍
        <input
          type="text"
          placeholder="Search by title"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </>
  ) : null;

  return (
    <div className="form-list-page">
      <Topbar actionLabel="New Form" actionPath="/create" />
      <Subnav
        tabs={['All Forms', 'Recents', 'Archived']}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        rightContent={subnavRight}
      />
      {activeTab === 'All Forms' && (
        <FormList
          searchTerm={searchTerm}
          onFormsCountChange={setFormCount}
          onFormsLoaded={setForms}
          onViewRecents={handleViewRecents}
        />
      )}
      {activeTab === 'Recents' && (
        <FormRecents
          formId={recentsFormId}
          forms={forms}
          onFormChange={setRecentsFormId}
        />
      )}
    </div>
  );
};

export default ListPage;

