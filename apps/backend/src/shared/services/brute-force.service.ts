import { Injectable } from '@nestjs/common';
import { BruteForce, MemoryStore } from 'brute-force';

@Injectable()
export class BruteForceService {
  private bruteForce: BruteForce;

  constructor() {
    const store = new MemoryStore();
    this.bruteForce = new BruteForce(store, {
      freeRetries: 5,
      minWait: 5 * 60 * 1000, // 5 minutes
      maxWait: 60 * 60 * 1000, // 1 hour
    });
  }

  async prevent(ip: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.bruteForce.prevent(ip, (err, result) => {
        if (err) {
          return reject(err);
        }
        resolve(result);
      });
    });
  }

  async reset(ip: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.bruteForce.reset(ip, (err, result) => {
        if (err) {
          return reject(err);
        }
        resolve(result);
      });
    });
  }
}
