"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "./useAuth";

interface SavedItem {
  id: string;
  item_type: "product" | "article" | "video" | "calculation";
  referenced_id: string;
  metadata: any;
  created_at: string;
}

export function useSavedItems() {
  const { user } = useAuth();
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!user) {
      setSavedItems([]);
      setLoading(false);
      return;
    }

    const fetchSavedItems = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("saved_items")
        .select("id, item_type, referenced_id, metadata, created_at")
        .eq("user_id", user.id);

      if (!error && data) {
        setSavedItems(data as SavedItem[]);
      }
      setLoading(false);
    };

    fetchSavedItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const toggleSaveItem = async (
    itemType: "product" | "article" | "video" | "calculation",
    referencedId: string,
    metadata?: any
  ) => {
    if (!user) return { success: false, error: "Authentication required" };

    const isAlreadySaved = savedItems.some(
      (item) => item.item_type === itemType && item.referenced_id === referencedId
    );

    // 1. Optimistic UI update
    const previousState = [...savedItems];
    if (isAlreadySaved) {
      setSavedItems((prev) =>
        prev.filter((item) => !(item.item_type === itemType && item.referenced_id === referencedId))
      );
    } else {
      const tempItem: SavedItem = {
        id: "temp-id-" + Math.random().toString(),
        item_type: itemType,
        referenced_id: referencedId,
        metadata: metadata || null,
        created_at: new Date().toISOString(),
      };
      setSavedItems((prev) => [...prev, tempItem]);
    }

    // 2. Server request
    if (isAlreadySaved) {
      const { error } = await supabase
        .from("saved_items")
        .delete()
        .eq("user_id", user.id)
        .eq("item_type", itemType)
        .eq("referenced_id", referencedId);

      if (error) {
        // Rollback state if server fails
        setSavedItems(previousState);
        return { success: false, error };
      }
      return { success: true, saved: false };
    } else {
      const { data, error } = await supabase
        .from("saved_items")
        .insert({
          user_id: user.id,
          item_type: itemType,
          referenced_id: referencedId,
          metadata: metadata || null,
        })
        .select("id, item_type, referenced_id, metadata, created_at")
        .single();

      if (error || !data) {
        // Rollback state if server fails
        setSavedItems(previousState);
        return { success: false, error };
      }

      // Replace temporary item with real database item
      setSavedItems((prev) =>
        prev.map((item) =>
          item.referenced_id === referencedId && item.item_type === itemType ? (data as SavedItem) : item
        )
      );
      return { success: true, saved: true };
    }
  };

  const isSaved = (itemType: "product" | "article" | "video" | "calculation", referencedId: string) => {
    return savedItems.some((item) => item.item_type === itemType && item.referenced_id === referencedId);
  };

  return {
    savedItems,
    loading,
    toggleSaveItem,
    isSaved,
  };
}
