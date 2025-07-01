'use client';

import { useState, useCallback } from 'react';
import type { FileSystemItem, Item } from '@/lib/types';
import { initialData } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

// A simple ID generator for new items for the demo
let nextId = Math.max(...initialData.map(item => parseInt(item.id))) + 2;
const generateId = () => (nextId++).toString();

export function useFileSystem() {
  const [items, setItems] = useState<FileSystemItem[]>(initialData);
  // isLoading is kept for API compatibility but is always false in local mode.
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const getItem = useCallback((id: string | null): FileSystemItem | null => {
    if (!id) return null;
    return items.find(item => item.id === id) || null;
  }, [items]);

  const addItem = async (newItemData: Omit<FileSystemItem, 'id' | 'tags'>): Promise<FileSystemItem | null> => {
    try {
      const newItem: FileSystemItem = {
        ...newItemData,
        id: generateId(),
        tags: [],
      };
      setItems(prevItems => [...prevItems, newItem]);
      toast({ title: 'Success', description: `"${newItem.name}" has been created.` });
      return newItem;
    } catch (error) {
      console.error("Error adding item:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to create item.' });
      return null;
    }
  };

  const updateItem = async (id: string, updates: Partial<Omit<FileSystemItem, 'id' | 'type' | 'parentId'>>) => {
     setItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, ...updates } : item
      )
    );
  };

  const deleteItem = async (id: string) => {
    const itemToDelete = items.find(item => item.id === id);
    if (!itemToDelete) return;

    try {
      let itemsToRemoveIds = new Set<string>([id]);

      // If it's a folder, find all nested children to delete them too
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
    } catch(error) {
       console.error("Error deleting item:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete item.' });
    }
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
