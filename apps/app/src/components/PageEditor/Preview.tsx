import React, {
  SyntheticEvent, RefObject,
} from 'react';

import type { RendererOptions } from '~/interfaces/renderer-options';

import RevisionRenderer from '../Page/RevisionRenderer';

import PreviewCMSHeader from './PreviewCMSHeader';

type Props = {
  rendererOptions: RendererOptions,
  markdown?: string,
  pagePath?: string | null,
  onScroll?: (scrollTop: number) => void,
}

const Preview = React.forwardRef((props: Props, ref: RefObject<HTMLDivElement>): JSX.Element => {

  const {
    rendererOptions,
    markdown, pagePath,
  } = props;

  return (
    <div
      className={`page-editor-preview-body ${pagePath === '/Sidebar' ? 'preview-sidebar' : ''} ${pagePath?.startsWith('/_cms') ? 'preview-cms' : ''}`}
      ref={ref}
      onScroll={(event: SyntheticEvent<HTMLDivElement>) => {
        if (props.onScroll != null) {
          props.onScroll(event.currentTarget.scrollTop);
        }
      }}
    >
      {pagePath?.startsWith('/_cms') && (
        <PreviewCMSHeader />
      ) }
      { markdown != null && (
        <RevisionRenderer rendererOptions={rendererOptions} markdown={markdown}></RevisionRenderer>
      ) }
    </div>
  );

});

Preview.displayName = 'Preview';

export default Preview;
