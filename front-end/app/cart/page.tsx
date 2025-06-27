"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react"

export default function CartPage() {
  // Mock data - en producción vendría de GET /carritos/<carrito_id>
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      productId: 1,
      name: "Camiseta Esencial Premium",
      price: 29.99,
      color: "Blanco",
      size: "M",
      quantity: 2,
      image: "/placeholder.svg?height=200&width=150",
    },
    {
      id: 2,
      productId: 2,
      name: "Pantalón Chino Negro",
      price: 79.99,
      color: "Negro",
      size: "32",
      quantity: 1,
      image: "/placeholder.svg?height=200&width=150",
    },
  ])

  const updateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity === 0) {
      removeItem(itemId)
      return
    }

    setCartItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, quantity: newQuantity } : item)))

    // Aquí se haría la llamada a PUT /carritos/<carrito_id>
    console.log("Actualizando cantidad:", { itemId, newQuantity })
  }

  const removeItem = async (itemId: number) => {
    setCartItems((prev) => prev.filter((item) => item.id !== itemId))

    // Aquí se haría la llamada a DELETE /carritos/<carrito_id> o actualización
    console.log("Eliminando item:", itemId)
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal > 100 ? 0 : 10
  const total = subtotal + shipping

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center">
            <ShoppingBag className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h1 className="text-3xl font-light text-gray-900 mb-4">Tu carrito está vacío</h1>
            <p className="text-gray-600 mb-8">Descubre nuestros productos y encuentra algo que te guste</p>
            <Button asChild className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-none">
              <Link href="/products">Continuar Comprando</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-light text-gray-900 mb-8">Carrito de Compras</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id} className="border border-gray-200">
                <CardContent className="p-6">
                  <div className="flex space-x-4">
                    <div className="flex-shrink-0">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        width={120}
                        height={160}
                        className="object-cover bg-gray-50"
                      />
                    </div>

                    <div className="flex-1 space-y-4">
                      <div>
                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-600">
                          Color: {item.color} | Talla: {item.size}
                        </p>
                        <p className="text-lg font-medium text-gray-900 mt-2">${item.price}</p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="h-8 w-8 p-0 rounded-none border-gray-300"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>

                          <span className="font-medium text-gray-900 w-8 text-center">{item.quantity}</span>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="h-8 w-8 p-0 rounded-none border-gray-300"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="border border-gray-200 sticky top-8">
              <CardContent className="p-6">
                <h2 className="font-medium text-gray-900 mb-4">Resumen del Pedido</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">${subtotal.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Envío</span>
                    <span className="text-gray-900">{shipping === 0 ? "Gratis" : `$${shipping.toFixed(2)}`}</span>
                  </div>

                  {shipping === 0 && (
                    <p className="text-xs text-green-600">¡Envío gratis en pedidos superiores a $100!</p>
                  )}

                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between font-medium">
                      <span className="text-gray-900">Total</span>
                      <span className="text-gray-900">${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button asChild className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-none">
                    <Link href="/checkout">Proceder al Pago</Link>
                  </Button>

                  <Button asChild variant="outline" className="w-full border-gray-300 py-3 rounded-none">
                    <Link href="/products">Continuar Comprando</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
