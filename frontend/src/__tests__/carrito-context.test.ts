import { describe, it, expect } from 'vitest';

interface CarritoItem {
  productoId: string;
  cantidad: number;
  talle: string;
  nombre?: string;
  precioCentavos?: number;
  subtotalCentavos?: number;
}

type CarritoAction =
  | { type: 'ADD'; payload: CarritoItem }
  | { type: 'REMOVE'; payload: string }
  | { type: 'UPDATE_QUANTITY'; productoId: string; cantidad: number }
  | { type: 'CLEAR' };

function carritoReducer(state: CarritoItem[], action: CarritoAction): CarritoItem[] {
  switch (action.type) {
    case 'ADD': {
      const existente = state.find(
        (i) => i.productoId === action.payload.productoId && i.talle === action.payload.talle
      );
      if (existente) {
        return state.map((i) =>
          i.productoId === action.payload.productoId && i.talle === action.payload.talle
            ? { ...i, cantidad: i.cantidad + action.payload.cantidad }
            : i
        );
      }
      return [...state, action.payload];
    }
    case 'REMOVE':
      return state.filter((i) => i.productoId !== action.payload);
    case 'UPDATE_QUANTITY':
      return state.map((i) =>
        i.productoId === action.productoId ? { ...i, cantidad: action.cantidad } : i
      );
    case 'CLEAR':
      return [];
    default:
      return state;
  }
}

describe('carritoReducer', () => {
  const itemBase: CarritoItem = {
    productoId: 'prod-1',
    cantidad: 1,
    talle: 'M',
    nombre: 'Remera',
    precioCentavos: 15000,
    subtotalCentavos: 15000,
  };

  it('agrega un item al carrito vacio', () => {
    const state = carritoReducer([], { type: 'ADD', payload: itemBase });
    expect(state).toHaveLength(1);
    expect(state[0].productoId).toBe('prod-1');
    expect(state[0].cantidad).toBe(1);
  });

  it('incrementa cantidad si el item ya existe', () => {
    const state = carritoReducer([itemBase], { type: 'ADD', payload: { ...itemBase, cantidad: 2 } });
    expect(state).toHaveLength(1);
    expect(state[0].cantidad).toBe(3);
  });

  it('remueve un item del carrito', () => {
    const state = carritoReducer([itemBase], { type: 'REMOVE', payload: 'prod-1' });
    expect(state).toHaveLength(0);
  });

  it('limpia todo el carrito', () => {
    const state = carritoReducer([itemBase, { ...itemBase, productoId: 'prod-2' }], { type: 'CLEAR' });
    expect(state).toHaveLength(0);
  });

  it('actualiza la cantidad de un item', () => {
    const state = carritoReducer([itemBase], { type: 'UPDATE_QUANTITY', productoId: 'prod-1', cantidad: 5 });
    expect(state[0].cantidad).toBe(5);
  });
});
