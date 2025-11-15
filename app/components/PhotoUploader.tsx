'use client';

import { useState } from 'react';
import { Camera, Upload, Loader2, CheckCircle, Plus } from 'lucide-react';
import type { FoodPhotoAnalysis } from '../lib/types/ai';

export default function PhotoUploader() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<FoodPhotoAnalysis | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image');
      return;
    }

    setSelectedFile(file);
    setAnalysis(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const analyzePhoto = async () => {
    if (!selectedFile || !preview) return;

    setIsAnalyzing(true);

    try {
      // Convert to base64
      const base64 = preview.split(',')[1];

      const response = await fetch('/api/ai/analyze-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64 }),
      });

      const data = await response.json();

      if (response.status === 429) {
        alert(data.message || 'Limite d\'analyses atteinte');
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze photo');
      }

      setAnalysis(data.analysis);
      setRemaining(data.remaining);
    } catch (error) {
      console.error('Error analyzing photo:', error);
      alert('Erreur lors de l\'analyse de la photo');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const addToMealLog = async () => {
    if (!analysis) return;

    try {
      // Create custom food from analysis
      const customFood = {
        name: `Analyse photo - ${new Date().toLocaleDateString()}`,
        calories: analysis.totalEstimated.calories,
        protein: analysis.totalEstimated.protein,
        carbs: analysis.totalEstimated.carbs,
        fat: analysis.totalEstimated.fat,
      };

      const response = await fetch('/api/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: new Date().toISOString(),
          mealType: 'lunch', // Default to lunch
          customFood,
          servings: 1,
          notes: `Analysé par IA: ${analysis.overallAssessment}`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add meal');
      }

      // Mark as logged
      await fetch(`/api/ai/analyze-photo/${analysis.id}/log`, {
        method: 'POST',
      });

      alert('Repas ajouté au journal !');
      resetForm();
    } catch (error) {
      console.error('Error adding to meal log:', error);
      alert('Erreur lors de l\'ajout au journal');
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPreview(null);
    setAnalysis(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
          <Camera className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Analyse de Photo</h2>
          <p className="text-sm text-gray-600">
            Identifiez les aliments et estimez les valeurs nutritionnelles
          </p>
        </div>
      </div>

      {remaining !== null && (
        <div className="mb-4 px-4 py-2 bg-blue-50 rounded-lg text-sm text-blue-700">
          {remaining} analyses restantes aujourd'hui
        </div>
      )}

      {/* Upload area */}
      {!preview ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-500 transition-colors">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id="photo-upload"
          />
          <label
            htmlFor="photo-upload"
            className="cursor-pointer flex flex-col items-center gap-4"
          >
            <Upload className="w-16 h-16 text-gray-400" />
            <div>
              <p className="text-lg font-medium text-gray-700">
                Cliquez pour télécharger une photo
              </p>
              <p className="text-sm text-gray-500 mt-1">
                ou glissez-déposez votre image ici
              </p>
            </div>
            <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-600">
              Sélectionner une photo
            </button>
          </label>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Preview */}
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-full max-h-96 object-contain rounded-lg"
            />
            {!analysis && !isAnalyzing && (
              <button
                onClick={resetForm}
                className="absolute top-2 right-2 px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
              >
                Changer
              </button>
            )}
          </div>

          {/* Analyze button */}
          {!analysis && !isAnalyzing && (
            <button
              onClick={analyzePhoto}
              className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 flex items-center justify-center gap-2"
            >
              <Camera className="w-5 h-5" />
              Analyser la photo
            </button>
          )}

          {/* Loading state */}
          {isAnalyzing && (
            <div className="text-center py-8">
              <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
              <p className="text-gray-600">Analyse en cours...</p>
            </div>
          )}

          {/* Analysis results */}
          {analysis && (
            <div className="space-y-6">
              {/* Overall assessment */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">
                      Analyse complétée
                    </h3>
                    <p className="text-sm text-gray-700">
                      {analysis.overallAssessment}
                    </p>
                  </div>
                </div>
              </div>

              {/* Identified foods */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">
                  Aliments identifiés:
                </h3>
                <div className="space-y-2">
                  {analysis.identifiedFoods.map((food, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 rounded-lg p-3 flex justify-between items-center"
                    >
                      <div>
                        <p className="font-medium text-gray-800">{food.name}</p>
                        <p className="text-sm text-gray-600">
                          Portion: {food.portion} • Confiance:{' '}
                          {(food.confidence * 100).toFixed(0)}%
                        </p>
                      </div>
                      <div className="text-right text-sm">
                        <p className="font-semibold text-gray-800">
                          {food.estimatedCalories} cal
                        </p>
                        <p className="text-gray-600">
                          P: {food.estimatedProtein}g • C: {food.estimatedCarbs}g
                          • L: {food.estimatedFat}g
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total nutrition */}
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3">
                  Total estimé:
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Calories</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {analysis.totalEstimated.calories}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Protéines</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {analysis.totalEstimated.protein}g
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Glucides</p>
                    <p className="text-2xl font-bold text-green-600">
                      {analysis.totalEstimated.carbs}g
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Lipides</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {analysis.totalEstimated.fat}g
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={addToMealLog}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Ajouter au journal
                </button>
                <button
                  onClick={resetForm}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
                >
                  Nouvelle photo
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
