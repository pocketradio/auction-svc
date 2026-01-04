export default function AuctionLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <section className="
			grid
			grid-cols-1
			sm:grid-cols-2
			lg:grid-cols-3
			xl:grid-cols-4
			gap-6
			p-6
			w-full
            bg-red-50
		">
            {children}
        </section>
    )
}
