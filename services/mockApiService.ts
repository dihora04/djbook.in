
import { DJProfile } from '../types';
import { MOCK_DJS } from '../constants';

const ARTIFICIAL_DELAY = 500;

export const getDjs = async (): Promise<DJProfile[]> => {
  console.log('Fetching all DJs...');
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(MOCK_DJS);
    }, ARTIFICIAL_DELAY);
  });
};

export const getFeaturedDjs = async (): Promise<DJProfile[]> => {
    console.log('Fetching featured DJs...');
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(MOCK_DJS.filter(dj => dj.featured));
      }, ARTIFICIAL_DELAY);
    });
};

export const getDjBySlug = async (slug: string): Promise<DJProfile | undefined> => {
  console.log(`Fetching DJ with slug: ${slug}`);
  return new Promise(resolve => {
    setTimeout(() => {
      const dj = MOCK_DJS.find(dj => dj.slug === slug);
      resolve(dj);
    }, ARTIFICIAL_DELAY);
  });
};
