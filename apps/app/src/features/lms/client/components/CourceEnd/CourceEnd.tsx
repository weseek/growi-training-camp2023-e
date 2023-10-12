import { useCallback } from 'react';

import { usePagePresentationModal } from '~/stores/modal';

import styles from './CourceEnd.module.scss';

export const CourceEnd = (): JSX.Element => {

  const { close } = usePagePresentationModal();

  const clickHandler = useCallback(() => {
    close();
  }, [close]);

  return (
    <div className={`${styles['lms-cource-end']} d-flex justify-content-center`}>
      <button type="button" className="btn btn-lg btn-outline-success" onClick={clickHandler}>
        <div className="display-4">Save and exit</div>
      </button>
    </div>
  );
};
