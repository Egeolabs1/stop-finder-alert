import { useState, useEffect, useCallback } from 'react';
import { List, TodoItem, ShoppingItem, ListType } from '@/types/list';

const STORAGE_KEY = 'sonecaz_lists';

export const useLists = () => {
  const [lists, setLists] = useState<List[]>([]);

  // Carregar listas do localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Converter datas de string para Date
        const listsWithDates = parsed.map((list: any) => ({
          ...list,
          createdAt: new Date(list.createdAt),
          updatedAt: new Date(list.updatedAt),
          items: list.items.map((item: any) => ({
            ...item,
            createdAt: new Date(item.createdAt),
            completedAt: item.completedAt ? new Date(item.completedAt) : undefined,
          })),
        }));
        setLists(listsWithDates);
      } else {
        // Criar listas padrão
        const defaultLists: List[] = [
          {
            id: 'todo-default',
            type: 'todo',
            name: 'Tarefas',
            items: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 'shopping-default',
            type: 'shopping',
            name: 'Lista de Compras',
            items: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 'pharmacy-default',
            type: 'pharmacy',
            name: 'Farmácia',
            items: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];
        setLists(defaultLists);
        saveLists(defaultLists);
      }
    } catch (error) {
      console.error('Error loading lists:', error);
    }
  }, []);

  // Salvar listas no localStorage
  const saveLists = useCallback((listsToSave: List[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(listsToSave));
    } catch (error) {
      console.error('Error saving lists:', error);
    }
  }, []);

  // Atualizar listas e salvar
  const updateLists = useCallback((newLists: List[]) => {
    const updatedLists = newLists.map(list => ({
      ...list,
      updatedAt: new Date(),
    }));
    setLists(updatedLists);
    saveLists(updatedLists);
  }, [saveLists]);

  // Adicionar item à lista
  const addItem = useCallback((listId: string, item: TodoItem | ShoppingItem) => {
    const updatedLists = lists.map(list => {
      if (list.id === listId) {
        return {
          ...list,
          items: [...list.items, item],
          updatedAt: new Date(),
        };
      }
      return list;
    });
    updateLists(updatedLists);
  }, [lists, updateLists]);

  // Remover item da lista
  const removeItem = useCallback((listId: string, itemId: string) => {
    const updatedLists = lists.map(list => {
      if (list.id === listId) {
        return {
          ...list,
          items: list.items.filter(item => item.id !== itemId),
          updatedAt: new Date(),
        };
      }
      return list;
    });
    updateLists(updatedLists);
  }, [lists, updateLists]);

  // Toggle item completado
  const toggleItem = useCallback((listId: string, itemId: string) => {
    const updatedLists = lists.map(list => {
      if (list.id === listId) {
        return {
          ...list,
          items: list.items.map(item => {
            if (item.id === itemId) {
              return {
                ...item,
                completed: !item.completed,
                completedAt: !item.completed ? new Date() : undefined,
              };
            }
            return item;
          }),
          updatedAt: new Date(),
        };
      }
      return list;
    });
    updateLists(updatedLists);
  }, [lists, updateLists]);

  // Obter lista por tipo
  const getListByType = useCallback((type: ListType) => {
    return lists.find(list => list.type === type);
  }, [lists]);

  // Verificar se há itens não completados em listas de compras/farmácia
  const hasActiveShoppingItems = useCallback(() => {
    const shoppingList = getListByType('shopping');
    const pharmacyList = getListByType('pharmacy');
    
    const hasShopping = shoppingList?.items.some(item => !item.completed) || false;
    const hasPharmacy = pharmacyList?.items.some(item => !item.completed) || false;
    
    return {
      hasShopping,
      hasPharmacy,
      hasAny: hasShopping || hasPharmacy,
    };
  }, [getListByType]);

  return {
    lists,
    addItem,
    removeItem,
    toggleItem,
    getListByType,
    hasActiveShoppingItems,
    updateLists,
  };
};

