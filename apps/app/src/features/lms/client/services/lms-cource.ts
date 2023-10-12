import { apiv3Post } from '~/client/util/apiv3-client';

import type { ILmsCource } from '../../interfaces';

export const create = async(namespace: string, title: string, desc?: string): Promise<void> => {
  const newCource: Partial<ILmsCource> = {
    namespace,
    title,
    desc,
  };
  await apiv3Post('/lms/cource', { data: newCource });
};
