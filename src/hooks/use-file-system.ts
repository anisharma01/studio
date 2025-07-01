'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  doc,
  setDoc,
  writeBatch,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/auth-context';
import type { FileSystemItem, Item } from '@/lib/types';
import { initialData } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

let hasCheckedForNewUser = false;

export function useFileSystem() {
  const [items, setItems] = useState<FileSystemItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const seedInitialData = useCallback(async (userId: string) => {
    const batch = writeBatch(db);
    const userItemsRef = collection(db, `users/${userId}/items`);
    
    initialData.forEach((item) => {
      const docRef = doc(userItemsRef, item.id);
      batch.set(docRef, item);
    });

    try {
      await batch.commit();
      toast({ title: 'Welcome!', description: 'We\'ve set up some example files for you.' });
    } catch (e) {
      console.error("Error seeding data:", e);
      toast({ title: 'Error', description: 'Could not set up example files.', variant: 'destructive' });
    }
  }, [toast]);

  useEffect(() => {
    if (user) {
      if (!hasCheckedForNewUser) setIsLoading(true);
      const userItemsRef = collection(db, `users/${user.uid}/items`);
      
      const unsubscribe = onSnapshot(query(userItemsRef), (snapshot) => {
        if (!hasCheckedForNewUser && snapshot.empty) {
          seedInitialData(user.uid);
        }
        hasCheckedForNewUser = true;
        const userItems = snapshot.docs.map(doc => doc.data() as FileSystemItem);
        setItems(userItems);
        setIsLoading(false);
      }, (error) => {
          console.error("Error fetching user data:", error);
          toast({ title: 'Error', description: 'Could not load your data from the cloud.', variant: 'destructive' });
          setIsLoading(false);
      });

      return () => {
        unsubscribe();
        hasCheckedForNewUser = false;
      }
    } else {
      setItems([]);
      setIsLoading(false);
      hasCheckedForNewUser = false;
    }
  }, [user, toast, seedInitialData]);

  const getItem = useCallback((id: string | null): FileSystemItem | null => {
    if (!id) return null;
    return items.find(item => item.id === id) || null;
  }, [items]);
  
  const addItem = (newItemData: Omit<FileSystemItem, 'id' | 'tags'>): FileSystemItem => {
    if (!user) {
      toast({ title: 'Error', description: 'You must be logged in to create items.', variant: 'destructive' });
      throw new Error("User not authenticated");
    }

    const newItem: FileSystemItem = {
      ...newItemData,
      id: crypto.randomUUID(),
      tags: [],
    };

    const docRef = doc(db, `users/${user.uid}/items`, newItem.id);
    
    setItems(prevItems => [...prevItems, newItem]);

    setDoc(docRef, newItem)
      .then(() => {
        toast({ title: 'Success', description: `"${newItem.name}" has been created.` });
      })
      .catch((e) => {
        console.error("Error adding document: ", e);
        toast({ title: 'Error', description: 'Could not create the item.', variant: 'destructive' });
        setItems(prevItems => prevItems.filter(item => item.id !== newItem.id));
      });
    
    return newItem;
  };

  const updateItem = (id: string, updates: Partial<Omit<FileSystemItem, 'id' | 'type' | 'parentId'>>) => {
     if (!user) {
      toast({ title: 'Error', description: 'You must be logged in to update items.', variant: 'destructive' });
      return;
    }
    const originalItem = items.find(item => item.id === id);
    if (!originalItem) return;

    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, ...updates } as FileSystemItem : item
      )
    );
    
    const docRef = doc(db, `users/${user.uid}/items`, id);
    setDoc(docRef, updates, { merge: true })
      .then(() => {
        toast({ title: 'Success', description: `Item has been updated.` });
      })
      .catch((e) => {
        console.error("Error updating document: ", e);
        toast({ title: 'Error', description: 'Could not update the item.', variant: 'destructive' });
        setItems(prevItems => prevItems.map(item => item.id === id ? originalItem : item));
      });
  };
  
  const deleteItem = async (id: string) => {
    if (!user) {
      toast({ title: 'Error', description: 'You must be logged in to delete items.', variant: 'destructive' });
      return;
    }

    const itemsBeforeDelete = [...items];
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
    
    try {
      const batch = writeBatch(db);
      itemsToRemoveIds.forEach(itemId => {
        batch.delete(doc(db, `users/${user.uid}/items`, itemId));
      });
      await batch.commit();
      toast({ title: 'Success', description: `"${itemToDelete.name}" and its contents have been deleted.` });
    } catch (e) {
      console.error("Error deleting documents: ", e);
      toast({ title: 'Error', description: 'Could not delete the item(s).', variant: 'destructive' });
      setItems(itemsBeforeDelete);
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
