import { padStart, toString } from 'lodash-es';
import { StringHelper } from './StringHelper';

/**
 * <h2>生成唯一键</h2>
 * <p>生成规则采用精度到毫秒的时间戳加指定长度的随机数</p>
 * <p>
 * 在同一毫秒内有概率重复，重复概率为 1/随机数长度
 * </p>
 * @param randomLength 随机数长度; 默认为: 4; 有效范围: [0, 15]
 */
export function uniqueKeyGenerator(randomLength = 4): string {
  if (randomLength < 0) {
    throw new Error('random number length must be an integer greater than or equal to 0. [0, 15]');
  }
  if (randomLength > 15) {
    throw new Error('random number length is too long. [0, 15]');
  }
  let randomNumber = '';
  if (randomLength !== 0) {
    randomNumber = StringHelper.random(randomLength);
  }
  const now = new Date();
  return `${String(now.getTime())}${padStart(toString(now.getMilliseconds()), 4, '0')}${randomNumber}`;
}
