/* eslint-disable no-return-await */
import User from '../../../model/user/User';
import { UserType } from '../../../service/knowledge/constants';

export default class UserWorker {
  static async getByListLocal(idList: string[], filter: object): Promise<UserType[]> {
    const payload = await User.find({ id: { $in: idList } }, filter || null);
    return payload;
  }

  static async getByIdLocal(id: string, filter: object): Promise<UserType> {
    return await User.findOne({ id }, filter);
  }
}
