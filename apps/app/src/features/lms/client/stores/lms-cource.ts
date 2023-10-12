import useSWR, { type SWRConfiguration, type SWRResponse } from 'swr';

import { apiv3Get } from '~/client/util/apiv3-client';

import type { ILmsCourceHasId } from '../../interfaces';

type ListLmsCourceResults = {
  data: ILmsCourceHasId[],
}

export const useSWRxLmsCource = (config?: SWRConfiguration): SWRResponse<ILmsCourceHasId[], Error> => {
  return useSWR(
    '/lms/cource',
    async(endpoint) => {
      try {
        const res = await apiv3Get<ListLmsCourceResults>(endpoint);
        return res.data.data;
      }
      catch (err) {
        throw new Error(err);
      }
    },
    config,
  );
};
