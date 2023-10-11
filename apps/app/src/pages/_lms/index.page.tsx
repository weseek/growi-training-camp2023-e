import React, { ReactNode } from 'react';

import type { IUser, IUserHasId } from '@growi/core';
import type { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import dynamic from 'next/dynamic';
import Head from 'next/head';

import { GrowiSubNavigation } from '~/components/Navbar/GrowiSubNavigation';
import type { CrowiRequest } from '~/interfaces/crowi-request';
import { useCurrentPageId } from '~/stores/page';
import { useDrawerMode } from '~/stores/ui';

import { BasicLayout } from '../../components/Layout/BasicLayout';
import {
  useCurrentUser, useCurrentPathname, useGrowiCloudUri,
  useIsSearchServiceConfigured, useIsSearchServiceReachable,
  useIsSearchScopeChildrenAsDefault, useIsSearchPage, useShowPageLimitationXL,
} from '../../stores/context';
import type { NextPageWithLayout } from '../_app.page';
import type { CommonProps } from '../utils/commons';
import {
  getServerSideCommonProps, getNextI18NextConfig, generateCustomTitleForPage, useInitSidebarConfig,
} from '../utils/commons';

const CourceList = dynamic(() => import('~/features/lms/client/components/CourceList').then(mod => mod.CourceList), { ssr: false });

type Props = CommonProps & {
  currentUser: IUser,
  isSearchServiceConfigured: boolean,
  isSearchServiceReachable: boolean,
  isSearchScopeChildrenAsDefault: boolean,
  showPageLimitationXL: number,
};

const LmsPage: NextPageWithLayout<CommonProps> = (props: Props) => {
  useCurrentUser(props.currentUser ?? null);

  useGrowiCloudUri(props.growiCloudUri);

  useIsSearchServiceConfigured(props.isSearchServiceConfigured);
  useIsSearchServiceReachable(props.isSearchServiceReachable);
  useIsSearchScopeChildrenAsDefault(props.isSearchScopeChildrenAsDefault);

  useIsSearchPage(false);
  useCurrentPageId(null);
  useCurrentPathname('/_lms');

  // init sidebar config with UserUISettings and sidebarConfig
  useInitSidebarConfig(props.sidebarConfig, props.userUISettings);

  useShowPageLimitationXL(props.showPageLimitationXL);

  const { data: isDrawerMode } = useDrawerMode();

  const title = generateCustomTitleForPage(props, 'GROWI e-Learning Cource Manager');

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <div className="dynamic-layout-root">
        <header className="py-0 position-relative">
          <GrowiSubNavigation
            pagePath="/GROWI e-Learning Cource Manager"
            showDrawerToggler={isDrawerMode}
            isTagLabelsDisabled
            isDrawerMode={isDrawerMode}
            additionalClasses={['container-fluid']}
          />
        </header>

        <div className="content-main container-lg grw-container-convertible mb-5 pb-5">
          <CourceList />
        </div>

        <div id="grw-fav-sticky-trigger" className="sticky-top"></div>
      </div>
    </>
  );
};

type LayoutProps = Props & {
  children?: ReactNode,
}

const Layout = ({ children, ...props }: LayoutProps): JSX.Element => {
  // init sidebar config with UserUISettings and sidebarConfig
  useInitSidebarConfig(props.sidebarConfig, props.userUISettings);

  return <BasicLayout>{children}</BasicLayout>;
};

LmsPage.getLayout = function getLayout(page) {
  return (
    <>
      <Layout {...page.props}>
        {page}
      </Layout>
    </>
  );
};

function injectServerConfigurations(context: GetServerSidePropsContext, props: Props): void {
  const req: CrowiRequest = context.req as CrowiRequest;
  const { crowi } = req;
  const {
    searchService, configManager,
  } = crowi;

  props.isSearchServiceConfigured = searchService.isConfigured;
  props.isSearchServiceReachable = searchService.isReachable;
  props.isSearchScopeChildrenAsDefault = configManager.getConfig('crowi', 'customize:isSearchScopeChildrenAsDefault');
  props.showPageLimitationXL = crowi.configManager.getConfig('crowi', 'customize:showPageLimitationXL');

  props.sidebarConfig = {
    isSidebarDrawerMode: configManager.getConfig('crowi', 'customize:isSidebarDrawerMode'),
    isSidebarClosedAtDockMode: configManager.getConfig('crowi', 'customize:isSidebarClosedAtDockMode'),
  };

}

/**
 * for Server Side Translations
 * @param context
 * @param props
 * @param namespacesRequired
 */
async function injectNextI18NextConfigurations(context: GetServerSidePropsContext, props: Props, namespacesRequired?: string[] | undefined): Promise<void> {
  const nextI18NextConfig = await getNextI18NextConfig(serverSideTranslations, context, namespacesRequired);
  props._nextI18Next = nextI18NextConfig._nextI18Next;
}

export const getServerSideProps: GetServerSideProps = async(context: GetServerSidePropsContext) => {
  const req = context.req as CrowiRequest<IUserHasId & any>;
  const { user } = req;
  const result = await getServerSideCommonProps(context);

  if (!('props' in result)) {
    throw new Error('invalid getSSP result');
  }
  const props: Props = result.props as Props;

  if (user != null) {
    props.currentUser = user.toObject();
  }
  injectServerConfigurations(context, props);
  await injectNextI18NextConfigurations(context, props, ['translation']);

  return {
    props,
  };
};

export default LmsPage;
