// The bare app/base domain — never a customer surface. Deliberately blank-ish
// and noindex (layout metadata): salons' sites live on their subdomain/domain.
export default function Root() {
  return (
    <main style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', fontFamily: 'var(--font-body)', color: '#666' }}>
      <p>Nothing to see here.</p>
    </main>
  )
}
