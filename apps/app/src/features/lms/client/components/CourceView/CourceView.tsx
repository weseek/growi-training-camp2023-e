import { useState } from 'react';

import dynamic from 'next/dynamic';
import { TabContent, TabPane } from 'reactstrap';

import { useCurrentPathname } from '~/stores/context';

import { CourceUnitList } from './CourceUnitList';


const CourceDashboard = dynamic(() => import('./CourceDashboard').then(mod => mod.CourceDashboard), {
  ssr: false,
});

export const CourceView = (): JSX.Element => {

  const { data: currentPagePath } = useCurrentPathname();

  const [isDashboardMode, setDashboardMode] = useState(false);

  if (currentPagePath == null) {
    return <></>;
  }

  const Toggler = () => (
    <div className="list-group sticky-top d-none d-lg-block">
      <button type="button" className={`list-group-item list-group-item-action ${isDashboardMode ? 'active' : ''}`} onClick={() => setDashboardMode(true)}>
        <span className="icon icon-grid mr-1"></span>Dashboard
      </button>
      <button type="button" className={`list-group-item list-group-item-action ${isDashboardMode ? '' : 'active'}`} onClick={() => setDashboardMode(false)}>
        <span className="icon icon-list mr-1"></span>List
      </button>
    </div>
  );

  return (
    <div className="row">
      <div className="col-lg-3">
        <Toggler />
      </div>
      <div className="col-lg-9">
        <TabContent activeTab={isDashboardMode ? 'dashboard' : 'list'}>
          <TabPane tabId="dashboard">
            <CourceDashboard />
          </TabPane>
          <TabPane tabId="list">
            <CourceUnitList path={currentPagePath} />
          </TabPane>
        </TabContent>
      </div>
    </div>
  );
};
