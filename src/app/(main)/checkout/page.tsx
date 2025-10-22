
"use client";

import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ManagedImage } from "@/components/managed-image";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCard, Landmark, Wallet, Loader2, Tag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import apiService from "@/lib/api";

const checkoutSchema = z.object({
  shipping_address: z.object({
    full_name: z.string().min(2, "Full name is required"),
    address_line_1: z.string().min(5, "Address is required"),
    address_line_2: z.string().optional(),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
    postal_code: z.string().min(6, "Invalid postal code").max(6, "Invalid postal code"),
    country: z.string().default("India"),
    phone: z.string().min(10, "Phone number is required"),
  }),
  payment_method: z.enum(["card", "netbanking", "upi", "cod"]),
  notes: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const { items, summary, cartTotal, clearCart, applyCoupon, removeCoupon } = useCart();
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      payment_method: "card",
      shipping_address: {
        country: "India",
      },
    },
  });

  // Load user profile data if available
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const response = await apiService.getUserProfile();
        if (response.status === 'success' && response.data) {
          const user = response.data;
          form.setValue('shipping_address.full_name', user.name || '');
          form.setValue('shipping_address.phone', user.phone || '');
          // You can set other fields if they exist in user profile
        }
      } catch (error) {
        // User profile not available or not logged in
        console.log('Could not load user profile');
      }
    };

    loadUserProfile();
  }, [form]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    
    setApplyingCoupon(true);
    await applyCoupon(couponCode);
    setCouponCode("");
    setApplyingCoupon(false);
  };

  const handleRemoveCoupon = async () => {
    await removeCoupon();
  };

  const onSubmit: SubmitHandler<CheckoutFormValues> = async (data) => {
    try {
      setLoading(true);
      
      const orderData = {
        shipping_address: data.shipping_address,
        payment_method: data.payment_method,
        notes: data.notes,
      };

      const response = await apiService.createOrder(orderData);
      
      if (response.status === 'success') {
        toast({
          title: "Order Placed!",
          description: "Thank you for your purchase. Your order is being processed.",
        });
        
        // Clear cart after successful order
        await clearCart();
        
        // Redirect to order confirmation or tracking page
        router.push(`/orders/${response.data.id}`);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Order Failed",
        description: error.response?.data?.message || "Failed to place order. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <h1 className="text-3xl font-headline font-bold">Your Cart is Empty</h1>
        <p className="mt-4 text-muted-foreground">You can't proceed to checkout without any items.</p>
        <Button asChild className="mt-6">
          <a href="/products">Go Shopping</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      {/* Shipping & Payment Form */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Shipping & Payment</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <h3 className="font-semibold font-headline">Shipping Address</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="shipping_address.full_name"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="shipping_address.phone"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+91 9876543210" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="shipping_address.address_line_1"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Address Line 1</FormLabel>
                      <FormControl>
                        <Input placeholder="1234 Farm Lane" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="shipping_address.address_line_2"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Address Line 2 (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Apartment, suite, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="shipping_address.city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="Mumbai" {...field} />
                      </FormControl>
                       <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="shipping_address.state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input placeholder="Maharashtra" {...field} />
                      </FormControl>
                       <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="shipping_address.postal_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal Code</FormLabel>
                      <FormControl>
                        <Input placeholder="400001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="shipping_address.country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input placeholder="India" {...field} disabled />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order Notes (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Special delivery instructions..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              <FormField
                control={form.control}
                name="payment_method"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <h3 className="font-semibold font-headline">Payment Method</h3>
                     <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0 rounded-md border p-4 has-[:checked]:border-primary">
                          <FormControl>
                            <RadioGroupItem value="card" />
                          </FormControl>
                          <CreditCard className="mr-2 h-5 w-5" />
                          <FormLabel className="font-normal">Credit/Debit Card</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0 rounded-md border p-4 has-[:checked]:border-primary">
                          <FormControl>
                            <RadioGroupItem value="netbanking" />
                          </FormControl>
                          <Landmark className="mr-2 h-5 w-5" />
                          <FormLabel className="font-normal">Net Banking</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0 rounded-md border p-4 has-[:checked]:border-primary">
                          <FormControl>
                            <RadioGroupItem value="upi" />
                          </FormControl>
                           <Wallet className="mr-2 h-5 w-5" />
                          <FormLabel className="font-normal">UPI</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0 rounded-md border p-4 has-[:checked]:border-primary">
                          <FormControl>
                            <RadioGroupItem value="cod" />
                          </FormControl>
                           <Wallet className="mr-2 h-5 w-5" />
                          <FormLabel className="font-normal">Cash on Delivery</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                  </FormItem>
                )}
              />
               <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  "Place Order"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card className="bg-primary/5">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Coupon Section */}
          {summary?.coupon ? (
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  {summary.coupon.code}
                </span>
                <span className="text-sm text-green-600">
                  (-₹{summary.discount.toFixed(2)})
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveCoupon}
                className="text-green-600 hover:text-green-800"
              >
                Remove
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="flex-1"
              />
              <Button
                variant="outline"
                onClick={handleApplyCoupon}
                disabled={!couponCode.trim() || applyingCoupon}
              >
                {applyingCoupon ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Apply"
                )}
              </Button>
            </div>
          )}

          <Separator />

          {items.map(item => {
            const primaryImage = item.product.images?.find(img => img.is_primary) || item.product.images?.[0];
            return (
              <div key={item.id} className="flex justify-between items-center">
                 <div className="flex items-center gap-4">
                    <div className="relative h-16 w-16 rounded-md border overflow-hidden">
                      <ManagedImage
                          src={primaryImage?.url || '/placeholder-product.jpg'}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-semibold">{item.product.name}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      {item.variant && (
                        <p className="text-xs text-muted-foreground">{item.variant.name}</p>
                      )}
                    </div>
                 </div>
                 <p>₹{item.total.toFixed(2)}</p>
              </div>
            );
          })}
        </CardContent>
        <CardFooter className="flex flex-col gap-4 !pt-0">
          <Separator />
          {summary && (
            <>
              <div className="w-full flex justify-between">
                <p>Subtotal</p>
                <p>₹{summary.subtotal.toFixed(2)}</p>
              </div>
              {summary.discount > 0 && (
                <div className="w-full flex justify-between text-green-600">
                  <p>Discount</p>
                  <p>-₹{summary.discount.toFixed(2)}</p>
                </div>
              )}
              {summary.tax > 0 && (
                <div className="w-full flex justify-between">
                  <p>Tax</p>
                  <p>₹{summary.tax.toFixed(2)}</p>
                </div>
              )}
              <div className="w-full flex justify-between">
                <p>Shipping</p>
                <p>{summary.shipping > 0 ? `₹${summary.shipping.toFixed(2)}` : 'Free'}</p>
              </div>
              <Separator />
            </>
          )}
          <div className="w-full flex justify-between font-bold text-lg">
            <p>Total</p>
            <p>₹{cartTotal.toFixed(2)}</p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
