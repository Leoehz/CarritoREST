"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter, Grid, List } from "lucide-react"

export default function ProductsPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("featured")
  const [filters, setFilters] = useState({
    categories: [] as string[],
    colors: [] as string[],
    sizes: [] as string[],
    priceRange: "all",
  })

  // Mock data - en producción vendría de GET /productos
  const products = [
    {
      id: 1,
      name: "Camiseta Esencial Blanca",
      price: 29.99,
      category: "Camisetas",
      color: "Blanco",
      sizes: ["S", "M", "L", "XL"],
      image: "/placeholder.svg?height=400&width=300",
      featured: true,
    },
    {
      id: 2,
      name: "Pantalón Chino Negro",
      price: 79.99,
      category: "Pantalones",
      color: "Negro",
      sizes: ["28", "30", "32", "34"],
      image: "/placeholder.svg?height=400&width=300",
      featured: false,
    },
    {
      id: 3,
      name: "Chaqueta Denim",
      price: 129.99,
      category: "Chaquetas",
      color: "Azul",
      sizes: ["S", "M", "L"],
      image: "/placeholder.svg?height=400&width=300",
      featured: true,
    },
    {
      id: 4,
      name: "Suéter de Lana",
      price: 89.99,
      category: "Suéteres",
      color: "Gris",
      sizes: ["S", "M", "L", "XL"],
      image: "/placeholder.svg?height=400&width=300",
      featured: false,
    },
    {
      id: 5,
      name: "Vestido Midi",
      price: 69.99,
      category: "Vestidos",
      color: "Negro",
      sizes: ["XS", "S", "M", "L"],
      image: "/placeholder.svg?height=400&width=300",
      featured: true,
    },
    {
      id: 6,
      name: "Camisa Oxford",
      price: 59.99,
      category: "Camisas",
      color: "Blanco",
      sizes: ["S", "M", "L", "XL"],
      image: "/placeholder.svg?height=400&width=300",
      featured: false,
    },
  ]

  const categories = ["Camisetas", "Pantalones", "Chaquetas", "Suéteres", "Vestidos", "Camisas"]
  const colors = ["Blanco", "Negro", "Azul", "Gris"]
  const sizes = ["XS", "S", "M", "L", "XL", "28", "30", "32", "34"]

  const handleFilterChange = (type: keyof typeof filters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [type]: prev[type].includes(value) ? prev[type].filter((item) => item !== value) : [...prev[type], value],
    }))
  }

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        if (filters.categories.length > 0 && !filters.categories.includes(product.category)) return false
        if (filters.colors.length > 0 && !filters.colors.includes(product.color)) return false
        return true
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "price-low":
            return a.price - b.price
          case "price-high":
            return b.price - a.price
          case "name":
            return a.name.localeCompare(b.name)
          default:
            return b.featured ? 1 : -1
        }
      })
  }, [filters, sortBy])

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-light text-gray-900">Todos los Productos</h1>
            <p className="text-gray-600 mt-2">{filteredProducts.length} productos encontrados</p>
          </div>

          <div className="flex items-center space-x-4">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48 border-gray-300 rounded-none">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Destacados</SelectItem>
                <SelectItem value="name">Nombre A-Z</SelectItem>
                <SelectItem value="price-low">Precio: Menor a Mayor</SelectItem>
                <SelectItem value="price-high">Precio: Mayor a Menor</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex border border-gray-300">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-none border-0"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-none border-0"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-64 space-y-6">
            <div className="bg-gray-50 p-6">
              <h3 className="font-medium text-gray-900 mb-4 flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </h3>

              {/* Categories */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Categorías</h4>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <Label key={category} className="flex items-center space-x-2 cursor-pointer">
                      <Checkbox
                        checked={filters.categories.includes(category)}
                        onCheckedChange={() => handleFilterChange("categories", category)}
                      />
                      <span className="text-sm text-gray-700">{category}</span>
                    </Label>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Colores</h4>
                <div className="space-y-2">
                  {colors.map((color) => (
                    <Label key={color} className="flex items-center space-x-2 cursor-pointer">
                      <Checkbox
                        checked={filters.colors.includes(color)}
                        onCheckedChange={() => handleFilterChange("colors", color)}
                      />
                      <span className="text-sm text-gray-700">{color}</span>
                    </Label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8" : "space-y-6"}>
              {filteredProducts.map((product) => (
                <Card key={product.id} className="border-0 shadow-none group">
                  <Link href={`/products/${product.id}`}>
                    <CardContent className="p-0">
                      {viewMode === "grid" ? (
                        <>
                          <div className="relative overflow-hidden bg-gray-50">
                            <Image
                              src={product.image || "/placeholder.svg"}
                              alt={product.name}
                              width={300}
                              height={400}
                              className="w-full h-[400px] object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          </div>
                          <div className="pt-4">
                            <p className="text-sm text-gray-500 mb-1">{product.category}</p>
                            <h3 className="font-medium text-gray-900 mb-2">{product.name}</h3>
                            <p className="text-lg text-gray-900">${product.price}</p>
                          </div>
                        </>
                      ) : (
                        <div className="flex space-x-4 p-4 border border-gray-200">
                          <Image
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            width={120}
                            height={160}
                            className="object-cover bg-gray-50"
                          />
                          <div className="flex-1">
                            <p className="text-sm text-gray-500 mb-1">{product.category}</p>
                            <h3 className="font-medium text-gray-900 mb-2">{product.name}</h3>
                            <p className="text-lg text-gray-900 mb-2">${product.price}</p>
                            <p className="text-sm text-gray-600">Disponible en: {product.sizes.join(", ")}</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
