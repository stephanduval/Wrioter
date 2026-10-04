import { $api } from '@/utils/api'

export interface SummarizeResponse {
  summary: string
}

export const aiApi = {
  /**
   * Summarize the given text via the server-side Claude endpoint.
   * The API key lives on the server; the browser never sees it.
   */
  async summarize(text: string): Promise<string> {
    const res = await $api<SummarizeResponse>('/ai/summarize', {
      method: 'POST',
      body: { text },
    })

    return res.summary
  },
}
