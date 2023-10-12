import { useState } from 'react';

import { useCurrentPathname } from '~/stores/context';

import { CourceUnitList } from '../CourceUnitList';

export const CourceView = (): JSX.Element => {

  const { data: currentPagePath } = useCurrentPathname();

  const [isDashboardMode, setDashboardMode] = useState(false);

  if (currentPagePath == null) {
    return <></>;
  }

  const Toggler = () => (
    <div className="btn-group btn-group-toggle" data-toggle="buttons">
      <label className={`btn btn-outline-secondary ${isDashboardMode ? 'active' : ''}`} onClick={() => setDashboardMode(true)}>
        <input type="radio" name="options" id="option1" checked={isDashboardMode} />
        <span className="icon icon-graph"></span>
      </label>
      <label className={`btn btn-outline-secondary ${isDashboardMode ? '' : 'active'}`} onClick={() => setDashboardMode(false)}>
        <input type="radio" name="options" id="option2" checked={!isDashboardMode} />
        <span className="icon icon-list"></span>
      </label>
    </div>
  );

  return (
    <>
      <div className="d-flex flex-column align-items-end">
        <Toggler />
      </div>
      <div className="mt-3">
        <CourceUnitList path={currentPagePath} />
      </div>
    </>
  );
};
