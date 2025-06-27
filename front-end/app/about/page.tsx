import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Mail, Phone, MapPin } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[50vh] bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-light text-gray-900">Nuestra Historia</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto px-4">
            Creemos en la belleza de la simplicidad y en el poder de la calidad sobre la cantidad
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* About Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
          <div className="space-y-6">
            <h2 className="text-3xl font-light text-gray-900">Diseño Minimalista, Máximo Impacto</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Fundada en 2020, nuestra marca nació de la convicción de que la moda debe ser atemporal, sostenible y
                accesible. Nos especializamos en crear piezas esenciales que trascienden las tendencias pasajeras.
              </p>
              <p>
                Cada prenda es cuidadosamente diseñada y confeccionada con materiales de la más alta calidad,
                priorizando la comodidad, durabilidad y versatilidad. Creemos que menos es más, y que un guardarropa
                bien curado puede ser más poderoso que uno lleno.
              </p>
              <p>
                Nuestro compromiso va más allá de la moda: trabajamos con proveedores éticos, utilizamos materiales
                sostenibles y nos esforzamos por reducir nuestro impacto ambiental en cada paso del proceso.
              </p>
            </div>
          </div>

          <div className="relative">
            <Image
              src="/placeholder.svg?height=500&width=400"
              alt="Nuestro equipo"
              width={400}
              height={500}
              className="w-full h-[500px] object-cover bg-gray-50"
            />
          </div>
        </div>

        {/* Values */}
        <section className="mb-20">
          <h2 className="text-3xl font-light text-gray-900 text-center mb-12">Nuestros Valores</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-none text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl">🌱</span>
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-4">Sostenibilidad</h3>
                <p className="text-gray-600">
                  Comprometidos con prácticas éticas y materiales sostenibles que respetan nuestro planeta y las futuras
                  generaciones.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-none text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl">✨</span>
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-4">Calidad</h3>
                <p className="text-gray-600">
                  Cada pieza es meticulosamente crafted con atención al detalle y materiales premium para garantizar
                  durabilidad y comodidad.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-none text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-4">Simplicidad</h3>
                <p className="text-gray-600">
                  Diseños atemporales y versátiles que se adaptan a cualquier ocasión, eliminando la complejidad
                  innecesaria del vestir.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Contact Information */}
        <section className="bg-gray-50 -mx-4 px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-light text-gray-900 text-center mb-12">Contáctanos</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto">
                  <Mail className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Email</h3>
                  <p className="text-gray-600">hola@tiendaminimalista.com</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto">
                  <Phone className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Teléfono</h3>
                  <p className="text-gray-600">+1 (555) 123-4567</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto">
                  <MapPin className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Ubicación</h3>
                  <p className="text-gray-600">Barcelona, España</p>
                </div>
              </div>
            </div>

            <div className="mt-12 text-center">
              <p className="text-gray-600 mb-4">¿Tienes alguna pregunta? Estamos aquí para ayudarte.</p>
              <p className="text-sm text-gray-500">Horario de atención: Lunes a Viernes, 9:00 - 18:00 CET</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
