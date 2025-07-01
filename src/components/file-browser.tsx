'use client';

import React from 'react';
import type { FileSystemItem, Item } from '@/lib/types';
import { ItemCard } from './item-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Frown } from 'lucide-react';

interface FileBrowserProps {
  items: FileSystemItem[];
  onItemClick: (item: FileSystemItem) => void;
  onRenameRequest: (item: Item) => void;
  onDeleteRequest: (item: Item) => void;
  isLoading: boolean;
}

export function FileBrowser({
  items,
  onItemClick,
  onRenameRequest,
  onDeleteRequest,
  isLoading,
}: FileBrowserProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <Skeleton className="h-24 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground mt-16">
            <Frown className="w-16 h-16 mb-4" />
            <p className="text-lg">No items found.</p>
            <p>This folder is empty.</p>
        </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 animate-in fade-in duration-300">
      {items.map((item) => (
        <ItemCard
          key={item.id}
          item={item}
          onClick={() => onItemClick(item)}
          onRename={() => onRenameRequest(item)}
          onDelete={() => onDeleteRequest(item)}
        />
      ))}
    </div>
  );
}
