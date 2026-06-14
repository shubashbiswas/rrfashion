"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Plus, Minus, Trash2, ArrowLeft } from "lucide-react";

import { useCart } from "@/components/shop/cart-provider";
import { formatPrice } from "@/lib/woocommerce";
import { Section, Container } from "@/components/craft";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function CartPage() {
  const {
    cart,
    isLoading,
    removeItem,
    updateQuantity,
    clearCart,
  } = useCart();

  if (isLoading) {
    return (
      <Section>
        <Container>
          <div className="flex items-center justify-center py-12">
            <div className="animate-pulse text-muted-foreground">
              Loading cart...
            </div>
          </div>
        </Container>
      </Section>
    );
  }

  if (cart.items.length === 0) {
    return (
      <Section>
        <Container>
          <div className="flex flex-col items-center justify-center py-12 space-y-6">
            <ShoppingCart className="h-24 w-24 text-muted-foreground/30" />
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold">Your cart is empty</h1>
              <p className="text-muted-foreground">
                Looks like you haven&apos;t added anything to your cart yet.
              </p>
            </div>
            <Button asChild size="lg">
              <Link href="/shop">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Continue Shopping
              </Link>
            </Button>
          </div>
        </Container>
      </Section>
    );
  }

  return (
    <Section>
      <Container>
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Shopping Cart</h1>
            <Button variant="ghost" onClick={clearCart}>
              Clear Cart
            </Button>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item) => (
                <div
                  key={`${item.productId}-${item.variationId || ""}`}
                  className="flex gap-4 p-4 border rounded-lg"
                >
                  {/* Image */}
                  <div className="relative h-24 w-24 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-muted-foreground text-xs">
                        No image
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium">{item.name}</h3>

                    {item.attributes && item.attributes.length > 0 && (
                      <p className="text-sm text-muted-foreground">
                        {item.attributes.map((a) => a.option).join(", ")}
                      </p>
                    )}

                    <p className="font-medium mt-1">
                      {formatPrice(item.price)}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center border rounded-md">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.quantity - 1,
                              item.variationId
                            )
                          }
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-10 text-center">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.quantity + 1,
                              item.variationId
                            )
                          }
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() =>
                          removeItem(item.productId, item.variationId)
                        }
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>

                  {/* Line Total */}
                  <div className="text-right">
                    <p className="font-bold">
                      {formatPrice(
                        (parseFloat(item.price) * item.quantity).toString()
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="border rounded-lg p-6 space-y-4 sticky top-4">
                <h2 className="text-xl font-bold">Order Summary</h2>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Subtotal ({cart.totals.itemCount} items)
                    </span>
                    <span>{formatPrice(cart.totals.subtotal)}</span>
                  </div>

                  {parseFloat(cart.totals.shipping) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>{formatPrice(cart.totals.shipping)}</span>
                    </div>
                  )}

                  {parseFloat(cart.totals.tax) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax</span>
                      <span>{formatPrice(cart.totals.tax)}</span>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatPrice(cart.totals.total)}</span>
                </div>

                <Button asChild className="w-full" size="lg">
                  <Link href="/checkout">Proceed to Checkout</Link>
                </Button>

                <Button variant="outline" asChild className="w-full">
                  <Link href="/shop">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Continue Shopping
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
