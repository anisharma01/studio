'use client';

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  writeBatch,
  getDoc,
  onSnapshot,
} from 'firebase/firestore';
import type { FileSystemItem, Item } from '@/lib/types';
import { initialData } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

export function useFileSystem(userId?: string) {
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
    const itemsColRef = collection(db, 'users', userId, 'items');

    const unsubscribe = onSnapshot(itemsColRef, async (snapshot) => {
        if (snapshot.empty && !localStorage.getItem(`seeded_${userId}`)) {
          // New user, seed their data
          localStorage.setItem(`seeded_${userId}`, 'true');
          const batch = writeBatch(db);
          initialData.forEach((item) => {
            const docRef = doc(itemsColRef, item.id);
            batch.set(docRef, item);
          });
          await batch.commit();
        } else {
          const firestoreItems = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as FileSystemItem[];
          setItems(firestoreItems);
        }
        setIsLoading(false);
    }, (error) => {
        console.error("Error fetching filesystem:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load your files. Please try again later.",
        });
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [userId, toast]);

  const getItem = useCallback((id: string | null): FileSystemItem | null => {
    if (!id) return null;
    return items.find(item => item.id === id) || null;
  }, [items]);

  const addItem = async (newItemData: Omit<FileSystemItem, 'id' | 'tags'>): Promise<FileSystemItem | null> => {
    if (!userId) return null;

    try {
      const itemsColRef = collection(db, 'users', userId, 'items');
      const docRef = await addDoc(itemsColRef, {
        ...newItemData,
        tags: [],
      });
      
      toast({ title: 'Success', description: `"${newItemData.name}" has been created.` });

      const newItem = await getDoc(docRef);
      const newItemWithId = { id: newItem.id, ...newItem.data() } as FileSystemItem;
      return newItemWithId;
    } catch (error) {
      console.error("Error adding item:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to create item.' });
      return null;
    }
  };

  const updateItem = async (id: string, updates: Partial<Omit<FileSystemItem, 'id' | 'type' | 'parentId'>>) => {
    if (!userId) return;
    try {
      const docRef = doc(db, 'users', userId, 'items', id);
      await updateDoc(docRef, updates);
    } catch(error) {
       console.error("Error updating item:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update item.' });
    }
  };

  const deleteItem = async (id: string) => {
    if (!userId) return;

    const itemToDelete = items.find(item => item.id === id);
    if (!itemToDelete) return;

    try {
      const batch = writeBatch(db);
      const itemsColRef = collection(db, 'users', userId, 'items');
      
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
      
      itemsToRemoveIds.forEach(itemId => {
        batch.delete(doc(itemsColRef, itemId));
      });
      
      await batch.commit();
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
