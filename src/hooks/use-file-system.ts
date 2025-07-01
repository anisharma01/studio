'use client';

import { useState, useEffect, useCallback } from 'react';
import type { FileSystemItem, Item } from '@/lib/types';
import { initialData } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

const STORAGE_KEY = 'cloudweaver-filesystem';

export function useFileSystem() {
  const [items, setItems] = useState<FileSystemItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (storedData) {
        setItems(JSON.parse(storedData));
      } else {
        setItems(initialData);
      }
    } catch (error) {
      console.error('Failed to load data from localStorage', error);
      toast({ title: 'Error', description: 'Could not load your data. Using default set.', variant: 'destructive' });
      setItems(initialData);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch (error) {
        console.error('Failed to save data to localStorage', error);
        toast({ title: 'Error', description: 'Could not save your changes.', variant: 'destructive' });
      }
    }
  }, [items, isLoading, toast]);

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

  const updateItem = (id: string, updates: Partial<Omit<FileSystemItem, 'id' | 'type'>>) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, ...updates } : item
      )
    );
     toast({ title: 'Success', description: `Item has been updated.` });
  };
  
  const deleteItem = (id: string) => {
    setItems(prevItems => {
      const itemToDelete = prevItems.find(item => item.id === id);
      if (!itemToDelete) return prevItems;

      const itemsToRemove = new Set<string>([id]);
      if (itemToDelete.type === 'folder') {
        const findChildrenRecursive = (folderId: string) => {
          const children = prevItems.filter(item => item.parentId === folderId);
          children.forEach(child => {
            itemsToRemove.add(child.id);
            if (child.type === 'folder') {
              findChildrenRecursive(child.id);
            }
          });
        };
        findChildrenRecursive(id);
      }
      toast({ title: 'Success', description: `"${itemToDelete.name}" and its contents have been deleted.` });
      return prevItems.filter(item => !itemsToRemove.has(item.id));
    });
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
