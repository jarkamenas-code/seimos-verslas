import './globals.css'

export const metadata = {
  title: 'Šeimos Verslas - Teritorijų Grafikas',
  description: 'Realaus laiko užduočių sekimo sistema',
}

export default function RootLayout({ children }) {
  return (
    <html lang="lt">
      <head>
        {/* Įkrauname Tailwind CSS tiesiogiai, kad stiliai veiktų be jokių konfigūracijos klaidų */}
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="bg-[#0b0f19] text-slate-100 antialiased">
        {children}
      </body>
    </html>
  )
}
