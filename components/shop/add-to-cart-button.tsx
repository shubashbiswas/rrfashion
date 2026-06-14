"use client";

import { useState } from "react";
import { ShoppingCart, Plus, Minus, Loader2 } from "lucide-react";

import type { Product, ProductVariation } from "@/lib/woocommerce.d";
import { isProductInStock } from "@/lib/woocommerce";
import { useCart } from "@/components/shop/cart-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AddToCartButtonProps {
  product: Product;
  variation?: ProductVariation | null;
  className?: string;
  showQuantity?: boolean;
}

export function AddToCartButton({
  product,
  variation,
  className,
  showQuantity = true,
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  // For variable products, require a variation
  const isVariable = product.type === "variable";
  const needsVariation = isVariable && !variation;

  // Check stock
  const checkableItem = variation || product;
  const inStock =
    checkableItem.stock_status === "instock" ||
    checkableItem.stock_status === "onbackorder";

  const maxQuantity = checkableItem.stock_quantity || 99;

  const handleAddToCart = async () => {
    if (needsVariation || !inStock) return;

    setIsAdding(true);

    try {
      await addItem({
        productId: product.id,
        variationId: variation?.id,
        quantity,
        name: product.name + (variation ? ` - ${variation.attributes.map((a) => a.option).join(", ")}` : ""),
        price: variation?.price || product.price,
        image: (variation?.image || product.images[0])?.src,
        attributes: variation?.attributes,
      });

      // Reset quantity after adding
      setQuantity(1);
    } finally {
      setIsAdding(false);
    }
  };

  const incrementQuantity = () => {
    if (quantity < maxQuantity) {
      setQuantity((q) => q + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity((q) => q - 1);
    }
  };

  if (!inStock) {
    return (
      <Button disabled className={cn("w-full", className)}>
        Out of Stock
      </Button>
    );
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* Quantity Selector */}
      {showQuantity && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Quantity:</span>
          <div className="flex items-center border rounded-md">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={decrementQuantity}
              disabled={quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-12 text-center font-medium">{quantity}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={incrementQuantity}
              disabled={quantity >= maxQuantity}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Add to Cart Button */}
      <Button
        onClick={handleAddToCart}
        disabled={needsVariation || isAdding}
        className="w-full"
        size="lg"
      >
        {isAdding ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Adding...
          </>
        ) : needsVariation ? (
          "Select options"
        ) : (
          <>
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add to Cart
          </>
        )}
      </Button>
    </div>
  );
}
