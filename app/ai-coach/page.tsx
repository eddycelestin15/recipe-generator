import ChatInterface from '../components/ChatInterface';

export default function AICoachPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">
            Coach Nutritionniste IA
          </h1>
          <p className="text-lg text-gray-600">
            Posez vos questions, obtenez des conseils personnalisés basés sur vos données
          </p>
        </div>

        <ChatInterface />

        {/* Tips */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-2">Conseils personnalisés</h3>
            <p className="text-sm text-gray-600">
              L'IA connaît votre profil, objectifs et progression pour des réponses adaptées
            </p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-2">Disponible 24/7</h3>
            <p className="text-sm text-gray-600">
              Posez vos questions à tout moment, obtenez des réponses instantanées
            </p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-2">Analyse complète</h3>
            <p className="text-sm text-gray-600">
              Demandez une analyse de votre semaine, de vos repas ou de votre progression
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
