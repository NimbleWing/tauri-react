/**
 * 将秒数格式化为 mm:ss 字符串
 * @param value - 秒数（可为 null | undefined | number）
 *                - 支持小数，内部会 Math.floor 取整
 *                - 小于等于 0 或非数字均视为无效
 * @returns 格式化后的时间字符串
 *          - 有效输入：mm:ss（始终两位秒，分钟不限）
 *          - 无效输入：'00:00'
 * @example
 * formatTime(125)   // '2:05'
 * formatTime(8)     // '0:08'
 * formatTime(null)  // '00:00'
 * formatTime(-3)    // '00:00'
 */
export const formatTime = (value?: number | null): string => {
  if (value == null || isNaN(value) || value <= 0) {
    return '00:00';
  }

  const rounded = value;
  const mins = Math.floor(rounded / 60);
  const secs = rounded % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
