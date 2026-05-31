export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-brand-dark/90 py-6 text-sm text-white/60">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-6 md:flex-row">
        <p>© {new Date().getFullYear()} CaseCellShop. Todos os direitos reservados.</p>
        <div className="flex gap-6">
          <a href="https://coodesh.com" className="hover:text-white" target="_blank" rel="noreferrer">
            Challenge by Coodesh
          </a>
          <a href="https://github.com" className="hover:text-white" target="_blank" rel="noreferrer">
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
