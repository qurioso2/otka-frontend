export default function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 text-sm text-neutral-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>© {new Date().getFullYear()} OTKA</p>
        <nav className="flex items-center gap-6">
          <a href="/termeni" className="hover:text-neutral-700">Termeni</a>
          <a href="/contact" className="hover:text-neutral-700">Contact</a>
          <a href="/login" className="hover:text-neutral-700">Login Parteneri</a>
        </nav>
      </div>
    </footer>
  );
}
