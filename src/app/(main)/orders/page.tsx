"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ManagedImage } from "@/components/managed-image";
import { Loader2, Package, Calendar, MapPin, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import apiService from "@/lib/api";
import type { Order } from "@/lib/types/api";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await apiService.getUserOrders();
        if (response.status === 'success') {
          setOrders(response.data.data || []);
        }
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.response?.data?.message || "Failed to load orders",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [toast]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-purple-100 text-purple-800';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-20">
        <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-3xl font-headline font-bold mb-4">No Orders Yet</h1>
        <p className="text-muted-foreground mb-6">
          You haven't placed any orders yet. Start shopping to see your orders here.
        </p>
        <Button asChild>
          <Link href="/products">Start Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-headline font-bold">My Orders</h1>
        <p className="text-muted-foreground">{orders.length} orders</p>
      </div>

      <div className="space-y-6">
        {orders.map((order) => (
          <Card key={order.id} className="overflow-hidden">
            <CardHeader className="bg-muted/50">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">Order #{order.order_number}</CardTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(order.created_at)}
                    </div>
                    <div className="flex items-center gap-1">
                      <CreditCard className="h-4 w-4" />
                      {order.payment_method.toUpperCase()}
                    </div>
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <Badge className={getStatusColor(order.status)}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                  <p className="text-lg font-semibold">₹{order.total.toFixed(2)}</p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-6">
              {/* Shipping Address */}
              {order.shipping_address && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Shipping Address</span>
                  </div>
                  <p className="text-sm text-muted-foreground ml-6">
                    {order.shipping_address.full_name}<br />
                    {order.shipping_address.address_line_1}
                    {order.shipping_address.address_line_2 && `, ${order.shipping_address.address_line_2}`}<br />
                    {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
                  </p>
                </div>
              )}

              <Separator className="my-4" />

              {/* Order Items */}
              <div className="space-y-4">
                <h4 className="font-medium">Items ({order.items?.length || 0})</h4>
                {order.items?.map((item) => {
                  const primaryImage = item.product.images?.find(img => img.is_primary) || item.product.images?.[0];
                  return (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="relative h-16 w-16 rounded-md border overflow-hidden flex-shrink-0">
                        <ManagedImage
                          src={primaryImage?.url || '/placeholder-product.jpg'}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-medium">{item.product.name}</h5>
                        <p className="text-sm text-muted-foreground">
                          Qty: {item.quantity} × ₹{item.price.toFixed(2)}
                        </p>
                        {item.variant && (
                          <p className="text-xs text-muted-foreground">
                            {item.variant.name}
                          </p>
                        )}
                      </div>
                      <p className="font-medium">₹{item.total.toFixed(2)}</p>
                    </div>
                  );
                })}
              </div>

              <Separator className="my-4" />

              {/* Order Summary */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>₹{order.subtotal.toFixed(2)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-₹{order.discount.toFixed(2)}</span>
                  </div>
                )}
                {order.tax > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>₹{order.tax.toFixed(2)}</span>
                  </div>
                )}
                {order.shipping > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>₹{order.shipping.toFixed(2)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>₹{order.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/orders/${order.id}`}>View Details</Link>
                </Button>
                {order.status === 'delivered' && (
                  <Button variant="outline" size="sm">
                    Leave Review
                  </Button>
                )}
                {['pending', 'confirmed'].includes(order.status.toLowerCase()) && (
                  <Button variant="destructive" size="sm">
                    Cancel Order
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}