import React from 'react';

import { returnPathForURL } from '@growi/core/dist/utils/path-utils';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import { useSWRxCurrentPage, useIsLatestRevision } from '~/stores/page';

export const OldRevisionAlert = (): JSX.Element => {

  const { t } = useTranslation();
  const { data: isLatestRevision } = useIsLatestRevision();
  const { data: page } = useSWRxCurrentPage();

  if (page == null || isLatestRevision == null || isLatestRevision) {
    return <></>;
  }

  return (
    <div className="alert alert-warning">
      <strong>{t('Warning')}: </strong> {t('page_page.notice.version')}
      <Link href={returnPathForURL(page.path, page._id)}>
        <i className="icon-fw icon-arrow-right-circle"></i>{t('Show latest')}
      </Link>
    </div>
  );
};
