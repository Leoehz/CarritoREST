import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="text-xl font-light text-gray-900 tracking-wide">
              MINIMAL
            </Link>
            <p className="text-sm text-gray-600 max-w-xs">
              Ropa minimalista y atemporal para el estilo de vida moderno. Calidad, simplicidad y sostenibilidad en cada
              pieza.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Enlaces Rápidos</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Productos
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Acerca de
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Carrito
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Atención al Cliente</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Contacto
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Envíos y Devoluciones
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Guía de Tallas
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Newsletter</h3>
            <p className="text-sm text-gray-600">Suscríbete para recibir ofertas exclusivas y novedades.</p>
            <div className="flex space-x-2">
              <Input type="email" placeholder="Tu email" className="flex-1 rounded-none border-gray-300" />
              <Button className="bg-gray-900 hover:bg-gray-800 text-white rounded-none">Suscribirse</Button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-200 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm text-gray-600">© 2024 MINIMAL. Todos los derechos reservados.</p>
          <div className="flex space-x-6 text-sm">
            <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
              Política de Privacidad
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
              Términos de Servicio
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
