export const paginationMeta = <T extends { page: number; itemsPerPage: number }>(options: T, total: number) => {
  if (options.itemsPerPage === -1) {
    return `Showing all ${total} entries`
  }

  const start = (options.page - 1) * options.itemsPerPage + 1
  const end = Math.min(options.page * options.itemsPerPage, total)

  return `Showing ${total === 0 ? 0 : start} to ${end} of ${total} entries`
}
