import './page.js'

export const metadata = {
  title: 'Šeimos Verslas - Teritorijų Grafikas',
  description: 'Realaus laiko užduočių sekimo sistema',
}

export default function RootLayout({ children }) {
  return (
    <html lang="lt">
      <body>{children}</body>
    </html>
  )
}
