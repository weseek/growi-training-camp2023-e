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

export const ArticleListHead = (): JSX.Element => {
  return (
    <tr>
      <th>Article name</th>
      <th>Author</th>
      <th style={{ width: '200px' }}>Last update</th>
    </tr>
  );
};


type Props = {
  page: IPageHasId,
}

export const ArticleListRow = (props: Props): JSX.Element => {
  const { page } = props;
  const { creator, updatedAt } = page;

  const dPagePath: DevidedPagePath = new DevidedPagePath(page.path, false);
  const linkedPagePath = new LinkedPagePath(dPagePath.latter);

  return (
    <tr>
      <td>
        <PagePathHierarchicalLink linkedPagePath={linkedPagePath} basePath={dPagePath.isRoot ? undefined : dPagePath.former} />
      </td>
      <td className="align-middle">{creator.name}</td>
      <td className="align-middle">{formatDate(updatedAt)}</td>
    </tr>
  );
};
