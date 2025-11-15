import { useState, useEffect, useRef, useMemo } from 'react';
import { cn } from '@/lib/utils';

export interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  overscan?: number; // Número de itens extras para renderizar fora da viewport
  getItemKey?: (item: T, index: number) => string | number; // Função para obter key única do item
}

/**
 * Componente de lista virtualizada para melhor performance com listas longas
 */
export function VirtualizedList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  className,
  overscan = 3,
  getItemKey,
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calcular quais itens estão visíveis
  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(
      start + Math.ceil(containerHeight / itemHeight) + overscan * 2,
      items.length
    );
    const startWithOverscan = Math.max(0, start - overscan);

    return {
      start: startWithOverscan,
      end,
    };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  // Itens visíveis
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end);
  }, [items, visibleRange.start, visibleRange.end]);

  // Altura total da lista
  const totalHeight = items.length * itemHeight;

  // Offset para posicionar os itens visíveis
  const offsetY = visibleRange.start * itemHeight;

  // Handler de scroll
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  return (
    <div
      ref={containerRef}
      className={cn('overflow-auto', className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, index) => {
            const absoluteIndex = visibleRange.start + index;
            const key = getItemKey ? getItemKey(item, absoluteIndex) : absoluteIndex;
            return (
              <div
                key={key}
                style={{ height: itemHeight }}
              >
                {renderItem(item, absoluteIndex)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

