"use client";

import { useState, useCallback } from "react";

import type { Product, ProductVariation } from "@/lib/woocommerce.d";
import { VariationSelector, AddToCartButton, PriceDisplay, StockBadge } from "@/components/shop";

interface ProductDetailClientProps {
  product: Product;
  variations: ProductVariation[];
}

export function ProductDetailClient({
  product,
  variations,
}: ProductDetailClientProps) {
  const [selectedVariation, setSelectedVariation] =
    useState<ProductVariation | null>(null);

  const handleVariationChange = useCallback(
    (variation: ProductVariation | null) => {
      setSelectedVariation(variation);
    },
    []
  );

  // Show variation price if selected, otherwise show product price range
  const displayPrice = selectedVariation?.price || product.price;
  const displayRegularPrice =
    selectedVariation?.regular_price || product.regular_price;
  const displaySalePrice = selectedVariation?.sale_price || product.sale_price;
  const isOnSale = selectedVariation?.on_sale ?? product.on_sale;

  return (
    <div className="space-y-6">
      {/* Variation Selector */}
      <VariationSelector
        product={product}
        variations={variations}
        onVariationChange={handleVariationChange}
      />

      {/* Updated Price Display */}
      {selectedVariation && (
        <div className="space-y-2">
          <PriceDisplay
            price={displayPrice}
            regularPrice={displayRegularPrice}
            salePrice={displaySalePrice}
            onSale={isOnSale}
            size="md"
          />
        </div>
      )}

      {/* Add to Cart */}
      <AddToCartButton product={product} variation={selectedVariation} />
    </div>
  );
}
