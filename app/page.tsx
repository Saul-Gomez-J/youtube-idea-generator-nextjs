import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle } from 'lucide-react';

export default function WelcomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 ">
      <div className="text-center space-y-8 max-w-4xl">
        <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-orange-500 to-red-500 leading-tight">
          Revoluciona Tu Contenido
          <br /> en YouTube
        </h1>

        <p className="text-2xl text-gray-700 max-w-2xl mx-auto">
          Genera ideas innovadoras y cautivadoras para tu canal en segundos.
          ¡Inspírate sin límites!
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
          <Link href="/videos">
            <Button
              size="lg"
              className="font-semibold text-lg px-8 py-6 bg-gradient-to-r bg-red-500  hover:bg-red-500 text-white rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              Comienza Gratis →
            </Button>
          </Link>
          <p className="text-sm text-gray-600 mt-2 sm:mt-0">Sin tarjeta de crédito</p>
        </div>

        <div className="pt-10 flex flex-wrap items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <CheckCircle className="text-blue-600 h-6 w-6" />
            <span className="text-gray-700">Impulsado por IA</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="text-orange-500 h-6 w-6" />
            <span className="text-gray-700">Resultados Instantáneos</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="text-red-500 h-6 w-6" />
            <span className="text-gray-700">Prueba Gratuita</span>
          </div>
        </div>
      </div>
    </div>
  );
}
