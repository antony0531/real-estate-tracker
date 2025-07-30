// IndexedDB Service for Offline Storage
import { Project, Expense, Room } from '@/types';

const DB_NAME = 'RealEstateTrackerDB';
const DB_VERSION = 1;

interface DBSchema {
  projects: Project;
  expenses: Expense;
  rooms: Room;
  pendingSync: {
    id: string;
    type: 'project' | 'expense' | 'room';
    action: 'create' | 'update' | 'delete';
    data: any;
    timestamp: number;
  };
}

class IndexedDBService {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        console.log('[IndexedDB] Database initialized');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!db.objectStoreNames.contains('projects')) {
          const projectStore = db.createObjectStore('projects', { keyPath: 'id' });
          projectStore.createIndex('name', 'name', { unique: false });
          projectStore.createIndex('status', 'status', { unique: false });
        }

        if (!db.objectStoreNames.contains('expenses')) {
          const expenseStore = db.createObjectStore('expenses', { keyPath: 'id' });
          expenseStore.createIndex('project_id', 'project_id', { unique: false });
          expenseStore.createIndex('room_id', 'room_id', { unique: false });
          expenseStore.createIndex('category', 'category', { unique: false });
          expenseStore.createIndex('date', 'date', { unique: false });
        }

        if (!db.objectStoreNames.contains('rooms')) {
          const roomStore = db.createObjectStore('rooms', { keyPath: 'id' });
          roomStore.createIndex('project_id', 'project_id', { unique: false });
          roomStore.createIndex('name', 'name', { unique: false });
        }

        if (!db.objectStoreNames.contains('pendingSync')) {
          const syncStore = db.createObjectStore('pendingSync', { keyPath: 'id' });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
          syncStore.createIndex('type', 'type', { unique: false });
        }

        console.log('[IndexedDB] Database schema created');
      };
    });
  }

  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.init();
    }
    return this.db!;
  }

  // Projects
  async saveProject(project: Project): Promise<void> {
    const db = await this.ensureDB();
    const transaction = db.transaction(['projects'], 'readwrite');
    const store = transaction.objectStore('projects');
    
    await new Promise<void>((resolve, reject) => {
      const request = store.put(project);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    // Add to sync queue if needed
    await this.addToPendingSync('project', 'create', project);
  }

  async getProject(id: string): Promise<Project | null> {
    const db = await this.ensureDB();
    const transaction = db.transaction(['projects'], 'readonly');
    const store = transaction.objectStore('projects');
    
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllProjects(): Promise<Project[]> {
    const db = await this.ensureDB();
    const transaction = db.transaction(['projects'], 'readonly');
    const store = transaction.objectStore('projects');
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  // Expenses
  async saveExpense(expense: Expense): Promise<void> {
    const db = await this.ensureDB();
    const transaction = db.transaction(['expenses'], 'readwrite');
    const store = transaction.objectStore('expenses');
    
    await new Promise<void>((resolve, reject) => {
      const request = store.put(expense);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    // Add to sync queue
    await this.addToPendingSync('expense', 'create', expense);
  }

  async getExpensesByProject(projectId: string): Promise<Expense[]> {
    const db = await this.ensureDB();
    const transaction = db.transaction(['expenses'], 'readonly');
    const store = transaction.objectStore('expenses');
    const index = store.index('project_id');
    
    return new Promise((resolve, reject) => {
      const request = index.getAll(projectId);
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  // Rooms
  async saveRoom(room: Room): Promise<void> {
    const db = await this.ensureDB();
    const transaction = db.transaction(['rooms'], 'readwrite');
    const store = transaction.objectStore('rooms');
    
    await new Promise<void>((resolve, reject) => {
      const request = store.put(room);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    // Add to sync queue
    await this.addToPendingSync('room', 'create', room);
  }

  async getRoomsByProject(projectId: string): Promise<Room[]> {
    const db = await this.ensureDB();
    const transaction = db.transaction(['rooms'], 'readonly');
    const store = transaction.objectStore('rooms');
    const index = store.index('project_id');
    
    return new Promise((resolve, reject) => {
      const request = index.getAll(projectId);
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  // Sync Management
  private async addToPendingSync(
    type: 'project' | 'expense' | 'room',
    action: 'create' | 'update' | 'delete',
    data: any
  ): Promise<void> {
    const db = await this.ensureDB();
    const transaction = db.transaction(['pendingSync'], 'readwrite');
    const store = transaction.objectStore('pendingSync');
    
    const syncItem = {
      id: `${type}_${action}_${data.id}_${Date.now()}`,
      type,
      action,
      data,
      timestamp: Date.now()
    };
    
    await new Promise<void>((resolve, reject) => {
      const request = store.put(syncItem);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getPendingSync(): Promise<any[]> {
    const db = await this.ensureDB();
    const transaction = db.transaction(['pendingSync'], 'readonly');
    const store = transaction.objectStore('pendingSync');
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async clearPendingSync(ids: string[]): Promise<void> {
    const db = await this.ensureDB();
    const transaction = db.transaction(['pendingSync'], 'readwrite');
    const store = transaction.objectStore('pendingSync');
    
    await Promise.all(
      ids.map(id => new Promise<void>((resolve, reject) => {
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      }))
    );
  }

  // Clear all data (for testing/reset)
  async clearAll(): Promise<void> {
    const db = await this.ensureDB();
    const transaction = db.transaction(
      ['projects', 'expenses', 'rooms', 'pendingSync'],
      'readwrite'
    );
    
    await Promise.all([
      transaction.objectStore('projects').clear(),
      transaction.objectStore('expenses').clear(),
      transaction.objectStore('rooms').clear(),
      transaction.objectStore('pendingSync').clear()
    ]);
  }

  // Export/Import for backup
  async exportData(): Promise<any> {
    const [projects, expenses, rooms] = await Promise.all([
      this.getAllProjects(),
      this.getAllExpenses(),
      this.getAllRooms()
    ]);

    return {
      version: DB_VERSION,
      exportDate: new Date().toISOString(),
      data: { projects, expenses, rooms }
    };
  }

  async importData(data: any): Promise<void> {
    if (data.version !== DB_VERSION) {
      console.warn('Database version mismatch, data may need migration');
    }

    const db = await this.ensureDB();
    const transaction = db.transaction(
      ['projects', 'expenses', 'rooms'],
      'readwrite'
    );

    // Clear existing data
    await Promise.all([
      transaction.objectStore('projects').clear(),
      transaction.objectStore('expenses').clear(),
      transaction.objectStore('rooms').clear()
    ]);

    // Import new data
    const promises: Promise<void>[] = [];

    if (data.data.projects) {
      const projectStore = transaction.objectStore('projects');
      data.data.projects.forEach((project: Project) => {
        promises.push(new Promise((resolve, reject) => {
          const request = projectStore.add(project);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        }));
      });
    }

    if (data.data.expenses) {
      const expenseStore = transaction.objectStore('expenses');
      data.data.expenses.forEach((expense: Expense) => {
        promises.push(new Promise((resolve, reject) => {
          const request = expenseStore.add(expense);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        }));
      });
    }

    if (data.data.rooms) {
      const roomStore = transaction.objectStore('rooms');
      data.data.rooms.forEach((room: Room) => {
        promises.push(new Promise((resolve, reject) => {
          const request = roomStore.add(room);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        }));
      });
    }

    await Promise.all(promises);
  }

  // Helper methods
  private async getAllExpenses(): Promise<Expense[]> {
    const db = await this.ensureDB();
    const transaction = db.transaction(['expenses'], 'readonly');
    const store = transaction.objectStore('expenses');
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  private async getAllRooms(): Promise<Room[]> {
    const db = await this.ensureDB();
    const transaction = db.transaction(['rooms'], 'readonly');
    const store = transaction.objectStore('rooms');
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }
}

// Export singleton instance
export const indexedDB = new IndexedDBService();

// Initialize on import
if (typeof window !== 'undefined') {
  indexedDB.init().catch(console.error);
}