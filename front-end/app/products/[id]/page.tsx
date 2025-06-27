"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart, ShoppingCart, Star } from "lucide-react"
import { useParams } from "next/navigation"

export default function ProductDetailPage() {
  const params = useParams()
  const [selectedSize, setSelectedSize] = useState("")
  const [selectedColor, setSelectedColor] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [activeImage, setActiveImage] = useState(0)

  // Mock data - en producción vendría de GET /productos/{id}
  const product = {
    id: Number.parseInt(params.id as string),
    name: "Camiseta Esencial Premium",
    price: 29.99,
    originalPrice: 39.99,
    description:
      "Una camiseta esencial confeccionada con algodón orgánico de la más alta calidad. Diseño minimalista que se adapta perfectamente a cualquier ocasión, desde el día a día hasta eventos especiales.",
    features: ["100% algodón orgánico", "Corte regular", "Cuello redondo", "Manga corta", "Lavable a máquina"],
    images: [
      "/placeholder.svg?height=600&width=500",
      "/placeholder.svg?height=600&width=500",
      "/placeholder.svg?height=600&width=500",
      "/placeholder.svg?height=600&width=500",
    ],
    colors: [
      { name: "Blanco", value: "white" },
      { name: "Negro", value: "black" },
      { name: "Gris", value: "gray" },
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    rating: 4.5,
    reviews: 128,
    inStock: true,
  }

  const handleAddToCart = async () => {
    if (!selectedSize || !selectedColor) {
      alert("Por favor selecciona talla y color")
      return
    }

    // Aquí se haría la llamada a PATCH /carritos/<carrito_id>
    console.log("Agregando al carrito:", {
      productId: product.id,
      size: selectedSize,
      color: selectedColor,
      quantity,
    })

    alert("Producto agregado al carrito")
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-[4/5] bg-gray-50 overflow-hidden">
              <Image
                src={product.images[activeImage] || "/placeholder.svg"}
                alt={product.name}
                width={500}
                height={600}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="grid grid-cols-4 gap-4">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImage(index)}
                  className={`aspect-square bg-gray-50 overflow-hidden border-2 ${
                    activeImage === index ? "border-gray-900" : "border-transparent"
                  }`}
                >
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`${product.name} ${index + 1}`}
                    width={120}
                    height={120}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-light text-gray-900 mb-4">{product.name}</h1>

              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm text-gray-600">
                    {product.rating} ({product.reviews} reseñas)
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-4 mb-6">
                <span className="text-3xl font-light text-gray-900">${product.price}</span>
                {product.originalPrice && (
                  <span className="text-xl text-gray-500 line-through">${product.originalPrice}</span>
                )}
              </div>
            </div>

            <div className="space-y-6">
              {/* Color Selection */}
              <div>
                <Label className="text-base font-medium text-gray-900 mb-3 block">Color</Label>
                <RadioGroup value={selectedColor} onValueChange={setSelectedColor}>
                  <div className="flex space-x-3">
                    {product.colors.map((color) => (
                      <Label
                        key={color.value}
                        className="flex items-center space-x-2 cursor-pointer border border-gray-300 px-4 py-2 hover:border-gray-900 has-[:checked]:border-gray-900 has-[:checked]:bg-gray-50"
                      >
                        <RadioGroupItem value={color.value} />
                        <span>{color.name}</span>
                      </Label>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              {/* Size Selection */}
              <div>
                <Label className="text-base font-medium text-gray-900 mb-3 block">Talla</Label>
                <RadioGroup value={selectedSize} onValueChange={setSelectedSize}>
                  <div className="flex space-x-3">
                    {product.sizes.map((size) => (
                      <Label
                        key={size}
                        className="flex items-center justify-center w-12 h-12 cursor-pointer border border-gray-300 hover:border-gray-900 has-[:checked]:border-gray-900 has-[:checked]:bg-gray-900 has-[:checked]:text-white"
                      >
                        <RadioGroupItem value={size} className="sr-only" />
                        <span className="font-medium">{size}</span>
                      </Label>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              {/* Quantity */}
              <div>
                <Label className="text-base font-medium text-gray-900 mb-3 block">Cantidad</Label>
                <Select value={quantity.toString()} onValueChange={(value) => setQuantity(Number.parseInt(value))}>
                  <SelectTrigger className="w-24 border-gray-300 rounded-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <Button
                  onClick={handleAddToCart}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white py-4 rounded-none text-base"
                  disabled={!product.inStock}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  {product.inStock ? "Agregar al Carrito" : "Agotado"}
                </Button>

                <Button
                  variant="outline"
                  className="w-full border-gray-300 hover:border-gray-900 py-4 rounded-none text-base"
                >
                  <Heart className="mr-2 h-5 w-5" />
                  Agregar a Favoritos
                </Button>
              </div>
            </div>

            {/* Product Details */}
            <Card className="border-0 bg-gray-50">
              <CardContent className="p-6">
                <h3 className="font-medium text-gray-900 mb-4">Detalles del Producto</h3>
                <p className="text-gray-700 mb-4">{product.description}</p>
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-center">
                      <span className="w-2 h-2 bg-gray-400 rounded-full mr-3"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
