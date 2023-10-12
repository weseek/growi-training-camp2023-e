import type { IPageHasId } from '@growi/core';
import { DevidedPagePath } from '@growi/core/dist/models';

import PagePathHierarchicalLink from '~/components/PagePathHierarchicalLink';
import LinkedPagePath from '~/models/linked-page-path';

export const CourceUnitHead = (): JSX.Element => {
  return (
    <tr>
      <th style={{ width: '1px' }}></th>
      <th>Article name</th>
      <th>Author</th>
      <th>Published at</th>
    </tr>
  );
};


type Props = {
  page: IPageHasId,
}

export const CourceUnitRow = (props: Props): JSX.Element => {
  const { page } = props;

  const dPagePath: DevidedPagePath = new DevidedPagePath(page.path, false);
  const linkedPagePath = new LinkedPagePath(dPagePath.latter);

  return (
    <tr>
      <td>
        <button type="button" className="btn btn-lg btn-light d-flex align-items-center">
          <span className="material-icons">play_arrow</span>
        </button>
      </td>
      <td>
        <PagePathHierarchicalLink linkedPagePath={linkedPagePath} basePath={dPagePath.isRoot ? undefined : dPagePath.former} />
      </td>
      <td>author</td>
      <td>(TBD)</td>
    </tr>
  );
};