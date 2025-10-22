"use client";

import type { Product, CartItem as APICartItem, CartSummary } from '@/lib/types/api';
import type { ReactNode } from 'react';
import React, { createContext, useState, useCallback, useEffect } from 'react';
import apiService from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export interface CartItem {
  id: number;
  product: Product;
  variant?: any;
  quantity: number;
  price: number;
  total: number;
}

interface CartContextType {
  items: CartItem[];
  summary: CartSummary | null;
  loading: boolean;
  addToCart: (product: Product, quantity?: number, variantId?: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  applyCoupon: (couponCode: string) => Promise<void>;
  removeCoupon: () => Promise<void>;
  saveCart: () => Promise<void>;
  restoreCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  cartTotal: number;
  cartCount: number;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [summary, setSummary] = useState<CartSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Check if user is authenticated
  const isAuthenticated = () => {
    if (typeof window === 'undefined') return false;
    const user = localStorage.getItem('user');
    return !!user;
  };

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated()) return;
    
    try {
      setLoading(true);
      const response = await apiService.getCart();
      if (response.status === 'success') {
        setItems(response.data.items || []);
      }
    } catch (error: any) {
      console.error('Failed to refresh cart:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const getSummary = useCallback(async () => {
    if (!isAuthenticated()) return;
    
    try {
      const response = await apiService.getCartSummary();
      if (response.status === 'success') {
        setSummary(response.data);
      }
    } catch (error: any) {
      console.error('Failed to get cart summary:', error);
    }
  }, []);

  const addToCart = useCallback(async (product: Product, quantity = 1, variantId?: number) => {
    if (!isAuthenticated()) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please log in to add items to your cart.",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await apiService.addToCart({
        product_uuid: product.uuid,
        quantity,
        variant_id: variantId,
      });

      if (response.status === 'success') {
        await refreshCart();
        await getSummary();
        toast({
          title: "Added to cart",
          description: `${product.name} has been added to your cart.`,
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to add item to cart",
      });
    } finally {
      setLoading(false);
    }
  }, [refreshCart, getSummary, toast]);

  const removeFromCart = useCallback(async (itemId: number) => {
    if (!isAuthenticated()) return;

    try {
      setLoading(true);
      await apiService.removeFromCart(itemId);
      await refreshCart();
      await getSummary();
      toast({
        title: "Removed from cart",
        description: "Item has been removed from your cart.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to remove item from cart",
      });
    } finally {
      setLoading(false);
    }
  }, [refreshCart, getSummary, toast]);

  const updateQuantity = useCallback(async (itemId: number, quantity: number) => {
    if (!isAuthenticated()) return;

    if (quantity <= 0) {
      await removeFromCart(itemId);
      return;
    }

    try {
      setLoading(true);
      const response = await apiService.updateCartItem(itemId, { quantity });
      
      if (response.status === 'success') {
        await refreshCart();
        await getSummary();
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to update item quantity",
      });
    } finally {
      setLoading(false);
    }
  }, [removeFromCart, refreshCart, getSummary, toast]);

  const clearCart = useCallback(async () => {
    if (!isAuthenticated()) return;

    try {
      setLoading(true);
      await apiService.clearCart();
      setItems([]);
      setSummary(null);
      toast({
        title: "Cart cleared",
        description: "All items have been removed from your cart.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to clear cart",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const applyCoupon = useCallback(async (couponCode: string) => {
    if (!isAuthenticated()) return;

    try {
      setLoading(true);
      const response = await apiService.applyCoupon({ coupon_code: couponCode });
      
      if (response.status === 'success') {
        await getSummary();
        toast({
          title: "Coupon applied",
          description: "Discount has been applied to your cart.",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to apply coupon",
      });
    } finally {
      setLoading(false);
    }
  }, [getSummary, toast]);

  const removeCoupon = useCallback(async () => {
    if (!isAuthenticated()) return;

    try {
      setLoading(true);
      await apiService.removeCoupon();
      await getSummary();
      toast({
        title: "Coupon removed",
        description: "Discount has been removed from your cart.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to remove coupon",
      });
    } finally {
      setLoading(false);
    }
  }, [getSummary, toast]);

  const saveCart = useCallback(async () => {
    if (!isAuthenticated()) return;

    try {
      const response = await apiService.saveCart();
      if (response.status === 'success') {
        toast({
          title: "Cart saved",
          description: "Your cart has been saved for later.",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to save cart",
      });
    }
  }, [toast]);

  const restoreCart = useCallback(async () => {
    if (!isAuthenticated()) return;

    try {
      const response = await apiService.restoreCart();
      if (response.status === 'success') {
        await refreshCart();
        await getSummary();
        toast({
          title: "Cart restored",
          description: "Your saved cart has been restored.",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to restore cart",
      });
    }
  }, [refreshCart, getSummary, toast]);

  // Load cart on mount and when authentication changes
  useEffect(() => {
    if (isAuthenticated()) {
      refreshCart();
      getSummary();
    } else {
      setItems([]);
      setSummary(null);
    }
  }, [refreshCart, getSummary]);

  // Calculate totals from summary or fallback to items
  const cartTotal = summary?.total || items.reduce((total, item) => total + item.total, 0);
  const cartCount = items.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        summary,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        applyCoupon,
        removeCoupon,
        saveCart,
        restoreCart,
        refreshCart,
        cartTotal,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
