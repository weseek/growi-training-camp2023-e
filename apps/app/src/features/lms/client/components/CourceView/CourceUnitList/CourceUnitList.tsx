import React, { useCallback } from 'react';

import type {
  IPageHasId,
} from '@growi/core';

import { IPagingResult } from '~/interfaces/paging-result';
import { useIsSharedUser } from '~/stores/context';
import { usePagePresentationModal } from '~/stores/modal';
import {
  useSWRxPageList,
} from '~/stores/page-listing';

import { CourceUnitHead, CourceUnitRow } from './CourceUnitRow';


type SubstanceProps = {
  pagingResult: IPagingResult<IPageHasId> | undefined,
}

const CourceUnitListSubstance = (props: SubstanceProps): JSX.Element => {

  const { pagingResult } = props;

  const { open: openPresentationModal } = usePagePresentationModal();

  const playHandler = useCallback((page: IPageHasId) => {
    openPresentationModal({
      pageId: page._id,
      revisionId: page.revision.toString(),
    });
  }, [openPresentationModal]);

  // const pageDeletedHandler: OnDeletedFunction = useCallback((...args) => {
  //   const path = args[0];
  //   const isCompletely = args[2];
  //   if (path == null || isCompletely == null) {
  //     toastSuccess(t('deleted_page'));
  //   }
  //   else {
  //     toastSuccess(t('deleted_pages_completely', { path }));
  //   }

  //   mutatePageTree();
  //   if (onPagesDeleted != null) {
  //     onPagesDeleted(...args);
  //   }
  // }, [onPagesDeleted, t]);

  if (pagingResult == null) {
    return (
      <div>
        <div className="text-muted text-center">
          <i className="fa fa-2x fa-spinner fa-pulse mr-1"></i>
        </div>
      </div>
    );
  }

  const rowList = pagingResult.items.map(page => (
    <CourceUnitRow key={page._id} page={page} onPlayButtonClicked={playHandler} />
  ));

  return (
    <table className="table table-bordered">
      <thead>
        <CourceUnitHead />
      </thead>
      <tbody className="overflow-auto">
        {rowList}
      </tbody>
    </table>
  );
};

export type CourceUnitListProps = {
  path: string,
}

export const CourceUnitList = (props: CourceUnitListProps): JSX.Element => {
  const { path } = props;

  const { data: isSharedUser } = useIsSharedUser();

  const { data: pagingResult, error } = useSWRxPageList(isSharedUser ? null : path);

  if (error != null) {
    return (
      <div className="my-5">
        <div className="text-danger">{error.message}</div>
      </div>
    );
  }

  return (
    <CourceUnitListSubstance
      pagingResult={pagingResult}
    />
  );
};
