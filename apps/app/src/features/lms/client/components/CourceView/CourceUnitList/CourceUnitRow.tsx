import type { IPageHasId } from '@growi/core';
import { DevidedPagePath } from '@growi/core/dist/models';
import { format } from 'date-fns';

import PagePathHierarchicalLink from '~/components/PagePathHierarchicalLink';
import LinkedPagePath from '~/models/linked-page-path';


const formatDate = (date: Date | null) => {
  if (date == null) {
    return '';
  }
  return format(new Date(date), 'yyyy-MM-dd HH:mm');
};


export const CourceUnitHead = (): JSX.Element => {
  return (
    <tr>
      <th style={{ width: '1px' }}></th>
      <th>Cource unit name</th>
      <th>Author</th>
      <th style={{ width: '200px' }}>Last update</th>
    </tr>
  );
};


type Props = {
  page: IPageHasId,
  onPlayButtonClicked?: (page: IPageHasId) => void,
}

export const CourceUnitRow = (props: Props): JSX.Element => {
  const { page, onPlayButtonClicked } = props;
  const { creator, updatedAt } = page;

  const dPagePath: DevidedPagePath = new DevidedPagePath(page.path, false);
  const linkedPagePath = new LinkedPagePath(dPagePath.latter);

  return (
    <tr>
      <td>
        <button type="button" className="btn btn-lg btn-light d-flex align-items-center" onClick={() => onPlayButtonClicked?.(page)}>
          <span className="material-icons">play_arrow</span>
        </button>
      </td>
      <td className="align-middle">
        <PagePathHierarchicalLink linkedPagePath={linkedPagePath} basePath={dPagePath.isRoot ? undefined : dPagePath.former} />
      </td>
      <td className="align-middle">{creator.name}</td>
      <td className="align-middle">{formatDate(updatedAt)}</td>
    </tr>
  );
};
