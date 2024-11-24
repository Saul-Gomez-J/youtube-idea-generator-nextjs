import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-muted border-t">
      <div className="container mx-auto max-w-screen-lg py-6 px-4 sm:px-6 lg:px-8">
        <nav className="flex justify-center space-x-6">
          <Link 
            href="/politicas-privacidad" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Políticas de privacidad
          </Link>
          <Link 
            href="/terminos-y-condiciones" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Términos y condiciones
          </Link>
        </nav>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  )
}
