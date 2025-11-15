'use client';

import { useState, useEffect, useMemo } from 'react';
import { FridgeItem, FridgeCategory, ViewMode, SortOption } from '@/app/lib/types/fridge';
import { calculateFridgeStats, sortItems, filterItems } from '@/app/lib/utils/fridge-helpers';
import FridgeItemCard from '@/app/components/fridge/FridgeItemCard';
import AddItemModal from '@/app/components/fridge/AddItemModal';
import FridgeStats from '@/app/components/fridge/FridgeStats';
import ExpirationAlerts from '@/app/components/fridge/ExpirationAlerts';
import {
  Plus,
  Search,
  Grid3x3,
  List,
  SlidersHorizontal,
  RefreshCw,
} from 'lucide-react';

export default function FridgePage() {
  const [items, setItems] = useState<FridgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<FridgeItem | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('addedDate');
  const [selectedCategory, setSelectedCategory] = useState<FridgeCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showStats, setShowStats] = useState(true);

  const categories: (FridgeCategory | 'all')[] = [
    'all',
    'Fruits',
    'Légumes',
    'Viandes',
    'Poissons',
    'Produits laitiers',
    'Céréales',
    'Condiments',
    'Autre',
  ];

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/fridge');
      const data = await response.json();

      // Convertir les dates
      const itemsWithDates = data.items.map((item: any) => ({
        ...item,
        addedDate: new Date(item.addedDate),
        expirationDate: item.expirationDate ? new Date(item.expirationDate) : undefined,
      }));

      setItems(itemsWithDates);
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (data: any) => {
    try {
      const response = await fetch('/api/fridge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        await loadItems();
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const handleUpdateItem = async (data: any) => {
    if (!editItem) return;

    try {
      const response = await fetch(`/api/fridge/${editItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        await loadItems();
        setIsModalOpen(false);
        setEditItem(null);
      }
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) return;

    try {
      const response = await fetch(`/api/fridge/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadItems();
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleEditClick = (item: FridgeItem) => {
    setEditItem(item);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditItem(null);
  };

  const handleModalSubmit = (data: any) => {
    if (editItem) {
      handleUpdateItem(data);
    } else {
      handleAddItem(data);
    }
  };

  const filteredAndSortedItems = useMemo(() => {
    let result = items;

    // Filtrer par catégorie
    if (selectedCategory !== 'all') {
      result = filterItems(result, selectedCategory);
    }

    // Filtrer par recherche
    if (searchQuery) {
      result = filterItems(result, undefined, searchQuery);
    }

    // Trier
    result = sortItems(result, sortBy);

    return result;
  }, [items, selectedCategory, searchQuery, sortBy]);

  const stats = useMemo(() => calculateFridgeStats(items), [items]);

  const getCategoryCount = (category: FridgeCategory | 'all') => {
    if (category === 'all') return items.length;
    return items.filter((item) => item.category === category).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Mon Frigo Virtuel</h1>
            <p className="text-gray-600">
              Gérez vos aliments et évitez le gaspillage
            </p>
          </div>

          {/* Alertes d'expiration */}
          <ExpirationAlerts items={items} />
        </div>

        {/* Contrôles */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            {/* Barre de recherche */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un article..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Boutons d'action */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowStats(!showStats)}
                className="flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <SlidersHorizontal className="w-5 h-5" />
                <span className="hidden md:inline">Stats</span>
              </button>

              <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'list' ? 'bg-white shadow' : 'hover:bg-gray-200'
                  }`}
                  aria-label="Vue liste"
                >
                  <List className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'grid' ? 'bg-white shadow' : 'hover:bg-gray-200'
                  }`}
                  aria-label="Vue grille"
                >
                  <Grid3x3 className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={() => {
                  setEditItem(null);
                  setIsModalOpen(true);
                }}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium rounded-lg hover:from-orange-600 hover:to-red-600 transition-colors shadow-lg"
              >
                <Plus className="w-5 h-5" />
                <span>Ajouter</span>
              </button>
            </div>
          </div>

          {/* Tri */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Trier par:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="name">Nom</option>
              <option value="addedDate">Date d'ajout</option>
              <option value="expirationDate">Date d'expiration</option>
            </select>
          </div>
        </div>

        {/* Filtres par catégorie */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {categories.map((category) => {
              const count = getCategoryCount(category);
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category === 'all' ? 'Tous' : category} ({count})
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Liste des articles */}
          <div className="lg:col-span-2">
            {filteredAndSortedItems.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <Search className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  Aucun article trouvé
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchQuery || selectedCategory !== 'all'
                    ? 'Essayez de modifier vos filtres de recherche'
                    : 'Commencez par ajouter des articles à votre frigo'}
                </p>
                {!searchQuery && selectedCategory === 'all' && (
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium rounded-lg hover:from-orange-600 hover:to-red-600 transition-colors inline-flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Ajouter un article
                  </button>
                )}
              </div>
            ) : (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 gap-4'
                    : 'space-y-3'
                }
              >
                {filteredAndSortedItems.map((item) => (
                  <FridgeItemCard
                    key={item.id}
                    item={item}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteItem}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Statistiques */}
          {showStats && (
            <div className="lg:col-span-1">
              <FridgeStats stats={stats} />
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <AddItemModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        editItem={editItem}
      />
    </div>
  );
}
