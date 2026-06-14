import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;

/**
 * WordPress webhook handler for content revalidation
 * Receives notifications from WordPress when content changes
 * and revalidates the entire site
 */

export async function POST(request: NextRequest) {
  try {
    // Try to parse JSON body; may be empty for some webhook formats
    let requestBody: Record<string, any> = {};
    try {
      requestBody = await request.json();
    } catch {
      // Body may be empty or not JSON - that's ok, we can use headers
    }

    const secret = request.headers.get("x-webhook-secret");

    if (secret !== process.env.WORDPRESS_WEBHOOK_SECRET) {
      console.error("Invalid webhook secret");
      return NextResponse.json(
        { message: "Invalid webhook secret" },
        { status: 401 }
      );
    }

    // Support both formats:
    // 1. Direct payload with contentType/contentId fields (WordPress plugin format)
    // 2. WooCommerce webhook payload with X-WC-Webhook-Topic header
    let { contentType, contentId } = requestBody;

    // If contentType isn't in the body, try to derive it from headers or body fields
    if (!contentType) {
      // Check WooCommerce webhook topic header (standard WooCommerce webhooks)
      const wcTopic = request.headers.get("x-wc-webhook-topic");
      if (wcTopic) {
        const parts = wcTopic.split(".");
        const resource = parts[0]; // e.g., "product", "order", "coupon", "customer"
        const event = parts[1]; // e.g., "created", "updated", "deleted"

        // Map WooCommerce webhook resources to our content types
        const contentTypeMap: Record<string, string> = {
          product: "product",
          order: "order",
          coupon: "coupon",
          customer: "customer",
        };

        contentType = contentTypeMap[resource] || resource;

        // Extract ID from WooCommerce webhook payload (usually `id` field)
        if (!contentId && requestBody?.id) {
          contentId = requestBody.id;
        }

        // Handle special WooCommerce stock update topic
        if (resource === "product" && event === "updated" && requestBody?.stock_quantity !== undefined) {
          // This is a stock update - we can keep it as "product" or use "stock_update"
          // but "product" revalidation already handles this
        }
      }

      // Fallback: check for a "type" field in the body (some plugins send this)
      if (!contentType && requestBody?.type) {
        contentType = requestBody.type;
      }

      // Last resort: try to determine from the body structure
      if (!contentType) {
        if (requestBody?.slug !== undefined) {
          // Has slug - likely a product/post/category
          contentType = "product";
          if (requestBody?.id) contentId = requestBody.id;
        } else if (requestBody?.sku !== undefined) {
          // Has SKU - definitely a product
          contentType = "product";
          if (requestBody?.id) contentId = requestBody.id;
        } else if (requestBody?.status !== undefined && requestBody?.billing !== undefined) {
          // Has billing info - likely an order
          contentType = "order";
          if (requestBody?.id) contentId = requestBody.id;
        } else if (requestBody?.product_id !== undefined && requestBody?.stock_quantity !== undefined) {
          // Stock update notification
          contentType = "stock_update";
          if (requestBody?.product_id) contentId = requestBody.product_id;
        }
      }
    }

    if (!contentType) {
      return NextResponse.json(
        { message: "Missing content type" },
        { status: 400 }
      );
    }

    try {
      console.log(
        `Revalidating content: ${contentType}${
          contentId ? ` (ID: ${contentId})` : ""
        }`
      );

      // Revalidate specific content type tags
      revalidateTag("wordpress", { expire: 0 });

      if (contentType === "post") {
        revalidateTag("posts", { expire: 0 });
        if (contentId) {
          revalidateTag(`post-${contentId}`, { expire: 0 });
        }
        // Clear all post pages when any post changes
        revalidateTag("posts-page-1", { expire: 0 });
      } else if (contentType === "category") {
        revalidateTag("categories", { expire: 0 });
        if (contentId) {
          revalidateTag(`posts-category-${contentId}`, { expire: 0 });
          revalidateTag(`category-${contentId}`, { expire: 0 });
        }
      } else if (contentType === "tag") {
        revalidateTag("tags", { expire: 0 });
        if (contentId) {
          revalidateTag(`posts-tag-${contentId}`, { expire: 0 });
          revalidateTag(`tag-${contentId}`, { expire: 0 });
        }
      } else if (contentType === "author" || contentType === "user") {
        revalidateTag("authors", { expire: 0 });
        if (contentId) {
          revalidateTag(`posts-author-${contentId}`, { expire: 0 });
          revalidateTag(`author-${contentId}`, { expire: 0 });
        }
      }
      // WooCommerce content types
      else if (contentType === "product") {
        revalidateTag("woocommerce", { expire: 0 });
        revalidateTag("products", { expire: 0 });
        if (contentId) {
          revalidateTag(`product-${contentId}`, { expire: 0 });
        }
        revalidateTag("products-page-1", { expire: 0 });
        revalidateTag("products-featured", { expire: 0 });
        revalidateTag("products-sale", { expire: 0 });
      } else if (contentType === "product_cat") {
        revalidateTag("woocommerce", { expire: 0 });
        revalidateTag("categories", { expire: 0 });
        if (contentId) {
          revalidateTag(`category-${contentId}`, { expire: 0 });
          revalidateTag(`products-category-${contentId}`, { expire: 0 });
        }
      } else if (contentType === "product_tag") {
        revalidateTag("woocommerce", { expire: 0 });
        revalidateTag("tags", { expire: 0 });
        if (contentId) {
          revalidateTag(`products-tag-${contentId}`, { expire: 0 });
        }
      } else if (contentType === "order") {
        revalidateTag("woocommerce", { expire: 0 });
        revalidateTag("orders", { expire: 0 });
        if (contentId) {
          revalidateTag(`order-${contentId}`, { expire: 0 });
        }
      } else if (contentType === "stock_update") {
        // Product stock was updated - revalidate product pages
        revalidateTag("woocommerce", { expire: 0 });
        revalidateTag("products", { expire: 0 });
        if (contentId) {
          revalidateTag(`product-${contentId}`, { expire: 0 });
        }
      }

      // Also revalidate the entire layout for safety
      revalidatePath("/", "layout");

      return NextResponse.json({
        revalidated: true,
        message: `Revalidated ${contentType}${
          contentId ? ` (ID: ${contentId})` : ""
        } and related content`,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error revalidating path:", error);
      return NextResponse.json(
        {
          revalidated: false,
          message: "Failed to revalidate site",
          error: (error as Error).message,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Revalidation error:", error);
    return NextResponse.json(
      {
        message: "Error revalidating content",
        error: (error as Error).message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
