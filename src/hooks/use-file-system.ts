'use client';

import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { FileSystemItem, Item } from '@/lib/types';
import { db, storage } from '@/lib/firebase';
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  writeBatch,
} from 'firebase/firestore';
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';

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

  const addItem = async (
    newItemData: Omit<FileSystemItem, 'id' | 'tags'>,
    fileToUpload?: globalThis.File
  ): Promise<FileSystemItem | null> => {
    if (!userId) return null;
    try {
      // We explicitly type the data to be saved to ensure it matches Firestore expectations
      let dataToSave: Omit<FileSystemItem, 'id'> = { ...newItemData, tags: [] };

      if (newItemData.type === 'file' && fileToUpload) {
        const sRef = storageRef(storage, `${userId}/${Date.now()}-${fileToUpload.name}`);
        const uploadResult = await uploadBytes(sRef, fileToUpload);
        const downloadURL = await getDownloadURL(uploadResult.ref);
        
        // Add the downloadURL to the data before saving
        dataToSave = { ...dataToSave, downloadURL };
      }

      const itemsCollection = collection(db, 'users', userId, 'items');
      const docRef = await addDoc(itemsCollection, dataToSave);
      toast({ title: 'Success', description: `"${newItemData.name}" has been created.` });

      return { id: docRef.id, ...dataToSave } as FileSystemItem;
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
      const itemsToDeleteIds = new Set<string>([id]);
      const filesToDelete: (FileSystemItem & { type: 'file' })[] = [];

      const findChildrenRecursive = (folderId: string) => {
        const children = items.filter((i) => i.parentId === folderId);
        children.forEach((child) => {
          itemsToDeleteIds.add(child.id);
          if (child.type === 'file') {
            filesToDelete.push(child);
          }
          if (child.type === 'folder') {
            findChildrenRecursive(child.id);
          }
        });
      };

      if (itemToDelete.type === 'folder') {
        findChildrenRecursive(id);
      } else if (itemToDelete.type === 'file') {
        filesToDelete.push(itemToDelete);
      }
      
      itemsToDeleteIds.forEach(deleteId => {
        const docRef = doc(db, 'users', userId, 'items', deleteId);
        batch.delete(docRef);
      });
      
      await batch.commit();

      // Delete corresponding files from Firebase Storage
      for (const file of filesToDelete) {
        if (file.downloadURL) {
          try {
            const fileRef = storageRef(storage, file.downloadURL);
            await deleteObject(fileRef);
          } catch (storageError: any) {
            // Log error but don't fail the entire operation if storage deletion fails
            console.error(`Failed to delete file from storage: ${file.id}`, storageError);
          }
        }
      }

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
