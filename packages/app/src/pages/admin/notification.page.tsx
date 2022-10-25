import { isClient } from '@growi/core';
import {
  NextPage, GetServerSideProps, GetServerSidePropsContext,
} from 'next';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import { Container, Provider } from 'unstated';

import AdminNotificationContainer from '~/client/services/AdminNotificationContainer';
import { SupportedActionType } from '~/interfaces/activity';
import { CommonProps, useCustomTitle } from '~/pages/utils/commons';

import { retrieveServerSideProps } from '../../utils/admin-page-util';

const AdminLayout = dynamic(() => import('~/components/Layout/AdminLayout'), { ssr: false });

const NotificationSetting = dynamic(() => import('~/components/Admin/Notification/NotificationSetting'), { ssr: false });


type Props = CommonProps & {
  currentUser: any,

  // nodeVersion: string,
  // npmVersion: string,
  // yarnVersion: string,
  // installedPlugins: any,
  envVars: any,
  isAclEnabled: boolean,
  isSearchServiceConfigured: boolean,
  isSearchServiceReachable: boolean,
  isMailerSetup: boolean,
  auditLogEnabled: boolean,
  auditLogAvailableActions: SupportedActionType[],

  customizeTitle: string,
  siteUrl: string,
};


const AdminExternalNotificationPage: NextPage<Props> = (props) => {
  const { t } = useTranslation();

  const title = t('external_notification.external_notification');
  const injectableContainers: Container<any>[] = [];

  if (isClient()) {
    const adminNotificationContainer = new AdminNotificationContainer();

    injectableContainers.push(adminNotificationContainer);
  }


  return (
    <Provider inject={[...injectableContainers]}>
      <AdminLayout title={useCustomTitle(props, title)} componentTitle={title} >
        <NotificationSetting />
      </AdminLayout>
    </Provider>
  );

};


export const getServerSideProps: GetServerSideProps = async(context: GetServerSidePropsContext) => {
  const props = await retrieveServerSideProps(context);
  return props;
};


export default AdminExternalNotificationPage;
