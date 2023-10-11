import React, { ReactNode, useState } from 'react';

import { useRouter } from 'next/router';

import CustomNav, { CustomNavTab, CustomNavDropdown } from './CustomNav';
import CustomTabContent from './CustomTabContent';

type CustomNavAndContentsProps = {
  navTabMapping: any,
  defaultTabIndex?: number,
  navigationMode?: 'both' | 'tab' | 'dropdown'|'null',
  tabContentClasses?: string[],
  breakpointToHideInactiveTabsDown?: 'xs' | 'sm' | 'md' | 'lg' | 'xl',
  navRightElement?: ReactNode
}


const CustomNavAndContents = (props: CustomNavAndContentsProps): JSX.Element => {
  const router = useRouter();
  const currentPage = router.pathname;
  console.log('currentPage', currentPage);

  const {
    navTabMapping, defaultTabIndex, navigationMode = 'tab', tabContentClasses = ['p-4'], breakpointToHideInactiveTabsDown, navRightElement,
  } = props;
  const [activeTab, setActiveTab] = useState(Object.keys(props.navTabMapping)[defaultTabIndex || 0]);

  let SelectedNav;
  if (navigationMode === 'null') {
    SelectedNav = null;
    console.log('仮で文字列のnull追加');
  }
  switch (navigationMode) {
    case 'tab':
      console.log('tab');
      // SelectedNav = null;
      SelectedNav = CustomNavTab;
      break;
    case 'dropdown':
      console.log('dropdown');
      SelectedNav = CustomNavDropdown;
      break;
    case 'both':
      console.log('both');
      SelectedNav = CustomNav;
      break;
  }

  return (
    <>
      {SelectedNav ? (
        <SelectedNav
          activeTab={activeTab}
          navTabMapping={navTabMapping}
          onNavSelected={setActiveTab}
          breakpointToHideInactiveTabsDown={breakpointToHideInactiveTabsDown}
          navRightElement={navRightElement}
        />
      ) : null}
      <CustomTabContent activeTab={activeTab} navTabMapping={navTabMapping} additionalClassNames={tabContentClasses} />
    </>
  );
};

export default CustomNavAndContents;
