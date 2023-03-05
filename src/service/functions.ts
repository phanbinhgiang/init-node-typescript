/* eslint-disable arrow-body-style */
/* eslint-disable import/prefer-default-export */
const getLength = (value) => {
  return value ? value.length : 0;
};

export const genSortStateMongo = (sortString = ''): any => {
  if (getLength(sortString) === 0) return { createdAt: -1 };
  const isDesc = sortString[0] === '-';

  return isDesc ? { [sortString.substring(1)]: -1 } : { [sortString]: 1 };
};

export const genSkipNum = (page, size) => {
  return (parseInt(page) - 1) * parseInt(size);
};
