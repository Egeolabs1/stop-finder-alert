import { useState, useEffect, useCallback } from 'react';
import { List, TodoItem, ShoppingItem, ListType } from '@/types/list';
import { PlaceCategory } from '@/types/places';

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
          type: list.type === 'pharmacy' ? 'shopping' : list.type, // Migração
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
    
    const hasShopping = shoppingList?.items.some(item => !item.completed) || false;
    
    return {
      hasShopping,
      hasPharmacy: false, // Mantido para compatibilidade
      hasAny: hasShopping,
    };
  }, [getListByType]);

  // Obter categorias ativas baseado nos itens não completados
  const getActiveCategories = useCallback((): PlaceCategory[] => {
    const shoppingList = getListByType('shopping');
    if (!shoppingList) return [];

    const activeItems = shoppingList.items.filter(item => !item.completed) as ShoppingItem[];
    const categories = new Set<PlaceCategory>();

    activeItems.forEach(item => {
      if (item.category && item.category !== 'other') {
        categories.add(item.category as PlaceCategory);
      }
    });

    // Se não há categorias específicas mas há itens ativos, retornar categorias padrão
    if (categories.size === 0 && activeItems.length > 0) {
      // Verificar se há itens relacionados a farmácia ou supermercado por texto
      const hasPharmacyKeywords = activeItems.some(item =>
        item.text.toLowerCase().match(/medic|remédio|farmácia|comprimido|droga/i)
      );
      const hasSupermarketKeywords = activeItems.some(item =>
        item.text.toLowerCase().match(/comida|alimento|bebida|leite|pão/i)
      );

      if (hasPharmacyKeywords) categories.add('pharmacy');
      if (hasSupermarketKeywords) categories.add('supermarket');
    }

    return Array.from(categories);
  }, [getListByType]);

  return {
    lists,
    addItem,
    removeItem,
    toggleItem,
    getListByType,
    hasActiveShoppingItems,
    getActiveCategories,
    updateLists,
  };
};
