
"use client";

import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import type { Product } from "@/lib/types/api";
import { ShoppingCart, Loader2 } from "lucide-react";

interface AddToCartButtonProps {
    product: Product;
    variant?: any;
    quantity?: number;
}

export function AddToCartButton({ product, variant, quantity = 1 }: AddToCartButtonProps) {
    const { addToCart, loading } = useCart();

    const handleAddToCart = async () => {
        await addToCart(product, quantity, variant?.id);
    };

    return (
        <Button 
            size="lg" 
            className="w-full md:w-auto" 
            onClick={handleAddToCart}
            disabled={loading}
        >
            {loading ? (
                <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Adding...
                </>
            ) : (
                <>
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Add to Cart
                </>
            )}
        </Button>
    );
}
