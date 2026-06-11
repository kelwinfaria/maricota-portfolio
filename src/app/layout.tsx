import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Maricota — Maternidade dos Sonhos',
  description: 'Bichinhos, roupinhas e lembranças costuradas uma a uma. Peças únicas para acolher, presentear e eternizar os primeiros dias.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&family=Caveat:wght@600;700&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}
