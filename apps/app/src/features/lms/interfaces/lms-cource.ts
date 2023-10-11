import type { HasObjectId, IUser, IUserGroup } from '@growi/core';

export type ILmsCource = {
  name: string,
  desc?: string,
  attendedUsers: IUser[],
  attendedUserGroups: IUserGroup[],
};

export type ILmsCourceHasId = ILmsCource & HasObjectId;
