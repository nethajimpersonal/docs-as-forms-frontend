import React from 'react';
import Topbar from '../components/Topbar';
import Subnav from '../components/Subnav';
import FormCreator from '../components/FormCreator';

const CreatePage = () => {
  return (
    <div className="form-creator-page">
      <Topbar actionLabel="Form List" actionPath="/list" />
      <Subnav
        tabs={['Details', 'Sections', 'Review']}
        activeTab="Details"
        rightContent={<div className="pill">Builder</div>}
      />
      <FormCreator />
    </div>
  );
};

export default CreatePage;
