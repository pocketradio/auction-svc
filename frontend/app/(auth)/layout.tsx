import "../globals.css";
export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html className="">
            <body className="">
                <main>
                    {children}
                </main>
            </body>
        </html>
    )
}
