import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD format
  sentences: [string, string, string];
  createdAt: Date;
  updatedAt: Date;
}

export interface JournalStats {
  totalDays: number;
  totalSentences: number;
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
}

interface JournalStore {
  entries: JournalEntry[];
  
  // Actions
  addEntry: (date: string, sentences: [string, string, string]) => void;
  updateEntry: (date: string, sentences: [string, string, string]) => void;
  getEntry: (date: string) => JournalEntry | undefined;
  getEntriesForMonth: (year: number, month: number) => JournalEntry[];
  getEntriesForWeek: (startDate: string) => JournalEntry[];
  getStats: () => JournalStats;
  hasEntryForDate: (date: string) => boolean;
}

const useJournalStore = create<JournalStore>()(persist(
  (set, get) => ({
    entries: [],
    
    addEntry: (date: string, sentences: [string, string, string]) => {
      const newEntry: JournalEntry = {
        id: `${date}-${Date.now()}`,
        date,
        sentences,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      set((state) => ({
        entries: [...state.entries.filter(e => e.date !== date), newEntry]
      }));
    },
    
    updateEntry: (date: string, sentences: [string, string, string]) => {
      set((state) => ({
        entries: state.entries.map(entry => 
          entry.date === date 
            ? { ...entry, sentences, updatedAt: new Date() }
            : entry
        )
      }));
    },
    
    getEntry: (date: string) => {
      return get().entries.find(entry => entry.date === date);
    },
    
    getEntriesForMonth: (year: number, month: number) => {
      const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
      const endDate = `${year}-${month.toString().padStart(2, '0')}-31`;
      
      return get().entries.filter(entry => 
        entry.date >= startDate && entry.date <= endDate
      );
    },
    
    getEntriesForWeek: (startDate: string) => {
      const start = new Date(startDate);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      
      const startStr = start.toISOString().split('T')[0];
      const endStr = end.toISOString().split('T')[0];
      
      return get().entries.filter(entry => 
        entry.date >= startStr && entry.date <= endStr
      );
    },
    
    getStats: () => {
      const entries = get().entries;
      const totalDays = entries.length;
      const totalSentences = entries.reduce((sum, entry) => 
        sum + entry.sentences.filter(s => s.trim().length > 0).length, 0
      );
      
      // Calculate current streak
      const sortedEntries = [...entries].sort((a, b) => b.date.localeCompare(a.date));
      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;
      
      const today = new Date().toISOString().split('T')[0];
      let checkDate = new Date(today);
      
      // Check current streak
      while (true) {
        const dateStr = checkDate.toISOString().split('T')[0];
        if (sortedEntries.some(entry => entry.date === dateStr)) {
          currentStreak++;
          tempStreak++;
          longestStreak = Math.max(longestStreak, tempStreak);
        } else {
          if (dateStr === today) {
            // If today has no entry, check yesterday
            checkDate.setDate(checkDate.getDate() - 1);
            continue;
          }
          break;
        }
        checkDate.setDate(checkDate.getDate() - 1);
      }
      
      // Calculate longest streak from all entries
      tempStreak = 0;
      for (let i = 0; i < sortedEntries.length; i++) {
        if (i === 0) {
          tempStreak = 1;
        } else {
          const prevDate = new Date(sortedEntries[i-1].date);
          const currDate = new Date(sortedEntries[i].date);
          const diffDays = Math.abs((prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) {
            tempStreak++;
          } else {
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 1;
          }
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak);
      
      // Calculate completion rate (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentEntries = entries.filter(entry => 
        new Date(entry.date) >= thirtyDaysAgo
      );
      const completionRate = recentEntries.length / 30 * 100;
      
      return {
        totalDays,
        totalSentences,
        currentStreak,
        longestStreak,
        completionRate: Math.round(completionRate)
      };
    },
    
    hasEntryForDate: (date: string) => {
      return get().entries.some(entry => entry.date === date);
    }
  }),
  {
    name: 'journal-storage',
    storage: createJSONStorage(() => localStorage),
  }
));

export default useJournalStore;