import PhotoUploader from '../../components/PhotoUploader';

export default function PhotoAnalysisPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">
            Analyse de Photo
          </h1>
          <p className="text-lg text-gray-600">
            Prenez une photo de votre repas et obtenez une estimation nutritionnelle
          </p>
        </div>

        <PhotoUploader />

        {/* How it works */}
        <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Comment ça fonctionne ?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 text-white flex items-center justify-center font-bold mb-3">
                1
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">
                Prenez une photo
              </h3>
              <p className="text-sm text-gray-600">
                Photographiez votre repas sous un bon éclairage
              </p>
            </div>
            <div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 text-white flex items-center justify-center font-bold mb-3">
                2
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">
                Analyse IA
              </h3>
              <p className="text-sm text-gray-600">
                Notre IA identifie les aliments et estime les valeurs nutritionnelles
              </p>
            </div>
            <div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 text-white flex items-center justify-center font-bold mb-3">
                3
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">
                Ajoutez au journal
              </h3>
              <p className="text-sm text-gray-600">
                Enregistrez facilement le repas dans votre journal alimentaire
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Les valeurs sont des estimations basées sur l'analyse visuelle.
              Pour plus de précision, vérifiez et ajustez si nécessaire.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
