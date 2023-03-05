import { createSchema, defaultModel } from '..';

export default createSchema({
  // Applicant ID and href
  id: defaultModel.string,
  txReceipt: defaultModel.object,
  amount: defaultModel.number,
  hash: defaultModel.string,
  applicant: defaultModel.string,
  country: defaultModel.string,

  responseSubmit: defaultModel.object,

  responseReport: defaultModel.array,

  responseChecks: defaultModel.object,
  submitTime: defaultModel.number,

  firstName: defaultModel.string,
  lastName: defaultModel.string,
  dob: defaultModel.string,

  createdUser: defaultModel.string,

  address: defaultModel.object,

  status: { type: String, default: 'inProgress' },
  token: defaultModel.string,
  tokenTime: defaultModel.number,
  startDate: defaultModel.number,
  lastTimeCall: defaultModel.number,

}, 'KYCVerify', null, null);
