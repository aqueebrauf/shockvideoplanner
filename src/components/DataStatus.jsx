export default function DataStatus({ loading, error }) {
  if (loading) {
    return <p className="table-hint">Loading…</p>;
  }

  if (error) {
    return <p className="table-hint table-hint--error">{error}</p>;
  }

  return null;
}
