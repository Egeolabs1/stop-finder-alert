import { useNavigate } from 'react-router-dom';
import { useLists } from '@/hooks/useLists';
import TodoList from '@/components/TodoList';
import { ShoppingCart, ListTodo, ArrowLeft } from 'lucide-react';
import { TodoItem, ShoppingItem } from '@/types/list';
import { Button } from '@/components/ui/button';

const Lists = () => {
  const navigate = useNavigate();
  const { lists, addItem, removeItem, toggleItem, getListByType } = useLists();

  const todoList = getListByType('todo');
  const shoppingList = getListByType('shopping');

  const handleAddItem = (listId: string, type: 'todo' | 'shopping') => {
    return (text: string) => {
      const newItem: TodoItem | ShoppingItem = {
        id: `${Date.now()}-${Math.random()}`,
        text,
        completed: false,
        createdAt: new Date(),
        category: type === 'shopping' ? undefined : undefined, // Será inferido automaticamente
      };
      addItem(listId, newItem);
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30 p-4 pb-safe">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
        </div>
        
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Minhas Listas</h1>
          <p className="text-sm text-muted-foreground">
            Organize suas tarefas e compras. Você receberá alertas quando estiver próximo de estabelecimentos relevantes.
          </p>
        </div>

        {todoList && (
          <TodoList
            type="todo"
            title={todoList.name}
            items={todoList.items}
            onAddItem={handleAddItem(todoList.id, 'todo')}
            onToggleItem={(itemId) => toggleItem(todoList.id, itemId)}
            onRemoveItem={(itemId) => removeItem(todoList.id, itemId)}
            icon={<ListTodo className="w-4 h-4" />}
          />
        )}

        {shoppingList && (
          <TodoList
            type="shopping"
            title={shoppingList.name}
            items={shoppingList.items}
            onAddItem={handleAddItem(shoppingList.id, 'shopping')}
            onToggleItem={(itemId) => toggleItem(shoppingList.id, itemId)}
            onRemoveItem={(itemId) => removeItem(shoppingList.id, itemId)}
            icon={<ShoppingCart className="w-4 h-4" />}
          />
        )}

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            💡 <strong>Dica:</strong> Quando você tiver itens nas listas de compras ou farmácia e estiver próximo de um estabelecimento relevante, você receberá um alerta automático!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Lists;

