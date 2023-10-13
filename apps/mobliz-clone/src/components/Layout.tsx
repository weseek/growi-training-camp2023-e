import React from 'react';

import Header from '~/components/Header';

import SideMenu from './SideMenu';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      <Header />
      <main className="container d-flex mt-5">
        <div className="col-8">{children}</div>
        <div className="col-4 ms-5">
          <SideMenu />
        </div>
      </main>
      <footer className="bg-white mt-5 border-top">
        <p className="text-end p-4 mb-0"><small>© Copyright 2023 WESEEK Tech Blog. All rights reserved.</small></p>
      </footer>
    </>
  );
};

export default Layout;
