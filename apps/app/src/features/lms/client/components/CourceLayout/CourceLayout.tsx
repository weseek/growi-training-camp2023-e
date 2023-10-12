import React, { ReactNode } from 'react';

import dynamic from 'next/dynamic';

import { RawLayout } from '~/components/Layout/RawLayout';
import { GrowiNavbar } from '~/components/Navbar/GrowiNavbar';
import { PagePresentationModal } from '~/components/PagePresentationModal';


const SystemVersion = dynamic(() => import('~/components/SystemVersion'), { ssr: false });
const HotkeysManager = dynamic(() => import('~/components/Hotkeys/HotkeysManager'), { ssr: false });


type Props = {
  componentTitle?: string
  children?: ReactNode
}


export const CourceLayout = ({
  children, componentTitle,
}: Props): JSX.Element => {

  return (
    <RawLayout>
      <div>
        <GrowiNavbar />

        <header className="py-0 container-fluid">
          <h1 className="title px-3">{componentTitle}</h1>
        </header>
        <div id="main" className="main">
          <div className="container-fluid">
            {children}
          </div>
        </div>

        <PagePresentationModal />
        <SystemVersion />
      </div>

      <HotkeysManager />

    </RawLayout>
  );
};
