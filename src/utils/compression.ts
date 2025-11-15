/**
 * Utilitários para compressão e descompressão de dados no localStorage
 * Usa LZ-String para compressão (alternativa leve ao gzip)
 */

// Função simples de compressão usando base64 encoding (fallback se não tiver LZ-String)
const compressData = (data: string): string => {
  try {
    // Tentar usar LZ-String se disponível (pode ser instalado via npm)
    if (typeof (window as any).LZString !== 'undefined') {
      return (window as any).LZString.compress(data);
    }
    // Fallback: usar compressão simples baseada em repetições
    return btoa(encodeURIComponent(data));
  } catch (error) {
    console.error('Error compressing data:', error);
    return data;
  }
};

const decompressData = (compressed: string): string => {
  try {
    if (typeof (window as any).LZString !== 'undefined') {
      return (window as any).LZString.decompress(compressed) || '';
    }
    return decodeURIComponent(atob(compressed));
  } catch (error) {
    console.error('Error decompressing data:', error);
    return compressed;
  }
};

/**
 * Salva dados comprimidos no localStorage
 */
export const setCompressedItem = (key: string, value: any): void => {
  try {
    const serialized = JSON.stringify(value);
    const compressed = compressData(serialized);
    localStorage.setItem(key, compressed);
  } catch (error) {
    console.error(`Error saving compressed item ${key}:`, error);
    // Fallback: salvar sem compressão
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (fallbackError) {
      console.error('Error saving without compression:', fallbackError);
    }
  }
};

/**
 * Lê dados descomprimidos do localStorage
 */
export const getCompressedItem = <T>(key: string, defaultValue: T | null = null): T | null => {
  try {
    const compressed = localStorage.getItem(key);
    if (!compressed) return defaultValue;

    // Verificar se está comprimido (começa com caracteres especiais) ou é JSON normal
    let decompressed: string;
    try {
      // Tentar descomprimir
      decompressed = decompressData(compressed);
    } catch {
      // Se falhar, tentar como JSON normal
      decompressed = compressed;
    }

    return JSON.parse(decompressed) as T;
  } catch (error) {
    console.error(`Error reading compressed item ${key}:`, error);
    return defaultValue;
  }
};

/**
 * Remove item comprimido do localStorage
 */
export const removeCompressedItem = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing item ${key}:`, error);
  }
};

/**
 * Verifica se deve usar compressão baseado no tamanho dos dados
 */
export const shouldCompress = (data: string): boolean => {
  // Comprimir se os dados forem maiores que 1KB
  return data.length > 1024;
};



