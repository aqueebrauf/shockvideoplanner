/** Paginated fetch — Supabase caps at 1000 rows per request. */
export async function fetchAllHashtagRows(supabase) {
  const pageSize = 1000;
  let from = 0;
  const all = [];

  while (true) {
    const { data, error } = await supabase
      .from('hashtags')
      .select('*')
      .order('id')
      .range(from, from + pageSize - 1);

    if (error) throw error;
    if (!data?.length) break;

    all.push(...data);
    if (data.length < pageSize) break;
    from += pageSize;
  }

  return all;
}
