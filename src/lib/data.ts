import type { FileSystemItem } from './types';

export const initialData: FileSystemItem[] = [
  { id: '1', name: 'Documents', parentId: null, type: 'folder', tags: ['work', 'important'] },
  { id: '2', name: 'Photos', parentId: null, type: 'folder', tags: ['personal', 'memories'] },
  { id: '3', name: 'Design Projects', parentId: '1', type: 'folder', tags: ['creative', 'portfolio'] },
  { id: '4', name: 'Q3 Report.pdf', parentId: '1', type: 'file', fileType: 'pdf', size: 1204, tags: ['finance', 'report'] },
  { id: '5', name: 'Summer Vacation', parentId: '2', type: 'folder', tags: ['travel', 'beach'] },
  { id: '6', name: 'beach-sunset.jpg', parentId: '5', type: 'file', fileType: 'jpg', size: 3012, tags: ['sunset', 'ocean'] },
  { id: '7', name: 'Next.js Documentation', parentId: null, type: 'link', url: 'https://nextjs.org/docs', tags: ['react', 'framework', 'webdev'] },
  { id: '8', name: 'CloudWeaver Logo.svg', parentId: '3', type: 'file', fileType: 'svg', size: 150, tags: ['logo', 'branding'] }
];
