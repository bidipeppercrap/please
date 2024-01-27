import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.min.css'
import '@/app/globals.css'

import Navbar from '@/components/Navbar'

export const metadata = {
  title: '🙏 Please RfQ',
  description: 'Request for Quotation builder with 💖',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Navbar></Navbar>
        {children}
      </body>
    </html>
  )
}
