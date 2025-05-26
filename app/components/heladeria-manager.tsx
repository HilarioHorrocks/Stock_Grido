"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, IceCream } from "lucide-react"

interface Helado {
  id: number
  nombre: string
  stock: number
  precio: number
  categoria: string
}

interface HeladeriaManagerProps {
  helados: Helado[]
  setHelados: (helados: Helado[]) => void
}

export default function HeladeriaManager({ helados, setHelados }: HeladeriaManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingHelado, setEditingHelado] = useState<Helado | null>(null)
  const [formData, setFormData] = useState({
    nombre: "",
    stock: "",
    precio: "",
    categoria: "",
  })

  const categorias = ["Clásico", "Frutal", "Especial", "Premium", "Sin Azúcar"]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingHelado) {
      // Editar helado existente
      setHelados(
        helados.map((h) =>
          h.id === editingHelado.id
            ? { ...h, ...formData, stock: Number(formData.stock), precio: Number(formData.precio) }
            : h,
        ),
      )
    } else {
      // Agregar nuevo helado
      const newHelado: Helado = {
        id: Math.max(...helados.map((h) => h.id), 0) + 1,
        nombre: formData.nombre,
        stock: Number(formData.stock),
        precio: Number(formData.precio),
        categoria: formData.categoria,
      }
      setHelados([...helados, newHelado])
    }

    resetForm()
  }

  const resetForm = () => {
    setFormData({ nombre: "", stock: "", precio: "", categoria: "" })
    setEditingHelado(null)
    setIsDialogOpen(false)
  }

  const handleEdit = (helado: Helado) => {
    setEditingHelado(helado)
    setFormData({
      nombre: helado.nombre,
      stock: helado.stock.toString(),
      precio: helado.precio.toString(),
      categoria: helado.categoria,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: number) => {
    setHelados(helados.filter((h) => h.id !== id))
  }

  const updateStock = (id: number, newStock: number) => {
    setHelados(helados.map((h) => (h.id === id ? { ...h, stock: Math.max(0, newStock) } : h)))
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center">
              <IceCream className="w-5 h-5 mr-2" />
              Gestión de Helados
            </CardTitle>
            <CardDescription>Administra el inventario de sabores de helado</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingHelado(null)}>
                <Plus className="w-4 h-4 mr-2" />
                Agregar Helado
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingHelado ? "Editar Helado" : "Agregar Nuevo Helado"}</DialogTitle>
                <DialogDescription>
                  {editingHelado ? "Modifica los datos del helado" : "Completa la información del nuevo sabor"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="nombre">Nombre del Sabor</Label>
                    <Input
                      id="nombre"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      placeholder="Ej: Chocolate con Almendras"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="categoria">Categoría</Label>
                    <Select
                      value={formData.categoria}
                      onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {categorias.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="stock">Stock (Litros)</Label>
                      <Input
                        id="stock"
                        type="number"
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                        placeholder="0"
                        min="0"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="precio">Precio por Litro</Label>
                      <Input
                        id="precio"
                        type="number"
                        value={formData.precio}
                        onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                        placeholder="0"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                  <Button type="submit">{editingHelado ? "Actualizar" : "Agregar"}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sabor</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Stock (L)</TableHead>
              <TableHead>Precio/L</TableHead>
              <TableHead>Valor Total</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {helados.map((helado) => (
              <TableRow key={helado.id} className={helado.stock <= 10 ? "bg-red-50" : ""}>
                <TableCell className="font-medium">{helado.nombre}</TableCell>
                <TableCell>{helado.categoria}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateStock(helado.id, helado.stock - 1)}
                      disabled={helado.stock <= 0}
                    >
                      -
                    </Button>
                    <span className={`min-w-[3rem] text-center ${helado.stock <= 10 ? "text-red-600 font-bold" : ""}`}>
                      {helado.stock}
                    </span>
                    <Button variant="outline" size="sm" onClick={() => updateStock(helado.id, helado.stock + 1)}>
                      +
                    </Button>
                  </div>
                </TableCell>
                <TableCell>${helado.precio}</TableCell>
                <TableCell>${(helado.stock * helado.precio).toFixed(2)}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(helado)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(helado.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {helados.length === 0 && (
          <div className="text-center py-8 text-gray-500">No hay helados registrados. ¡Agrega el primer sabor!</div>
        )}
      </CardContent>
    </Card>
  )
}
