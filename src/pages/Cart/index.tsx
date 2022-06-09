import React from "react";
import {
  MdDelete,
  MdAddCircleOutline,
  MdRemoveCircleOutline,
} from "react-icons/md";

import { useCart } from "../../hooks/useCart";
import { formatPrice } from "../../util/format";
import { Container, ProductTable, Total } from "./styles";

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
  amount: number;
}

const Cart = (): JSX.Element => {
  const { cart, removeProduct, updateProductAmount } = useCart();

  // Formata os dados dos produtos e o subtotal
  const cartFormatted = cart.map((product) => {
    return {
      ...product,
      priceFormatted: formatPrice(product.price),
      subTotal: formatPrice(product.price * product.amount),
    };
  });

  // Calcula o preço total
  const total = formatPrice(
    cart.reduce((sumTotal, product) => {
      const productPrice = product.amount * product.price;
      sumTotal += productPrice;
      return sumTotal;
    }, 0)
  );

  // Incrementa em um a quantidade do produto
  function handleProductIncrement(product: Product) {
    const { id: productId, amount: productAmount } = product;
    const amount = productAmount + 1;
    updateProductAmount({ productId, amount });
  }

  // Decrementa em um a quantidade do produto
  function handleProductDecrement(product: Product) {
    // TODO
    const { id: productId, amount: productAmount } = product;
    const amount = productAmount - 1;
    updateProductAmount({ productId, amount });
  }

  // Remove o produto do carrinho
  function handleRemoveProduct(productId: number) {
    removeProduct(productId);
  }

  return (
    <Container>
      <ProductTable>
        <thead>
          <tr>
            <th aria-label="product image" />
            <th>PRODUTO</th>
            <th>QTD</th>
            <th>SUBTOTAL</th>
            <th aria-label="delete icon" />
          </tr>
        </thead>
        <tbody>
          {cartFormatted.map((cartItem) => {
            return (
              <tr data-testid="product" key={cartItem.id}>
                <td>
                  <img src={cartItem.image} alt={cartItem.title} />
                </td>
                <td>
                  <strong>{cartItem.title}</strong>
                  <span>{cartItem.priceFormatted}</span>
                </td>
                <td>
                  <div>
                    <button
                      type="button"
                      data-testid="decrement-product"
                      disabled={cartItem.amount <= 1}
                      onClick={() => handleProductDecrement(cartItem)}
                    >
                      <MdRemoveCircleOutline size={20} />
                    </button>
                    <input
                      type="text"
                      data-testid="product-amount"
                      readOnly
                      value={cartItem.amount}
                    />
                    <button
                      type="button"
                      data-testid="increment-product"
                      onClick={() => handleProductIncrement(cartItem)}
                    >
                      <MdAddCircleOutline size={20} />
                    </button>
                  </div>
                </td>
                <td>
                  <strong>{cartItem.subTotal}</strong>
                </td>
                <td>
                  <button
                    type="button"
                    data-testid="remove-product"
                    onClick={() => handleRemoveProduct(cartItem.id)}
                  >
                    <MdDelete size={20} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </ProductTable>

      <footer>
        <button type="button">Finalizar pedido</button>

        <Total>
          <span>TOTAL</span>
          <strong>{total}</strong>
        </Total>
      </footer>
    </Container>
  );
};

export default Cart;
