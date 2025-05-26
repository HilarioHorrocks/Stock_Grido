"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { IceCream, Package, LogOut, AlertTriangle } from "lucide-react"
import HeladeriaManager from "../components/heladeria-manager"
import InsumosManager from "../components/insumos-manager"

// Datos iniciales de ejemplo
const initialHelados = [
  { id: 1, nombre: "Vainilla", stock: 25, precio: 150, categoria: "Clásico" },
  { id: 2, nombre: "Chocolate", stock: 30, precio: 150, categoria: "Clásico" },
  { id: 3, nombre: "Fresa", stock: 15, precio: 160, categoria: "Frutal" },
  { id: 4, nombre: "Dulce de Leche", stock: 20, precio: 170, categoria: "Especial" },
  { id: 5, nombre: "Menta Granizada", stock: 8, precio: 180, categoria: "Especial" },
]

const initialInsumos = [
  { id: 1, nombre: "Leche", stock: 50, unidad: "Litros", proveedor: "Lácteos SA", stockMinimo: 10 },
  { id: 2, nombre: "Azúcar", stock: 25, unidad: "Kg", proveedor: "Dulces Corp", stockMinimo: 5 },
  { id: 3, nombre: "Huevos", stock: 100, unidad: "Unidades", proveedor: "Granja Feliz", stockMinimo: 20 },
  { id: 4, nombre: "Vainilla", stock: 3, unidad: "Litros", proveedor: "Esencias SA", stockMinimo: 2 },
  { id: 5, nombre: "Chocolate", stock: 15, unidad: "Kg", proveedor: "Cacao Premium", stockMinimo: 5 },
]

export default function Dashboard() {
  const [helados, setHelados] = useState(initialHelados)
  const [insumos, setInsumos] = useState(initialInsumos)

  const handleLogout = () => {
    window.location.reload()
  }

  const insumosConStockBajo = insumos.filter((insumo) => insumo.stock <= insumo.stockMinimo)
  const heladosConStockBajo = helados.filter((helado) => helado.stock <= 10)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <IceCream className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Heladería Stock Control</h1>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alertas de Stock Bajo */}
        {(insumosConStockBajo.length > 0 || heladosConStockBajo.length > 0) && (
          <div className="mb-6">
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center text-orange-800">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Alertas de Stock Bajo
                </CardTitle>
              </CardHeader>
              <CardContent>
                {insumosConStockBajo.length > 0 && (
                  <div className="mb-2">
                    <p className="font-medium text-orange-800">Insumos con stock bajo:</p>
                    <p className="text-orange-700">{insumosConStockBajo.map((i) => i.nombre).join(", ")}</p>
                  </div>
                )}
                {heladosConStockBajo.length > 0 && (
                  <div>
                    <p className="font-medium text-orange-800">Helados con stock bajo:</p>
                    <p className="text-orange-700">{heladosConStockBajo.map((h) => h.nombre).join(", ")}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Helados</CardTitle>
              <IceCream className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{helados.length}</div>
              <p className="text-xs text-muted-foreground">Sabores disponibles</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stock Total Helados</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{helados.reduce((sum, h) => sum + h.stock, 0)}</div>
              <p className="text-xs text-muted-foreground">Litros en stock</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Insumos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{insumos.length}</div>
              <p className="text-xs text-muted-foreground">Tipos de insumos</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alertas</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {insumosConStockBajo.length + heladosConStockBajo.length}
              </div>
              <p className="text-xs text-muted-foreground">Items con stock bajo</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs para Gestión */}
        <Tabs defaultValue="helados" className="space-y-4">
          <TabsList>
            <TabsTrigger value="helados">
              <IceCream className="w-4 h-4 mr-2" />
              Gestión de Helados
            </TabsTrigger>
            <TabsTrigger value="insumos">
              <Package className="w-4 h-4 mr-2" />
              Gestión de Insumos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="helados">
            <HeladeriaManager helados={helados} setHelados={setHelados} />
          </TabsContent>

          <TabsContent value="insumos">
            <InsumosManager insumos={insumos} setInsumos={setInsumos} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
