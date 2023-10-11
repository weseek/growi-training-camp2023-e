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
          <th className="col-4">namespace</th>
          <th>desc</th>
        </tr>
      </thead>
      <tbody className="overflow-auto">
        {data.map((cmsNamespace) => {
          const { _id, name, desc } = cmsNamespace;
          return (
            <tr key={_id.toString()}>
              <td>
                <Link href={`/_lms/${_id.toString()}`} prefetch={false}>
                  {name}
                </Link>
              </td>
              <td>
                {desc}
              </td>
            </tr>
          );
        })}
        <tr>
          <td colSpan={2} className="text-center">
            <button type="button" className="btn btn-outline-secondary">
              <span className="icon icon-plus" /> Add
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  );
};
