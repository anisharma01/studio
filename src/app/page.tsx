"use client";

import React, { useState, useMemo, useEffect } from "react";
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

type DialogState =
  | { type: "new-folder" }
  | { type: "add-file" }
  | { type: "add-link" }
  | { type: "rename"; item: Item }
  | { type: "delete"; item: Item }
  | { type: "suggest-tags"; item: Item; description: string }
  | null;

export default function Home() {
  const {
    items,
    getItem,
    getFolderPath,
    addItem,
    updateItem,
    deleteItem,
    isLoading,
  } = useFileSystem();
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogState, setDialogState] = useState<DialogState>(null);

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
    }
  };

  const handleCreateItem = (newItem: Omit<FileSystemItem, "id" | "tags">) => {
    const fullItem = addItem(newItem);
    setDialogState(null);
    if(fullItem.type === 'file' || fullItem.type === 'link') {
      const description = fullItem.type === 'file' ? `A file named "${fullItem.name}" of type ${fullItem.fileType}` : `A link to ${fullItem.url} named "${fullItem.name}"`;
      setTimeout(() => setDialogState({ type: 'suggest-tags', item: fullItem, description }), 100);
    }
  };
  
  const handleRenameItem = (item: Item, newName: string) => {
    updateItem(item.id, { name: newName });
    setDialogState(null);
  }

  const handleDeleteItem = (item: Item) => {
    deleteItem(item.id);
    setDialogState(null);
  }

  const handleUpdateTags = (itemId: string, tags: string[]) => {
    updateItem(itemId, { tags });
    setDialogState(null);
  };


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
          isLoading={isLoading}
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
