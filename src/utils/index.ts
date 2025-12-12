export * from './time';
export * from './file';
export const reOrder = <T>(items: T[], src: number, dst: number) => {
  const res = Array.from(items);
  const [removed] = res.splice(src, 1);

  res.splice(dst, 0, removed);
  return res;
};
