import React, { ReactNode } from 'react';

import type { IUser, IUserHasId } from '@growi/core';
import type { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import dynamic from 'next/dynamic';
import Head from 'next/head';

import { GrowiSubNavigation } from '~/components/Navbar/GrowiSubNavigation';
import { CourceLayout } from '~/features/lms/client/components/CourceLayout';
import type { CrowiRequest } from '~/interfaces/crowi-request';
import type { RendererConfig } from '~/interfaces/services/renderer';
import { useCurrentPageId } from '~/stores/page';
import { useDrawerMode } from '~/stores/ui';

import {
  useCurrentUser, useCurrentPathname, useGrowiCloudUri,
  useIsSearchServiceConfigured, useIsSearchServiceReachable,
  useIsSearchScopeChildrenAsDefault, useIsSearchPage, useShowPageLimitationXL, useRendererConfig,
} from '../../stores/context';
import type { NextPageWithLayout } from '../_app.page';
import type { CommonProps } from '../utils/commons';
import {
  getServerSideCommonProps, getNextI18NextConfig, generateCustomTitleForPage, useInitSidebarConfig,
} from '../utils/commons';

const CourceView = dynamic(() => import('~/features/lms/client/components').then(mod => mod.CourceView), { ssr: false });

type Props = CommonProps & {
  currentUser: IUser,
  isSearchServiceConfigured: boolean,
  isSearchServiceReachable: boolean,
  isSearchScopeChildrenAsDefault: boolean,
  showPageLimitationXL: number,

  courceTitle: string,

  rendererConfig: RendererConfig,
};

const CourcePage: NextPageWithLayout<CommonProps> = (props: Props) => {
  useCurrentUser(props.currentUser ?? null);

  useGrowiCloudUri(props.growiCloudUri);

  useIsSearchServiceConfigured(props.isSearchServiceConfigured);
  useIsSearchServiceReachable(props.isSearchServiceReachable);
  useIsSearchScopeChildrenAsDefault(props.isSearchScopeChildrenAsDefault);

  useIsSearchPage(false);
  useCurrentPageId(null);
  useCurrentPathname(props.currentPathname);

  // init sidebar config with UserUISettings and sidebarConfig
  useInitSidebarConfig(props.sidebarConfig, props.userUISettings);

  useRendererConfig(props.rendererConfig);

  useShowPageLimitationXL(props.showPageLimitationXL);

  const { data: isDrawerMode } = useDrawerMode();

  const title = generateCustomTitleForPage(props, props.currentPathname);


  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <div className="dynamic-layout-root">
        <div className="container-fluid">
          <header className="mb-5">
            <h1>{props.courceTitle}</h1>
          </header>
          <CourceView />
        </div>
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

  return <CourceLayout>{children}</CourceLayout>;
};

CourcePage.getLayout = function getLayout(page) {
  return (
    <>
      <Layout {...page.props}>
        {page}
      </Layout>
    </>
  );
};

async function injectCourceData(context: GetServerSidePropsContext, props: Props): Promise<void> {
  const { namespace } = context.query;

  if (namespace == null) {
    return;
  }
  if (Array.isArray(namespace)) {
    throw new Error('The query "namespace" must not be an array.');
  }

  const { LmsCource } = await import('~/features/lms/server/models');

  const cource = await LmsCource.findByNamespace(namespace);

  if (cource != null) {
    props.courceTitle = cource.title;
  }
}

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

  props.rendererConfig = {
    isEnabledLinebreaks: configManager.getConfig('markdown', 'markdown:isEnabledLinebreaks'),
    isEnabledLinebreaksInComments: configManager.getConfig('markdown', 'markdown:isEnabledLinebreaksInComments'),
    isEnabledMarp: configManager.getConfig('crowi', 'customize:isEnabledMarp'),
    adminPreferredIndentSize: configManager.getConfig('markdown', 'markdown:adminPreferredIndentSize'),
    isIndentSizeForced: configManager.getConfig('markdown', 'markdown:isIndentSizeForced'),

    drawioUri: configManager.getConfig('crowi', 'app:drawioUri'),
    plantumlUri: configManager.getConfig('crowi', 'app:plantumlUri'),

    // XSS Options
    isEnabledXssPrevention: configManager.getConfig('markdown', 'markdown:rehypeSanitize:isEnabledPrevention'),
    xssOption: configManager.getConfig('markdown', 'markdown:rehypeSanitize:option'),
    attrWhitelist: JSON.parse(crowi.configManager.getConfig('markdown', 'markdown:rehypeSanitize:attributes')),
    tagWhitelist: crowi.configManager.getConfig('markdown', 'markdown:rehypeSanitize:tagNames'),
    highlightJsStyleBorder: crowi.configManager.getConfig('crowi', 'customize:highlightJsStyleBorder'),
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

  await injectCourceData(context, props);
  injectServerConfigurations(context, props);
  await injectNextI18NextConfigurations(context, props, ['translation']);

  return {
    props,
  };
};

export default CourcePage;
