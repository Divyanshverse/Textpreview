import { useState, useEffect, useCallback } from 'react';

export function useHistory(docId: string | undefined, currentContent: string) {
  const [history, setHistory] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  useEffect(() => {
    if (!docId) return;
    const saved = localStorage.getItem(`docshowcase_history_${docId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setHistory(parsed.history || []);
        setCurrentIndex(parsed.currentIndex ?? -1);
      } catch (e) {
        // Fallback
        setHistory([currentContent]);
        setCurrentIndex(0);
      }
    } else {
      setHistory([currentContent]);
      setCurrentIndex(0);
    }
  }, [docId]);

  const saveToStorage = (newHistory: string[], newIndex: number) => {
    if (!docId) return;
    localStorage.setItem(
      `docshowcase_history_${docId}`,
      JSON.stringify({ history: newHistory, currentIndex: newIndex })
    );
  };

  const pushSnapshot = useCallback(
    (newContent: string) => {
      setHistory((prev) => {
        if (prev[currentIndex] === newContent) return prev; // No change
        
        // Discard any forward history if we are currently "undone" and typing again
        const newHistory = prev.slice(0, currentIndex + 1);
        newHistory.push(newContent);
        
        // Keep max 50 snapshots
        if (newHistory.length > 50) newHistory.shift();
        
        const newIndex = newHistory.length - 1;
        setCurrentIndex(newIndex);
        saveToStorage(newHistory, newIndex);
        return newHistory;
      });
    },
    [currentIndex, docId]
  );

  const undo = useCallback((): string | null => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      saveToStorage(history, newIndex);
      return history[newIndex];
    }
    return null;
  }, [currentIndex, history, docId]);

  const redo = useCallback((): string | null => {
    if (currentIndex < history.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      saveToStorage(history, newIndex);
      return history[newIndex];
    }
    return null;
  }, [currentIndex, history, docId]);

  return {
    pushSnapshot,
    undo,
    redo,
    canUndo: currentIndex > 0,
    canRedo: currentIndex < history.length - 1,
  };
}
