'use client';

import { useState, useEffect } from 'react';
import { FridgeItem, FridgeCategory, Unit } from '@/app/lib/types/fridge';
import { X } from 'lucide-react';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  editItem?: FridgeItem | null;
}

const CATEGORIES: FridgeCategory[] = [
  'Fruits',
  'Légumes',
  'Viandes',
  'Poissons',
  'Produits laitiers',
  'Céréales',
  'Condiments',
  'Autre',
];

const UNITS: Unit[] = ['g', 'kg', 'ml', 'L', 'pcs', 'cup', 'tbsp'];

export default function AddItemModal({ isOpen, onClose, onSubmit, editItem }: AddItemModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    unit: 'pcs' as Unit,
    category: 'Autre' as FridgeCategory,
    expirationDate: '',
    notes: '',
  });

  useEffect(() => {
    if (editItem) {
      setFormData({
        name: editItem.name,
        quantity: editItem.quantity.toString(),
        unit: editItem.unit,
        category: editItem.category,
        expirationDate: editItem.expirationDate
          ? new Date(editItem.expirationDate).toISOString().split('T')[0]
          : '',
        notes: editItem.notes || '',
      });
    } else {
      setFormData({
        name: '',
        quantity: '',
        unit: 'pcs',
        category: 'Autre',
        expirationDate: '',
        notes: '',
      });
    }
  }, [editItem, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const submitData = {
      name: formData.name,
      quantity: parseFloat(formData.quantity),
      unit: formData.unit,
      category: formData.category,
      expirationDate: formData.expirationDate || undefined,
      notes: formData.notes || undefined,
    };

    onSubmit(submitData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">
            {editItem ? 'Modifier l\'article' : 'Ajouter un article'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Fermer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nom de l'article *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Ex: Tomates"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                Quantité *
              </label>
              <input
                type="number"
                id="quantity"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="1"
                min="0.01"
                step="0.01"
                required
              />
            </div>

            <div>
              <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">
                Unité *
              </label>
              <select
                id="unit"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value as Unit })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              >
                {UNITS.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Catégorie *
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as FridgeCategory })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            >
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="expirationDate" className="block text-sm font-medium text-gray-700 mb-1">
              Date d'expiration
            </label>
            <input
              type="date"
              id="expirationDate"
              value={formData.expirationDate}
              onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
              placeholder="Remarques..."
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium rounded-lg hover:from-orange-600 hover:to-red-600 transition-colors"
            >
              {editItem ? 'Mettre à jour' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
