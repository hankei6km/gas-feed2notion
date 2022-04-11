import { Root, Content } from 'hast'
import { fromMarkdown } from 'mdast-util-from-markdown'
import { toHast } from 'mdast-util-to-hast'
import { gfm } from 'micromark-extension-gfm'
import { gfmFromMarkdown } from 'mdast-util-gfm'
import { raw } from 'hast-util-raw'
import { sanitize } from 'hast-util-sanitize'
import { toHtml as hastToHtml } from 'hast-util-to-html'
import { normalizeMarkdownSource } from './util.js'

export namespace MD2html {
  /**
   * Markdown ソース. Array の場合は '\n' で join される.
   * @typedef {string|number|Array<Array<string|number>>|undefined} MarkdownSource
   */
  export type MarkdownSource =
    | string
    | number
    | (string | number)[][]
    | undefined

  function md2hast(md: string) {
    const mdast = fromMarkdown(md, {
      extensions: [gfm()],
      mdastExtensions: [gfmFromMarkdown()]
    })
    return raw(
      toHast(mdast, { allowDangerousHtml: true }) || ({} as Root | Content)
    )
  }

  /**
   * Mardkdown を HTML へ変換.
   *
   * @param md - Markdown ソース. Array の場合は '\n' で join される.
   * @returns - HTML
   */
  export function toHtml(md: MarkdownSource) {
    const hast = md2hast(normalizeMarkdownSource(md))
    return hastToHtml(sanitize(hast), { allowDangerousHtml: true })
  }

  /**
   * Mardkdown を HTML へ変換(sanitize 無し).
   *
   * @param md - Markdown ソース. Array の場合は '\n' で join される.
   * @returns - HTML
   */
  export function toHtml_unsafe(md: MarkdownSource) {
    const hast = md2hast(normalizeMarkdownSource(md))
    return hastToHtml(hast, { allowDangerousHtml: true })
  }
}
