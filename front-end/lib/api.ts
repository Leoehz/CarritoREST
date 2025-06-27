const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Types matching your FastAPI schemas
export interface Product {
  id: number
  nombre: string
  precio: number
  stock: number
}

export interface CartItem {
  producto_id: number
  cantidad: number
}

export interface Cart {
  id: string
  user_id: string
  items: CartItem[]
}

export interface CartCreate {
  user_id: string
}

export interface CheckoutResponse {
  mensaje: string
  numero_seguimiento: string
}

// API Error class
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// API Service class
class ApiService {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new ApiError(
          errorData.detail || `HTTP error! status: ${response.status}`,
          response.status,
          errorData
        )
      }

      // Handle empty responses (like DELETE requests)
      if (response.status === 204) {
        return {} as T
      }

      return await response.json()
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      
      console.error('API request failed:', error)
      throw new ApiError(
        error instanceof Error ? error.message : 'Network error',
        0,
        error
      )
    }
  }

  // Product endpoints
  async getProducts(): Promise<Product[]> {
    return this.request<Product[]>('/productos')
  }

  // Cart endpoints
  async createCart(userId: string): Promise<Cart> {
    return this.request<Cart>('/carritos', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    })
  }

  async getCart(cartId: string): Promise<Cart> {
    return this.request<Cart>(`/carritos/${cartId}`)
  }

  async updateCart(cartId: string, items: CartItem[]): Promise<Cart> {
    return this.request<Cart>(`/carritos/${cartId}`, {
      method: 'PUT',
      body: JSON.stringify(items),
    })
  }

  async addToCart(cartId: string, items: CartItem[]): Promise<Cart> {
    return this.request<Cart>(`/carritos/${cartId}`, {
      method: 'PATCH',
      body: JSON.stringify(items),
    })
  }

  async deleteCart(cartId: string): Promise<void> {
    return this.request<void>(`/carritos/${cartId}`, {
      method: 'DELETE',
    })
  }

  async checkout(cartId: string): Promise<CheckoutResponse> {
    return this.request<CheckoutResponse>(`/pago/${cartId}/`)
  }

  // Health check
  async healthCheck(): Promise<{ mensaje: string }> {
    return this.request<{ mensaje: string }>('/')
  }
}

export const apiService = new ApiService(API_BASE_URL)