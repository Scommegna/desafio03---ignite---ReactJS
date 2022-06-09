import { createContext, ReactNode, useContext, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../services/api";
import { Product } from "../types";

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  // Seta o carrinho inicialmente para o valor salvo no localStorage
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem("@RocketShoes:cart");

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  // Adiciona um produto ao carrinho caso a quantidade não ultrapasse a disponível em estoque
  const addProduct = async (productId: number) => {
    try {
      const cartItems = [...cart];
      const productExists = cartItems.find(
        (cartItem) => cartItem.id === productId
      );

      const { data: stock } = await api.get(`/stock/${productId}`);

      const { amount } = stock;
      const currentProductAmount = productExists ? productExists.amount : 0;
      const newAmount = currentProductAmount + 1;

      if (newAmount > amount) {
        toast.error("Quantidade solicitada fora de estoque");
        return;
      }

      if (productExists) {
        productExists.amount = newAmount;
      } else {
        const { data: product } = await api.get(`/products/${productId}`);

        const newProduct = {
          ...product,
          amount: 1,
        };

        cartItems.push(newProduct);
      }

      setCart(cartItems);
      localStorage.setItem("@RocketShoes:cart", JSON.stringify(cartItems));
    } catch (error) {
      toast.error("Erro na adição do produto");
    }
  };

  // Remove um produto do carrinho
  const removeProduct = (productId: number) => {
    try {
      const cartCopy = [...cart];

      const itemToBeRemovedIndex = cartCopy.findIndex(
        (item) => item.id === productId
      );

      if (itemToBeRemovedIndex > 0) {
        cartCopy.splice(itemToBeRemovedIndex, 1);
        setCart(cartCopy);
        localStorage.setItem("@RocketShoes:cart", JSON.stringify(cartCopy));
      } else {
        throw Error();
      }
    } catch {
      toast.error("Erro na remoção do produto");
    }
  };

  // Incrementa ou decrementa em um a quantidade de um item do carrinho
  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
      if (amount <= 0) {
        return;
      }

      const stock = await api.get(`/stock/${productId}`);
      const stockAmount = stock.data.amount;

      if (amount > stockAmount) {
        toast.error("Quantidade solicitada fora de estoque");
        return;
      }

      const updatedCart = [...cart];
      const productExists = updatedCart.find(
        (product) => product.id === productId
      );

      if (productExists) {
        productExists.amount = amount;

        setCart(updatedCart);

        localStorage.setItem("@RocketShoes:cart", JSON.stringify(updatedCart));
      } else {
        throw Error();
      }
    } catch {
      toast.error("Erro na alteração de quantidade do produto");
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
