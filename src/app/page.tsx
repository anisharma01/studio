"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { useAuth } from "@/context/auth-context";
import { Header } from "@/components/header";
import { FileBrowser } from "@/components/file-browser";
import { Breadcrumb } from "@/components/breadcrumb";
import { useFileSystem } from "@/hooks/use-file-system";
import type { FileSystemItem, Item } from "@/lib/types";
import { NewFolderDialog } from "@/components/dialogs/new-folder-dialog";
import { AddFileDialog } from "@/components/dialogs/add-file-dialog";
import { AddLinkDialog } from "@/components/dialogs/add-link-dialog";
import { TagSuggestionDialog } from "@/components/dialogs/tag-suggestion-dialog";
import { RenameItemDialog } from "@/components/dialogs/rename-item-dialog";
import { DeleteItemDialog } from "@/components/dialogs/delete-item-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Icons } from "@/components/icons";

type DialogState =
  | { type: "new-folder" }
  | { type: "add-file" }
  | { type: "add-link" }
  | { type: "rename"; item: Item }
  | { type: "delete"; item: Item }
  | { type: "suggest-tags"; item: Item; description: string }
  | null;

export default function Home() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  
  const {
    items,
    getItem,
    getFolderPath,
    addItem,
    updateItem,
    deleteItem,
    isLoading: isFileSystemLoading,
  } = useFileSystem(user?.uid);
  
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogState, setDialogState] = useState<DialogState>(null);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login');
    }
  }, [user, isAuthLoading, router]);

  const currentFolder = useMemo(
    () => (currentFolderId ? getItem(currentFolderId) : null),
    [currentFolderId, getItem]
  );
  
  const displayedItems = useMemo(() => {
    const filteredByName = searchTerm
      ? items.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
      : items.filter((item) => item.parentId === currentFolderId);
    
    return [...filteredByName].sort((a, b) => {
      if (a.type === 'folder' && b.type !== 'folder') return -1;
      if (a.type !== 'folder' && b.type === 'folder') return 1;
      return a.name.localeCompare(b.name);
    });

  }, [items, currentFolderId, searchTerm]);

  const breadcrumbItems = useMemo(
    () => getFolderPath(currentFolderId),
    [currentFolderId, getFolderPath]
  );
  
  const handleItemClick = (item: FileSystemItem) => {
    if (item.type === "folder") {
      setCurrentFolderId(item.id);
    } else if (item.type === 'link') {
      window.open(item.url, '_blank', 'noopener,noreferrer');
    } else if (item.type === 'file') {
      // This is a mock. In a real app, you'd have a file preview or download.
      const placeholderUrl = `https://placehold.co/800x600.png`;
      window.open(placeholderUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleCreateItem = (newItem: Omit<FileSystemItem, "id" | "tags">) => {
    if (!user) return;
    const fullItem = addItem(newItem);
    setDialogState(null);
    if(fullItem.type === 'file' || fullItem.type === 'link') {
      const description = fullItem.type === 'file' ? `A file named "${fullItem.name}" of type ${fullItem.fileType}` : `A link to ${fullItem.url} named "${fullItem.name}"`;
      setTimeout(() => setDialogState({ type: 'suggest-tags', item: fullItem, description }), 100);
    }
  };
  
  const handleRenameItem = (item: Item, newName: string) => {
    if (!user) return;
    updateItem(item.id, { name: newName });
    setDialogState(null);
  }

  const handleDeleteItem = (item: Item) => {
    if (!user) return;
    deleteItem(item.id);
    setDialogState(null);
  }

  const handleUpdateTags = (itemId: string, tags: string[]) => {
    if (!user) return;
    updateItem(itemId, { tags });
    setDialogState(null);
  };
  
  if (isAuthLoading || !user) {
     return (
       <div className="flex flex-col h-screen bg-background">
         <div className="flex h-16 shrink-0 items-center justify-between border-b bg-card px-4 md:px-6">
           <div className="flex items-center gap-3">
             <Icons.logo className="h-7 w-7 text-primary" />
             <Skeleton className="h-6 w-32" />
           </div>
           <Skeleton className="h-8 w-64 hidden md:block" />
           <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-28" />
              <Skeleton className="h-9 w-9 rounded-full ml-2" />
           </div>
         </div>
         <main className="flex-1 overflow-auto p-4 md:p-6 space-y-4">
            <Skeleton className="h-8 w-64" />
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {Array.from({ length: 16 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <Skeleton className="h-24 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
         </main>
       </div>
    )
  }

  return (
    <div className="flex flex-col h-dvh bg-background text-foreground">
      <Header
        onNewFolder={() => setDialogState({ type: "new-folder" })}
        onAddFile={() => setDialogState({ type: "add-file" })}
        onAddLink={() => setDialogState({ type: "add-link" })}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />
      <main className="flex-1 overflow-auto p-4 md:p-6 space-y-4">
        <Breadcrumb
          items={breadcrumbItems}
          onNavigate={setCurrentFolderId}
        />
        <FileBrowser
          items={displayedItems}
          onItemClick={handleItemClick}
          onRenameRequest={(item) => setDialogState({ type: "rename", item })}
          onDeleteRequest={(item) => setDialogState({ type: "delete", item })}
          isLoading={isFileSystemLoading}
        />
      </main>

      {dialogState?.type === "new-folder" && (
        <NewFolderDialog
          currentFolderId={currentFolderId}
          onClose={() => setDialogState(null)}
          onCreate={handleCreateItem}
        />
      )}
      {dialogState?.type === "add-file" && (
        <AddFileDialog
          currentFolderId={currentFolderId}
          onClose={() => setDialogState(null)}
          onAdd={handleCreateItem}
        />
      )}
      {dialogState?.type === "add-link" && (
        <AddLinkDialog
          currentFolderId={currentFolderId}
          onClose={() => setDialogState(null)}
          onAdd={handleCreateItem}
        />
      )}
      {dialogState?.type === "suggest-tags" && (
        <TagSuggestionDialog
          item={dialogState.item}
          description={dialogState.description}
          onClose={() => setDialogState(null)}
          onSave={handleUpdateTags}
        />
      )}
      {dialogState?.type === "rename" && (
        <RenameItemDialog
          item={dialogState.item}
          onClose={() => setDialogState(null)}
          onRename={handleRenameItem}
        />
      )}
       {dialogState?.type === 'delete' && (
        <DeleteItemDialog
          item={dialogState.item}
          onClose={() => setDialogState(null)}
          onDelete={handleDeleteItem}
        />
      )}
    </div>
  );
}
