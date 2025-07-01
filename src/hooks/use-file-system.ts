'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { FileSystemItem, Item } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export function useFileSystem(userId: string | null) {
  const [items, setItems] = useState<FileSystemItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) {
      setItems([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const itemsCollection = collection(db, 'users', userId, 'items');
    const q = query(itemsCollection);

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const fetchedItems = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as FileSystemItem[];
        setItems(fetchedItems);
        setIsLoading(false);
      },
      (error) => {
        console.error('Error fetching items:', error);
        toast({
          title: 'Error',
          description: 'Could not fetch your files. Please try again later.',
          variant: 'destructive',
        });
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId, toast]);

  const addItem = async (newItemData: Omit<FileSystemItem, 'id' | 'tags'>) => {
    if (!userId) return null;
    try {
      const itemsCollection = collection(db, 'users', userId, 'items');
      const docRef = await addDoc(itemsCollection, { ...newItemData, tags: [] });
      toast({ title: 'Success', description: `"${newItemData.name}" has been created.` });
      // Return the full item for tag suggestion dialog
      return { id: docRef.id, ...newItemData, tags: [] } as FileSystemItem;
    } catch (error) {
      console.error('Error adding item:', error);
      toast({ title: 'Error', description: 'Failed to create item.', variant: 'destructive' });
      return null;
    }
  };

  const updateItem = async (id: string, updates: Partial<Omit<FileSystemItem, 'id'>>) => {
    if (!userId) return;
    try {
      const itemDoc = doc(db, 'users', userId, 'items', id);
      await updateDoc(itemDoc, updates);
    } catch (error) {
      console.error('Error updating item:', error);
      toast({ title: 'Error', description: 'Failed to update item.', variant: 'destructive' });
    }
  };

  const deleteItem = async (id: string) => {
    if (!userId) return;

    const itemToDelete = items.find((item) => item.id === id);
    if (!itemToDelete) return;

    try {
      const batch = writeBatch(db);
      let itemsToDeleteIds = new Set<string>([id]);

      // If it's a folder, find all nested children to delete them too
      if (itemToDelete.type === 'folder') {
        const findChildrenRecursive = (folderId: string) => {
          const children = items.filter((i) => i.parentId === folderId);
          children.forEach((child) => {
            itemsToDeleteIds.add(child.id);
            if (child.type === 'folder') {
              findChildrenRecursive(child.id);
            }
          });
        };
        findChildrenRecursive(id);
      }
      
      itemsToDeleteIds.forEach(deleteId => {
        const docRef = doc(db, 'users', userId, 'items', deleteId);
        batch.delete(docRef);
      });
      
      await batch.commit();

      toast({ title: 'Success', description: `"${itemToDelete.name}" and its contents have been deleted.` });
    } catch (error) {
        console.error('Error deleting item(s):', error);
        toast({ title: 'Error', description: 'Failed to delete item.', variant: 'destructive' });
    }
  };

  const getItem = useCallback((id: string | null): FileSystemItem | null => {
    if (!id) return null;
    return items.find(item => item.id === id) || null;
  }, [items]);
  
  const getFolderPath = useCallback((itemId: string | null): Item[] => {
    const path: Item[] = [];
    let currentItem = getItem(itemId);
    while (currentItem) {
      path.unshift(currentItem);
      currentItem = getItem(currentItem.parentId);
    }
    return path;
  }, [getItem]);

  return { items, getFolderPath, addItem, updateItem, deleteItem, isLoading };
}
