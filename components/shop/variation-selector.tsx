"use client";

import { useState, useEffect } from "react";

import type { Product, ProductVariation, ProductDefaultAttribute } from "@/lib/woocommerce.d";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

interface VariationSelectorProps {
  product: Product;
  variations: ProductVariation[];
  onVariationChange: (variation: ProductVariation | null) => void;
}

export function VariationSelector({
  product,
  variations,
  onVariationChange,
}: VariationSelectorProps) {
  const [selectedAttributes, setSelectedAttributes] = useState<
    Record<string, string>
  >(() => {
    // Initialize with default attributes
    const defaults: Record<string, string> = {};
    product.default_attributes.forEach((attr) => {
      defaults[attr.name.toLowerCase()] = attr.option;
    });
    return defaults;
  });

  // Find matching variation when attributes change
  useEffect(() => {
    const matchingVariation = variations.find((variation) => {
      return variation.attributes.every((attr) => {
        const selectedValue = selectedAttributes[attr.name.toLowerCase()];
        // Empty option means "any" in WooCommerce
        return !attr.option || selectedValue === attr.option;
      });
    });

    onVariationChange(matchingVariation || null);
  }, [selectedAttributes, variations, onVariationChange]);

  const handleAttributeChange = (attributeName: string, value: string) => {
    setSelectedAttributes((prev) => ({
      ...prev,
      [attributeName.toLowerCase()]: value,
    }));
  };

  // Get available options for an attribute considering other selections
  const getAvailableOptions = (attributeName: string): string[] => {
    const attrLower = attributeName.toLowerCase();
    const otherSelections = { ...selectedAttributes };
    delete otherSelections[attrLower];

    // Find variations that match current other selections
    const matchingVariations = variations.filter((variation) => {
      return Object.entries(otherSelections).every(([name, value]) => {
        const varAttr = variation.attributes.find(
          (a) => a.name.toLowerCase() === name
        );
        return !varAttr?.option || varAttr.option === value;
      });
    });

    // Get unique options for this attribute from matching variations
    const options = new Set<string>();
    matchingVariations.forEach((variation) => {
      const attr = variation.attributes.find(
        (a) => a.name.toLowerCase() === attrLower
      );
      if (attr?.option) {
        options.add(attr.option);
      }
    });

    return Array.from(options);
  };

  if (product.type !== "variable" || product.attributes.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {product.attributes
        .filter((attr) => attr.variation)
        .map((attribute) => {
          const availableOptions = getAvailableOptions(attribute.name);
          const selectedValue = selectedAttributes[attribute.name.toLowerCase()];

          return (
            <div key={attribute.id} className="space-y-2">
              <Label>{attribute.name}</Label>
              <div className="flex flex-wrap gap-2">
                {attribute.options.map((option) => {
                  const isAvailable = availableOptions.includes(option);
                  const isSelected = selectedValue === option;

                  return (
                    <button
                      key={option}
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => handleAttributeChange(attribute.name, option)}
                      className={cn(
                        "px-4 py-2 text-sm border rounded-md transition-all",
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-input bg-background hover:bg-accent",
                        !isAvailable && "opacity-50 cursor-not-allowed line-through"
                      )}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
    </div>
  );
}
