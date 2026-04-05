import React from 'react';

const Subnav = ({ tabs = [], activeTab, onTabChange, rightContent = null }) => {
  return (
    <div className="subnav">
      <div className="subnav-tabs">
        {tabs.map((tab) => (
          <span
            key={tab}
            className={tab === activeTab ? 'active' : ''}
            onClick={() => onTabChange && onTabChange(tab)}
          >
            {tab}
          </span>
        ))}
      </div>
      <div className="subnav-actions">{rightContent}</div>
    </div>
  );
};

export default Subnav;
