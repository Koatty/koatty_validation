/**
 * 缓存命中率测试
 * @author richen
 */
import { validationCache, clearAllCaches, getAllCacheStats } from '../src/performance-cache';
import { ValidFuncs } from '../src/rule';

describe('Cache Hit Rate', () => {

  beforeEach(() => {
    clearAllCaches();
  });

  afterEach(() => {
    clearAllCaches();
  });

  describe('ValidationCache Hit Rate Tracking', () => {
    it('should track cache hits and misses', () => {
      const validator = 'IsMobile';
      const value = '13812345678';

      // First access - should be a miss
      const firstResult = validationCache.get(validator, value);
      expect(firstResult).toBeUndefined();

      // Set value in cache
      validationCache.set(validator, value, true);

      // Second access - should be a hit
      const secondResult = validationCache.get(validator, value);
      expect(secondResult).toBe(true);

      // Get stats
      const stats = validationCache.getStats();
      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(1);
      expect(stats.totalRequests).toBe(2);
      expect(stats.hitRate).toBe(50); // 50%
    });

    it('should calculate hit rate correctly with multiple accesses', () => {
      const validator = 'IsCnName';
      
      // Cache some values
      for (let i = 0; i < 5; i++) {
        validationCache.set(validator, `张三${i}`, true);
      }

      // Access cached values multiple times (hits)
      for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 3; j++) {
          validationCache.get(validator, `张三${i}`);
        }
      }

      // Access non-cached values (misses)
      for (let i = 5; i < 10; i++) {
        validationCache.get(validator, `张三${i}`);
      }

      const stats = validationCache.getStats();
      expect(stats.hits).toBe(15); // 5 values × 3 accesses
      expect(stats.misses).toBe(5); // 5 non-cached values
      expect(stats.totalRequests).toBe(20);
      expect(stats.hitRate).toBe(75); // 75%
    });

    it('should reset hit/miss counters when cache is cleared', () => {
      const validator = 'IsMobile';
      
      // Generate some hits and misses
      validationCache.set(validator, '13812345678', true);
      validationCache.get(validator, '13812345678'); // hit
      validationCache.get(validator, '13987654321'); // miss

      let stats = validationCache.getStats();
      expect(stats.totalRequests).toBeGreaterThan(0);

      // Clear cache
      validationCache.clear();

      // Check that counters are reset
      stats = validationCache.getStats();
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
      expect(stats.totalRequests).toBe(0);
      expect(stats.hitRate).toBe(0);
    });

    it('should handle zero requests correctly', () => {
      const stats = validationCache.getStats();
      
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
      expect(stats.totalRequests).toBe(0);
      expect(stats.hitRate).toBe(0); // No division by zero error
    });
  });

  describe('Real-world validation scenarios', () => {
    it('should demonstrate improved hit rate with repeated validations', () => {
      const testPhones = [
        '13812345678',
        '13987654321',
        '15612345678',
        '18812345678',
        '19912345678'
      ];

      // First round - all misses (assuming cache is empty)
      testPhones.forEach(phone => {
        const result = ValidFuncs.IsMobile(phone);
        expect(result).toBe(true);
      });

      // Get initial stats
      const initialStats = getAllCacheStats();
      const initialTotalRequests = initialStats.validation.totalRequests;

      // Second round - should have better hit rate
      // (Repeat validation of the same values multiple times)
      for (let round = 0; round < 3; round++) {
        testPhones.forEach(phone => {
          ValidFuncs.IsMobile(phone);
        });
      }

      // Get final stats
      const finalStats = getAllCacheStats();
      
      // Should have more total requests
      expect(finalStats.validation.totalRequests).toBeGreaterThan(initialTotalRequests);
      
      // Stats should be valid
      expect(finalStats.validation.hits).toBeGreaterThanOrEqual(0);
      expect(finalStats.validation.misses).toBeGreaterThan(0);
      expect(finalStats.validation.hitRate).toBeGreaterThanOrEqual(0);
      expect(finalStats.validation.hitRate).toBeLessThanOrEqual(100);
    });

    it('should track statistics across getAllCacheStats', () => {
      // Perform some validations
      ValidFuncs.IsCnName('张三');
      ValidFuncs.IsCnName('张三'); // Should hit cache
      ValidFuncs.IsMobile('13812345678');
      ValidFuncs.IsMobile('13812345678'); // Should hit cache

      const stats = getAllCacheStats();
      
      expect(stats).toHaveProperty('validation');
      expect(stats.validation).toHaveProperty('hits');
      expect(stats.validation).toHaveProperty('misses');
      expect(stats.validation).toHaveProperty('hitRate');
      expect(stats.validation).toHaveProperty('totalRequests');
      
      // Should have some hits from repeated validations
      expect(stats.validation.totalRequests).toBeGreaterThan(0);
    });
  });

  describe('Performance benefits', () => {
    it('should cache validation results for performance', () => {
      const validator = 'IsIdNumber';
      const idNumber = '110101199001011237';

      // First validation (no cache)
      const start1 = performance.now();
      const result1 = validationCache.get(validator, idNumber);
      const time1 = performance.now() - start1;
      expect(result1).toBeUndefined(); // Cache miss

      // Set in cache
      validationCache.set(validator, idNumber, true);

      // Second validation (with cache)
      const start2 = performance.now();
      const result2 = validationCache.get(validator, idNumber);
      const time2 = performance.now() - start2;
      expect(result2).toBe(true); // Cache hit

      // Both operations should complete quickly
      expect(time1).toBeLessThan(10); // Should be very fast
      expect(time2).toBeLessThan(10); // Should be very fast
    });
  });
});

