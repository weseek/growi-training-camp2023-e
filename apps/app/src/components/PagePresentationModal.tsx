import React, { useCallback } from 'react';

import type { PresentationProps } from '@growi/presentation';
import { useFullScreen } from '@growi/ui/dist/utils';
import dynamic from 'next/dynamic';
import type { ReactMarkdownOptions } from 'react-markdown/lib/react-markdown';
import {
  Modal, ModalBody,
} from 'reactstrap';

import { useIsEnabledMarp } from '~/stores/context';
import { usePagePresentationModal } from '~/stores/modal';
import { useSWRxCurrentPage, useSWRxPageRevision } from '~/stores/page';
import { usePresentationViewOptions } from '~/stores/renderer';
import { useNextThemes } from '~/stores/use-next-themes';


import styles from './PagePresentationModal.module.scss';


const Presentation = dynamic<PresentationProps>(() => import('./Presentation/Presentation').then(mod => mod.Presentation), {
  ssr: false,
  loading: () => (
    <i className="fa fa-4x fa-spinner fa-pulse text-muted"></i>
  ),
});


export const PagePresentationModal = (): JSX.Element => {

  const { data: currentPage } = useSWRxCurrentPage();
  const { data: presentationModalData, close: closePresentationModal } = usePagePresentationModal();

  const { isOpened = false, page: specifiedPage, rendererOptions: specifiedRendererOptions } = presentationModalData ?? {};

  const { data: specifiedRevision } = useSWRxPageRevision(
    isOpened ? specifiedPage?.pageId : undefined,
    isOpened ? specifiedPage?.revisionId : undefined,
  );

  const { isDarkMode } = useNextThemes();
  const fullscreen = useFullScreen();

  const { data: presentationViewOptions } = usePresentationViewOptions();

  const { data: isEnabledMarp } = useIsEnabledMarp();

  const toggleFullscreenHandler = useCallback(() => {
    if (fullscreen.active) {
      fullscreen.exit();
    }
    else {
      fullscreen.enter();
    }
  }, [fullscreen]);

  const closeHandler = useCallback(() => {
    if (fullscreen.active) {
      fullscreen.exit();
    }
    closePresentationModal();
  }, [fullscreen, closePresentationModal]);

  if (!isOpened) {
    return <></>;
  }

  const markdown = (specifiedRevision ?? currentPage?.revision)?.body;
  const rendererOptions = (specifiedRendererOptions ?? presentationViewOptions) as ReactMarkdownOptions;

  return (
    <Modal
      isOpen={isOpened}
      toggle={closeHandler}
      data-testid="page-presentation-modal"
      className={`grw-presentation-modal ${styles['grw-presentation-modal']}`}
    >
      <div className="grw-presentation-controls d-flex">
        <button className="close btn-fullscreen" type="button" aria-label="fullscreen" onClick={toggleFullscreenHandler}>
          <i className={`${fullscreen.active ? 'icon-size-actual' : 'icon-size-fullscreen'}`} aria-hidden></i>
        </button>
        <button className="close btn-close" type="button" aria-label="close" onClick={closeHandler}>
          <i className="ti ti-close" aria-hidden></i>
        </button>
      </div>
      <ModalBody className="modal-body d-flex justify-content-center align-items-center">
        { rendererOptions != null && isEnabledMarp != null && (
          <Presentation
            options={{
              rendererOptions,
              revealOptions: {
                embedded: true,
                hash: true,
              },
              isDarkMode,
            }}
            isEnabledMarp={isEnabledMarp}
          >
            {markdown}
          </Presentation>
        ) }
      </ModalBody>
    </Modal>
  );
};
