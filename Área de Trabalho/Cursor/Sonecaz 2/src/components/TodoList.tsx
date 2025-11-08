import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, ListTodo, ShoppingCart, Pill } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TodoItem, ShoppingItem, ListType } from '@/types/list';

interface TodoListProps {
  type: ListType;
  title: string;
  items: (TodoItem | ShoppingItem)[];
  onAddItem: (text: string) => void;
  onToggleItem: (itemId: string) => void;
  onRemoveItem: (itemId: string) => void;
  icon?: React.ReactNode;
}

const TodoList = ({
  type,
  title,
  items,
  onAddItem,
  onToggleItem,
  onRemoveItem,
  icon,
}: TodoListProps) => {
  const [newItemText, setNewItemText] = useState('');
  const [showInput, setShowInput] = useState(false);

  const handleAdd = () => {
    if (newItemText.trim()) {
      onAddItem(newItemText.trim());
      setNewItemText('');
      setShowInput(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };

  const activeItems = items.filter(item => !item.completed);
  const completedItems = items.filter(item => item.completed);

  const getIcon = () => {
    if (icon) return icon;
    switch (type) {
      case 'shopping':
        return <ShoppingCart className="w-4 h-4" />;
      case 'pharmacy':
        return <Pill className="w-4 h-4" />;
      default:
        return <ListTodo className="w-4 h-4" />;
    }
  };

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getIcon()}
          <h3 className="font-semibold text-foreground">{title}</h3>
          {activeItems.length > 0 && (
            <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
              {activeItems.length}
            </span>
          )}
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowInput(!showInput)}
          className="h-8 w-8 p-0"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {showInput && (
        <div className="flex gap-2">
          <Input
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Adicionar ${type === 'shopping' ? 'item' : type === 'pharmacy' ? 'medicamento' : 'tarefa'}...`}
            className="flex-1"
            autoFocus
          />
          <Button onClick={handleAdd} size="sm">
            Adicionar
          </Button>
        </div>
      )}

      <div className="space-y-2 max-h-60 overflow-y-auto">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhum item na lista
          </p>
        ) : (
          <>
            {activeItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors"
              >
                <Checkbox
                  checked={item.completed}
                  onCheckedChange={() => onToggleItem(item.id)}
                />
                <span className="flex-1 text-sm text-foreground">{item.text}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onRemoveItem(item.id)}
                  className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
            {completedItems.length > 0 && (
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground mb-2">
                  Concluídos ({completedItems.length})
                </p>
                {completedItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-2 rounded-lg opacity-60"
                  >
                    <Checkbox
                      checked={item.completed}
                      onCheckedChange={() => onToggleItem(item.id)}
                    />
                    <span className="flex-1 text-sm text-muted-foreground line-through">
                      {item.text}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onRemoveItem(item.id)}
                      className="h-7 w-7 p-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  );
};

export default TodoList;



