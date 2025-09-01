import { parseFeed } from 'htmlparser2'
import { parseFragment } from 'parse5'
import { fromParse5 } from 'hast-util-from-parse5'
import { select } from 'hast-util-select'
import { FeedToNotion } from './feed2notion.js'

export function fetchOgImage(link: string): string | null | undefined {
  const resAll = UrlFetchApp.fetchAll([{ url: link }])
  const html = resAll[0].getContentText()
  const p5ast = parseFragment(String(html), {
    sourceCodeLocationInfo: true
  })
  const ast = fromParse5(p5ast)
  const ogImage = select('meta[property="og:image"]', ast)
  if (ogImage?.properties?.content) {
    return `${ogImage.properties.content}`
  }
  return null
}

export function getFilterFeedTransformer(
  filter: FeedToNotion.FilterItem
): FeedToNotion.FeedTransfomer {
  return function* fetchOgImageTransformer(
    ite: Generator<[FeedToNotion.FeedItem, string]>
  ): Generator<[FeedToNotion.FeedItem, string]> {
    for (const [item, xmlText] of ite) {
      if (
        item.time > filter.after &&
        item.guid !== '' &&
        filter.storedItems[item.guid] === undefined
      ) {
        yield [item, xmlText]
      }
    }
  }
}

export const fetchOgImageFeedTransformer: FeedToNotion.FeedTransfomer =
  function* fetchOgImageTransformer(
    ite: Generator<[FeedToNotion.FeedItem, string]>
  ): Generator<[FeedToNotion.FeedItem, string]> {
    for (const [item, xmlText] of ite) {
      if (item.enclosure === undefined) {
        try {
          const res = UrlFetchApp.fetch(item.link)
          const html = res.getContentText()
          const p5ast = parseFragment(String(html), {
            sourceCodeLocationInfo: true
          })
          const ast = fromParse5(p5ast)
          const ogImage = select('meta[property="og:image"]', ast)
          if (ogImage?.properties?.content) {
            item.enclosure = { url: `${ogImage.properties.content}` }
          }
          yield [item, xmlText]
        } catch (err) {
          console.error(
            `fetchOgImageTransformer: error occured. skip item feedName = ${item.feedName}, link = ${item.link}}`
          )
        }
      } else {
        yield [item, xmlText]
      }
    }
  }

export function* feedItems({
  feeds,
  limit
}: FeedToNotion.FeedItemsOpts): Generator<[FeedToNotion.FeedItem, string]> {
  const rss = XmlService.getNamespace('http://purl.org/rss/1.0/')
  const atom = XmlService.getNamespace('http://www.w3.org/2005/Atom')
  const nsDc = XmlService.getNamespace('dc', 'http://purl.org/dc/elements/1.1/')
  const nsMedia = XmlService.getNamespace(
    'media',
    'http://search.yahoo.com/mrss/'
  )
  for (const { name, url } of feeds) {
    const xml = UrlFetchApp.fetch(url)
    const xmlText = xml.getContentText()
    const now = Date.now()

    let items: FeedToNotion.FeedItem[] = []
    const document = XmlService.parse(xmlText)
    const root = document.getRootElement()
    if (root !== null) {
      if (root.getName() === 'rss') {
        const channel = root.getChild('channel')
        if (channel) {
          const _items = channel.getChildren('item')
          items = _items.map((i) => {
            const title = i.getChild('title')
            const description = i.getChild('description')
            const guid = i.getChild('guid')
            const link = i.getChild('link')
            const pubDate = i.getChild('pubDate')
            const d = new Date(pubDate ? pubDate.getText() : now)
            const item: FeedToNotion.FeedItem = {
              feedName: name,
              title: title ? title.getText() : '',
              description: description ? description.getText() : '',
              guid: guid ? guid.getText() : link ? link.getText() : '',
              link: link ? link.getText() : '',
              pubDate: d ? d.toISOString() : '',
              time: d ? d.getTime() : now
            }
            const enclosure = i.getChild('enclosure')
            const url = enclosure?.getAttribute('url')
            if (url) {
              item.enclosure = { url: url.getValue() }
            }
            return item
          })
        }
      } else {
        const res = parseFeed(xmlText)
        if (res) {
          let _items = root.getChildren('item', rss)
          if (_items.length === 0) {
            _items = root.getChildren('entry', atom)
          }
          items = res.items.map((v, idx) => {
            const dateNode = _items[idx]?.getChild('date', nsDc)
            const d = new Date(
              v.pubDate ? v.pubDate : dateNode ? dateNode.getText() : now
            )
            const item: FeedToNotion.FeedItem = {
              title: v.title || '',
              description: v.description || '',
              guid: v.id || v.link || '',
              link: v.link || '',
              feedName: name,
              pubDate: d ? d.toISOString() : '',
              time: d ? d.getTime() : now
            }
            const thumbNode = _items[idx]?.getChild('thumbnail', nsMedia)
            const url = thumbNode?.getAttribute('url')
            if (url) {
              item.enclosure = { url: url.getValue() }
            }
            return item
          })
        }
      }
    }
    if (items.every(({ time }) => time !== undefined)) {
      items.sort((a, b) => b.time - a.time)
    }
    for (const i of items.slice(0, limit)) {
      yield [
        {
          ...i,
          time: i.time || 0
        },
        xmlText
      ]
    }
  }
}
