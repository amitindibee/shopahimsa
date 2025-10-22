
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCart } from "@/hooks/use-cart";
import type { Product } from "@/lib/types/api";
import { ShoppingCart, Plus, Minus, Loader2 } from "lucide-react";

interface AddToCartFormProps {
    product: Product;
    disabled?: boolean;
}

export function AddToCartForm({ product, disabled }: AddToCartFormProps) {
    const { addToCart, loading } = useCart();
    const [quantity, setQuantity] = useState(1);
    const [selectedVariant, setSelectedVariant] = useState<any>(null);

    const handleAddToCart = async () => {
        if (disabled || loading) return;
        await addToCart(product, quantity, selectedVariant?.id);
    };

    const increment = () => setQuantity(prev => prev + 1);
    const decrement = () => setQuantity(prev => Math.max(1, prev - 1));

    const isOutOfStock = disabled || (product.stock !== undefined && product.stock <= 0);
    const isVariantOutOfStock = selectedVariant && selectedVariant.stock <= 0;

    return (
        <div className="space-y-4">
            {/* Variants Selection */}
            {product.variants && product.variants.length > 0 && (
                <div className="space-y-2">
                    <label className="text-sm font-medium">Select Variant:</label>
                    <Select onValueChange={(value) => {
                        const variant = product.variants?.find(v => v.id.toString() === value);
                        setSelectedVariant(variant);
                    }}>
                        <SelectTrigger>
                            <SelectValue placeholder="Choose a variant" />
                        </SelectTrigger>
                        <SelectContent>
                            {product.variants.map((variant) => (
                                <SelectItem 
                                    key={variant.id} 
                                    value={variant.id.toString()}
                                    disabled={variant.stock <= 0}
                                >
                                    {variant.name} - ₹{variant.price.toFixed(2)}
                                    {variant.stock <= 0 && " (Out of Stock)"}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center gap-2">
                    <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={decrement} 
                        className="w-12 h-12" 
                        disabled={disabled || loading}
                    >
                        <Minus className="h-4 w-4" />
                    </Button>
                    <span className="flex items-center justify-center w-12 h-12 text-lg font-bold border rounded-md">
                        {quantity}
                    </span>
                    <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={increment} 
                        className="w-12 h-12" 
                        disabled={disabled || loading}
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
                <Button 
                    size="lg" 
                    className="flex-1 h-12" 
                    onClick={handleAddToCart} 
                    disabled={isOutOfStock || isVariantOutOfStock || loading || (product.variants && product.variants.length > 0 && !selectedVariant)}
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Adding...
                        </>
                    ) : (
                        <>
                            <ShoppingCart className="mr-2 h-5 w-5" />
                            {isOutOfStock || isVariantOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                        </>
                    )}
                </Button>
            </div>

            {/* Stock Information */}
            {product.stock !== undefined && (
                <p className="text-sm text-muted-foreground">
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </p>
            )}
            
            {selectedVariant && (
                <p className="text-sm text-muted-foreground">
                    {selectedVariant.stock > 0 ? `${selectedVariant.stock} in stock` : 'Out of stock'}
                </p>
            )}
        </div>
    );
}
