
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Search, PlusCircle, Eye, Edit, Trash2, Star, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import apiService from "@/lib/api";
import type { Product, Category, PaginationParams } from "@/lib/types/api";
import { PageHeader } from "../_components/page-header";
import { ManagedImage } from "@/components/managed-image";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchProducts = async (params?: PaginationParams) => {
    try {
      setLoading(true);
      let response;
      
      if (searchTerm) {
        response = await apiService.searchProducts({
          page: currentPage,
          limit: 10,
          search: searchTerm,
          ...params,
        });
      } else if (categoryFilter !== "all") {
        response = await apiService.getProductsByCategory(parseInt(categoryFilter), {
          page: currentPage,
          limit: 10,
          ...params,
        });
      } else {
        response = await apiService.getProducts({
          page: currentPage,
          limit: 10,
          ...params,
        });
      }

      if (response.status === 'success') {
        setProducts(response.data);
        setTotalPages(response.meta.total_pages);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch products",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiService.getCategories();
      if (response.status === 'success') {
        setCategories(response.data);
      }
    } catch (error: any) {
      console.error("Failed to fetch categories:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [currentPage, searchTerm, categoryFilter]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleCategoryFilter = (value: string) => {
    setCategoryFilter(value);
    setCurrentPage(1);
  };

  const handleDeleteProduct = async (productUuid: string) => {
    try {
      await apiService.adminDeleteProduct(productUuid);
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
      fetchProducts();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to delete product",
      });
    }
  };

  const openViewDialog = (product: Product) => {
    setSelectedProduct(product);
    setIsViewDialogOpen(true);
  };

  const filteredProducts = products;

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <PageHeader>Products Management</PageHeader>
        <Button asChild>
          <Link href="/admin/products/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Product
          </Link>
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Products</CardTitle>
              <CardDescription>
                Manage your product catalog
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={categoryFilter} onValueChange={handleCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading products...</div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => {
                    const primaryImage = product.images.find(img => img.is_primary) || product.images[0];
                    return (
                      <TableRow key={product.uuid}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="relative w-12 h-12 rounded-md overflow-hidden">
                              <ManagedImage
                                src={primaryImage?.url || '/placeholder-product.jpg'}
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <div className="font-medium">{product.name}</div>
                              <div className="text-sm text-muted-foreground">
                                SKU: {product.sku}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {product.category?.name || 'Uncategorized'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            {product.sale_price && (
                              <div className="text-sm text-muted-foreground line-through">
                                ₹{product.price.toFixed(2)}
                              </div>
                            )}
                            <div className="font-medium">
                              ₹{(product.sale_price || product.price).toFixed(2)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <span>{product.stock_quantity}</span>
                            {!product.in_stock && (
                              <Badge variant="destructive" className="text-xs">
                                Out of Stock
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Badge 
                              variant={product.status === 'active' ? 'default' : 'secondary'}
                              className={product.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                            >
                              {product.status}
                            </Badge>
                            {product.featured && (
                              <Badge variant="outline" className="text-xs">
                                <Star className="h-3 w-3 mr-1" />
                                Featured
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {product.average_rating > 0 ? (
                            <div className="flex items-center space-x-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm">
                                {product.average_rating.toFixed(1)} ({product.review_count})
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">No reviews</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openViewDialog(product)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/admin/products/${product.uuid}`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the product.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteProduct(product.uuid)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {filteredProducts.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No products found
                </div>
              )}

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Product Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
            <DialogDescription>
              {selectedProduct?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedProduct && (
            <div className="space-y-6">
              {/* Product Images */}
              <div className="grid grid-cols-4 gap-4">
                {selectedProduct.images.map((image, index) => (
                  <div key={index} className="relative aspect-square rounded-md overflow-hidden">
                    <ManagedImage
                      src={image.url}
                      alt={image.alt_text || selectedProduct.name}
                      fill
                      className="object-cover"
                    />
                    {image.is_primary && (
                      <div className="absolute top-2 left-2">
                        <Badge variant="default" className="text-xs">Primary</Badge>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Product Information */}
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <span className="font-medium">Name:</span> {selectedProduct.name}
                    </div>
                    <div>
                      <span className="font-medium">SKU:</span> {selectedProduct.sku}
                    </div>
                    <div>
                      <span className="font-medium">Category:</span> {selectedProduct.category?.name || 'Uncategorized'}
                    </div>
                    <div>
                      <span className="font-medium">Status:</span> {selectedProduct.status}
                    </div>
                    <div>
                      <span className="font-medium">Featured:</span> {selectedProduct.featured ? 'Yes' : 'No'}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Pricing & Stock</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <span className="font-medium">Price:</span> ₹{selectedProduct.price.toFixed(2)}
                    </div>
                    {selectedProduct.sale_price && (
                      <div>
                        <span className="font-medium">Sale Price:</span> ₹{selectedProduct.sale_price.toFixed(2)}
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Stock:</span> {selectedProduct.stock_quantity}
                    </div>
                    <div>
                      <span className="font-medium">In Stock:</span> {selectedProduct.in_stock ? 'Yes' : 'No'}
                    </div>
                    <div>
                      <span className="font-medium">Weight:</span> {selectedProduct.weight || 'N/A'}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Descriptions */}
              <div className="space-y-4">
                {selectedProduct.short_description && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Short Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{selectedProduct.short_description}</p>
                    </CardContent>
                  </Card>
                )}

                {selectedProduct.description && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div 
                        className="text-sm prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: selectedProduct.description }}
                      />
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Tags */}
              {selectedProduct.tags && selectedProduct.tags.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Tags</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.tags.map((tag) => (
                        <Badge key={tag.id} variant="outline">
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Reviews Summary */}
              {selectedProduct.review_count > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Reviews</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{selectedProduct.average_rating.toFixed(1)}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {selectedProduct.review_count} reviews
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
