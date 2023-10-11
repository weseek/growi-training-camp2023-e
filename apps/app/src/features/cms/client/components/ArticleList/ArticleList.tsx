import React, { useCallback, useState } from 'react';

import type {
  IPageHasId,
} from '@growi/core';
import { useTranslation } from 'next-i18next';

import { toastSuccess } from '~/client/util/toastr';
import { ForceHideMenuItems } from '~/components/Common/Dropdown/PageItemControl';
import PaginationWrapper from '~/components/PaginationWrapper';
import { IPagingResult } from '~/interfaces/paging-result';
import { OnDeletedFunction } from '~/interfaces/ui';
import { useIsSharedUser } from '~/stores/context';
import {
  mutatePageTree,
  useSWRxPageList,
} from '~/stores/page-listing';


type SubstanceProps = {
  pagingResult: IPagingResult<IPageHasId> | undefined,
  activePage: number,
  setActivePage: (activePage: number) => void,
  onPagesDeleted?: OnDeletedFunction,
}

const ArticleListSubstance = (props: SubstanceProps): JSX.Element => {

  const { t } = useTranslation();

  const {
    pagingResult, activePage, setActivePage, onPagesDeleted,
  } = props;

  const pageDeletedHandler: OnDeletedFunction = useCallback((...args) => {
    const path = args[0];
    const isCompletely = args[2];
    if (path == null || isCompletely == null) {
      toastSuccess(t('deleted_page'));
    }
    else {
      toastSuccess(t('deleted_pages_completely', { path }));
    }

    mutatePageTree();
    if (onPagesDeleted != null) {
      onPagesDeleted(...args);
    }
  }, [onPagesDeleted, t]);

  if (pagingResult == null) {
    return (
      <div className="wiki">
        <div className="text-muted text-center">
          <i className="fa fa-2x fa-spinner fa-pulse mr-1"></i>
        </div>
      </div>
    );
  }

  const showPager = pagingResult.totalCount > pagingResult.limit;

  const rowList = pagingResult.items.map(page => (
    <tr><td>{page.path}</td></tr>
  ));

  return (
    <>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Article name</th>
          </tr>
        </thead>
        <tbody className="overflow-auto">
          {rowList}
        </tbody>
      </table>

      { showPager && (
        <div className="my-4">
          <PaginationWrapper
            activePage={activePage}
            changePage={selectedPageNumber => setActivePage(selectedPageNumber)}
            totalItemsCount={pagingResult.totalCount}
            pagingLimit={pagingResult.limit}
            align="center"
          />
        </div>
      ) }
    </>
  );
};

export type DescendantsPageListProps = {
  path: string,
  limit?: number,
  forceHideMenuItems?: ForceHideMenuItems,
}

export const ArticleList = (props: DescendantsPageListProps): JSX.Element => {
  const { path, limit, forceHideMenuItems } = props;

  const [activePage, setActivePage] = useState(1);

  const { data: isSharedUser } = useIsSharedUser();

  const { data: pagingResult, error, mutate } = useSWRxPageList(isSharedUser ? null : path, activePage, limit);

  if (error != null) {
    return (
      <div className="my-5">
        <div className="text-danger">{error.message}</div>
      </div>
    );
  }

  return (
    <ArticleListSubstance
      pagingResult={pagingResult}
      activePage={activePage}
      setActivePage={setActivePage}
      onPagesDeleted={() => mutate()}
    />
  );
};
