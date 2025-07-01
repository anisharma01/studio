'use client';

import { useState, useCallback } from 'react';
import type { FileSystemItem, Item } from '@/lib/types';
import { initialData } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

export function useFileSystem(userId?: string) {
  const [items, setItems] = useState<FileSystemItem[]>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const getItem = useCallback((id: string | null): FileSystemItem | null => {
    if (!id) return null;
    return items.find(item => item.id === id) || null;
  }, [items]);
  
  const addItem = (newItemData: Omit<FileSystemItem, 'id' | 'tags'>): FileSystemItem => {
    const newItem: FileSystemItem = {
      ...newItemData,
      id: crypto.randomUUID(),
      tags: [],
    };

    setItems(prevItems => [...prevItems, newItem]);
    toast({ title: 'Success', description: `"${newItem.name}" has been created.` });
    
    return newItem;
  };

  const updateItem = (id: string, updates: Partial<Omit<FileSystemItem, 'id' | 'type' | 'parentId'>>) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, ...updates } as FileSystemItem : item
      )
    );
  };
  
  const deleteItem = async (id: string) => {
    const itemToDelete = items.find(item => item.id === id);
    if (!itemToDelete) return;
    
    const itemsToRemoveIds = new Set<string>([id]);
    
    if (itemToDelete.type === 'folder') {
      const findChildrenRecursive = (folderId: string) => {
        const children = items.filter(i => i.parentId === folderId);
        children.forEach(child => {
          itemsToRemoveIds.add(child.id);
          if (child.type === 'folder') {
            findChildrenRecursive(child.id);
          }
        });
      };
      findChildrenRecursive(id);
    }

    setItems(prevItems => prevItems.filter(item => !itemsToRemoveIds.has(item.id)));
    toast({ title: 'Success', description: `"${itemToDelete.name}" and its contents have been deleted.` });
  };

  const getFolderPath = useCallback((itemId: string | null): Item[] => {
    const path: Item[] = [];
    let currentItem = getItem(itemId);
    while (currentItem) {
      path.unshift(currentItem);
      currentItem = getItem(currentItem.parentId);
    }
    return path;
  }, [getItem]);

  return { items, getItem, getFolderPath, addItem, updateItem, deleteItem, isLoading };
}
