import { logger } from '.';

export function timed(target: any, propertyKey: string, propertyDescriptor: PropertyDescriptor): PropertyDescriptor {
  propertyDescriptor = propertyDescriptor || Object.getOwnPropertyDescriptor(target, propertyKey);

  const timername = (target instanceof Function ? `static ${target.name}` : target.constructor.name) + `::${propertyKey}`;
  const originalMethod = propertyDescriptor.value;
  propertyDescriptor.value = function (...args: any[]) {
    const t0 = new Date().valueOf();
    try {
      const result = originalMethod.apply(this, args);
      logger.info(`[timer] [${timername}]: timer ${((new Date().valueOf() - t0) * 0.001).toFixed(3)}s`);
      return result;
    } catch (err) {
      logger.info(`[timer] [${timername}]: timer ${((new Date().valueOf() - t0) * 0.001).toFixed(3)}s`);
      throw err;
    }
  };
  return propertyDescriptor;
}
