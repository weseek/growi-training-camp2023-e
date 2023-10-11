import { apiv3Post } from '~/client/util/apiv3-client';

import type { ILmsCource } from '../../interfaces';

export const create = async(name: string, desc?: string): Promise<void> => {
  const newCource: ILmsCource = {
    name,
    desc,
    attendedUsers: [],
    attendedUserGroups: [],
  };
  await apiv3Post('/lms/cource', { data: newCource });
};
