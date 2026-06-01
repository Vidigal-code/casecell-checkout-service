export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white/95 py-8 text-sm text-neutral-500 transition-colors dark:border-neutral-800 dark:bg-neutral-900/80 dark:text-slate-300">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-6 md:flex-row">
        <p className="text-center md:text-left">© {new Date().getFullYear()} CaseCellShop. Todos os direitos reservados.</p>
        <div className="flex gap-6">
          <a
            href="https://github.com/Vidigal-code/casecell-checkout-service"
            className="font-semibold text-neutral-600 transition hover:text-brand-primary dark:text-slate-200 dark:hover:text-brand-primary/80"
            target="_blank"
            rel="noreferrer"
          >
            CaseCellShop-Project
          </a>
        </div>
      </div>
    </footer>
  );
}
