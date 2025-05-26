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
import { Plus, Edit, Trash2, Package, AlertTriangle } from "lucide-react"

interface Insumo {
  id: number
  nombre: string
  stock: number
  unidad: string
  proveedor: string
  stockMinimo: number
}

interface InsumosManagerProps {
  insumos: Insumo[]
  setInsumos: (insumos: Insumo[]) => void
}

export default function InsumosManager({ insumos, setInsumos }: InsumosManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingInsumo, setEditingInsumo] = useState<Insumo | null>(null)
  const [formData, setFormData] = useState({
    nombre: "",
    stock: "",
    unidad: "",
    proveedor: "",
    stockMinimo: "",
  })

  const unidades = ["Kg", "Litros", "Unidades", "Gramos", "Cajas", "Paquetes"]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingInsumo) {
      // Editar insumo existente
      setInsumos(
        insumos.map((i) =>
          i.id === editingInsumo.id
            ? {
                ...i,
                ...formData,
                stock: Number(formData.stock),
                stockMinimo: Number(formData.stockMinimo),
              }
            : i,
        ),
      )
    } else {
      // Agregar nuevo insumo
      const newInsumo: Insumo = {
        id: Math.max(...insumos.map((i) => i.id), 0) + 1,
        nombre: formData.nombre,
        stock: Number(formData.stock),
        unidad: formData.unidad,
        proveedor: formData.proveedor,
        stockMinimo: Number(formData.stockMinimo),
      }
      setInsumos([...insumos, newInsumo])
    }

    resetForm()
  }

  const resetForm = () => {
    setFormData({ nombre: "", stock: "", unidad: "", proveedor: "", stockMinimo: "" })
    setEditingInsumo(null)
    setIsDialogOpen(false)
  }

  const handleEdit = (insumo: Insumo) => {
    setEditingInsumo(insumo)
    setFormData({
      nombre: insumo.nombre,
      stock: insumo.stock.toString(),
      unidad: insumo.unidad,
      proveedor: insumo.proveedor,
      stockMinimo: insumo.stockMinimo.toString(),
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: number) => {
    setInsumos(insumos.filter((i) => i.id !== id))
  }

  const updateStock = (id: number, newStock: number) => {
    setInsumos(insumos.map((i) => (i.id === id ? { ...i, stock: Math.max(0, newStock) } : i)))
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Gestión de Insumos
            </CardTitle>
            <CardDescription>Administra el inventario de materias primas y suministros</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingInsumo(null)}>
                <Plus className="w-4 h-4 mr-2" />
                Agregar Insumo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingInsumo ? "Editar Insumo" : "Agregar Nuevo Insumo"}</DialogTitle>
                <DialogDescription>
                  {editingInsumo ? "Modifica los datos del insumo" : "Completa la información del nuevo insumo"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="nombre">Nombre del Insumo</Label>
                    <Input
                      id="nombre"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      placeholder="Ej: Leche Entera"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="proveedor">Proveedor</Label>
                    <Input
                      id="proveedor"
                      value={formData.proveedor}
                      onChange={(e) => setFormData({ ...formData, proveedor: e.target.value })}
                      placeholder="Ej: Lácteos del Valle SA"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="stock">Stock Actual</Label>
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
                      <Label htmlFor="unidad">Unidad</Label>
                      <Select
                        value={formData.unidad}
                        onValueChange={(value) => setFormData({ ...formData, unidad: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona unidad" />
                        </SelectTrigger>
                        <SelectContent>
                          {unidades.map((unidad) => (
                            <SelectItem key={unidad} value={unidad}>
                              {unidad}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="stockMinimo">Stock Mínimo</Label>
                    <Input
                      id="stockMinimo"
                      type="number"
                      value={formData.stockMinimo}
                      onChange={(e) => setFormData({ ...formData, stockMinimo: e.target.value })}
                      placeholder="0"
                      min="0"
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                  <Button type="submit">{editingInsumo ? "Actualizar" : "Agregar"}</Button>
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
              <TableHead>Insumo</TableHead>
              <TableHead>Proveedor</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Unidad</TableHead>
              <TableHead>Stock Mín.</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {insumos.map((insumo) => {
              const stockBajo = insumo.stock <= insumo.stockMinimo
              return (
                <TableRow key={insumo.id} className={stockBajo ? "bg-red-50" : ""}>
                  <TableCell className="font-medium">{insumo.nombre}</TableCell>
                  <TableCell>{insumo.proveedor}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateStock(insumo.id, insumo.stock - 1)}
                        disabled={insumo.stock <= 0}
                      >
                        -
                      </Button>
                      <span className={`min-w-[3rem] text-center ${stockBajo ? "text-red-600 font-bold" : ""}`}>
                        {insumo.stock}
                      </span>
                      <Button variant="outline" size="sm" onClick={() => updateStock(insumo.id, insumo.stock + 1)}>
                        +
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>{insumo.unidad}</TableCell>
                  <TableCell>{insumo.stockMinimo}</TableCell>
                  <TableCell>
                    {stockBajo ? (
                      <div className="flex items-center text-red-600">
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        Bajo
                      </div>
                    ) : (
                      <span className="text-green-600">Normal</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(insumo)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(insumo.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
        {insumos.length === 0 && (
          <div className="text-center py-8 text-gray-500">No hay insumos registrados. ¡Agrega el primer insumo!</div>
        )}
      </CardContent>
    </Card>
  )
}
