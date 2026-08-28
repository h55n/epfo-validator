export default function PageWrapper({ children, style = {} }) {
  return (
    <div className="page-wrapper" style={{ paddingTop: '32px', paddingBottom: '48px', ...style }}>
      {children}
    </div>
  )
}
