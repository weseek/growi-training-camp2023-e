import Link from 'next/link';

import { create } from '../../services/lms-cource';
import { useSWRxLmsCource } from '../../stores/lms-cource';

export const CourceList = (): JSX.Element => {
  const { data } = useSWRxLmsCource();

  if (data == null) { // data should be not null by `suspense: true`
    return <></>;
  }

  return (
    <table className="table table-bordered grw-duplicated-paths-table">
      <thead>
        <tr>
          <th className="col-1">namespace</th>
          <th className="col-4">Title</th>
          <th>desc</th>
        </tr>
      </thead>
      <tbody className="overflow-auto">
        {data.map((cmsNamespace) => {
          const { namespace, title, desc } = cmsNamespace;
          return (
            <tr key={namespace}>
              <td>
                <Link href={`/_lms/${namespace}`} prefetch={false}>
                  {namespace}
                </Link>
              </td>
              <td>
                <Link href={`/_lms/${namespace}`} prefetch={false}>
                  {title}
                </Link>
              </td>
              <td>
                {desc}
              </td>
            </tr>
          );
        })}
        <tr>
          <td colSpan={3} className="text-center">
            <button type="button" className="btn btn-outline-secondary">
              <span className="icon icon-plus" /> Add
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  );
};
