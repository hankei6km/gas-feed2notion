import { jest } from '@jest/globals'
import { FeedToNotion } from '../src/main.js'
import {
  feedItems,
  fetchOgImageFeedTransformer,
  getFilterFeedTransformer
} from '../src/util.js'

const saveXmlService = global.XmlService
const saveUrlFetchApp = global.UrlFetchApp
afterEach(() => {
  global.XmlService = saveXmlService
  global.UrlFetchApp = saveUrlFetchApp
})

type MockNodeOpts = {
  name?: string
  text?: string
  value?: any
  child?: Record<string, any>
  children?: Record<string, any>[]
  attribute?: Record<string, any>
}
function mockNode(opts: MockNodeOpts) {
  return {
    getName: jest.fn().mockReturnValue(opts.name),
    getText: jest.fn().mockReturnValue(opts.text),
    getValue: jest.fn().mockReturnValue(opts.value),
    getChild: jest.fn().mockImplementation((a: any) => {
      return opts?.child?.[a]
    }),
    getChildren: jest.fn().mockReturnValue(opts.children),
    getAttribute: jest.fn().mockImplementation((a: any) => {
      return opts?.attribute?.[a]
    })
  }
}
describe('feedItems()', () => {
  it('should return feed items from rss', () => {
    const mockGetNamespace = jest.fn()
    const mockParse = jest
      .fn()
      .mockReturnValueOnce({
        getRootElement: jest.fn().mockReturnValue(
          mockNode({
            name: 'rss',
            child: {
              channel: mockNode({
                name: 'channel',
                children: [
                  mockNode({
                    name: 'items',
                    child: {
                      title: mockNode({ text: 'test-title-a-1' }),
                      description: mockNode({ text: 'test-description-a-1' }),
                      guid: mockNode({ text: 'test-guid-a-1' }),
                      link: mockNode({ text: 'test-link-a-1' }),
                      pubDate: mockNode({ text: '2022-04-12' })
                    }
                  }),
                  mockNode({
                    name: 'items',
                    child: {
                      description: mockNode({ text: 'test-description-a-3' }),
                      guid: mockNode({ text: 'test-guid-a-3' }),
                      link: mockNode({ text: 'test-link-a-3' }),
                      pubDate: mockNode({ text: '2022-04-10' }),
                      enclosure: mockNode({
                        attribute: {
                          url: mockNode({ value: 'test-enclosure' })
                        }
                      })
                    }
                  }),
                  mockNode({
                    name: 'items',
                    child: {
                      title: mockNode({ text: 'test-title-a-2' }),
                      guid: mockNode({ text: 'test-guid-a-2' }),
                      link: mockNode({ text: 'test-link-a-2' }),
                      pubDate: mockNode({ text: '2022-04-11' })
                    }
                  })
                ]
              })
            }
          })
        )
      })
      .mockReturnValueOnce({
        getRootElement: jest.fn().mockReturnValue(
          mockNode({
            name: 'rss',
            child: {
              channel: mockNode({
                name: 'channel',
                children: [
                  mockNode({
                    name: 'items',
                    child: {
                      title: mockNode({ text: 'test-title-b-1' }),
                      description: mockNode({ text: 'test-description-b-1' }),
                      guid: mockNode({ text: 'test-guid-b-1' }),
                      link: mockNode({ text: 'test-link-b-1' }),
                      pubDate: mockNode({ text: '2022-04-12' })
                    }
                  })
                ]
              })
            }
          })
        )
      })
    const mockfetch = jest.fn().mockReturnValue({
      getContentText: jest
        .fn()
        .mockReturnValueOnce('test-xml-a')
        .mockReturnValueOnce('test-xml-b')
    })
    global.XmlService = {
      getNamespace: mockGetNamespace,
      parse: mockParse
    } as any
    global.UrlFetchApp = {
      fetch: mockfetch
    } as any
    const g = feedItems({
      database_id: '',
      feeds: [
        { name: 'test-name-a', url: 'test-url-a' },
        { name: 'test-name-b', url: 'test-url-b' }
      ],
      limit: 10
    })
    const items: [FeedToNotion.FeedItem, string][] = []
    for (const item of g) {
      items.push(item)
    }
    expect(mockfetch.mock.calls).toEqual([['test-url-a'], ['test-url-b']])
    expect(mockParse.mock.calls).toEqual([['test-xml-a'], ['test-xml-b']])
    expect(items).toEqual([
      [
        {
          feedName: 'test-name-a',
          title: 'test-title-a-1',
          description: 'test-description-a-1',
          guid: 'test-guid-a-1',
          link: 'test-link-a-1',
          pubDate: '2022-04-12T00:00:00.000Z',
          time: 1649721600000
        },
        'test-xml-a'
      ],
      [
        {
          feedName: 'test-name-a',
          title: 'test-title-a-2',
          description: '',
          guid: 'test-guid-a-2',
          link: 'test-link-a-2',
          pubDate: '2022-04-11T00:00:00.000Z',
          time: 1649635200000
        },
        'test-xml-a'
      ],
      [
        {
          feedName: 'test-name-a',
          title: '',
          description: 'test-description-a-3',
          guid: 'test-guid-a-3',
          link: 'test-link-a-3',
          pubDate: '2022-04-10T00:00:00.000Z',
          time: 1649548800000,
          enclosure: { url: 'test-enclosure' }
        },
        'test-xml-a'
      ],
      [
        {
          feedName: 'test-name-b',
          title: 'test-title-b-1',
          description: 'test-description-b-1',
          guid: 'test-guid-b-1',
          link: 'test-link-b-1',
          pubDate: '2022-04-12T00:00:00.000Z',
          time: 1649721600000
        },
        'test-xml-b'
      ]
    ])
  })

  it('should return feed items from rdf', () => {
    const mockGetNamespace = jest.fn()
    const mockParse = jest.fn().mockReturnValueOnce({
      getRootElement: jest.fn().mockReturnValue(
        mockNode({
          name: 'rdf',
          children: [
            mockNode({
              name: 'items',
              child: {
                date: mockNode({ text: '2022-04-12' })
              }
            })
          ]
        })
      )
    })
    const mockXmlText = `
<rdf:RDF xmlns="http://purl.org/rss/1.0/" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/" xml:lang="ja">
<channel rdf:about="https://hankei6lm.github.com/feed.rdf">
<title>hankei6km</title>
<link>https:</link>
<description>test</description>
<dc:language>ja</dc:language>
<dc:date>2022-04-12T00:00:00+00:00</dc:date>
<items>
<rdf:Seq>
<rdf:li rdf:resource="https://hankei6lm.github.com/aaaa"/>
</rdf:Seq>
</items>
</channel>
<item rdf:about="https://hankei6lm.github.com/aaaa">
<title>test-title</title>
<link>test-link</link>
<dc:date>2022-04-12T00:00:00+00:00</dc:date>
<description>
<![CDATA[test-description]]>
</description>
</item>
</rdf:RDF>`

    const mockfetch = jest.fn().mockReturnValue({
      getContentText: jest.fn().mockReturnValueOnce(mockXmlText)
    })
    global.XmlService = {
      getNamespace: mockGetNamespace,
      parse: mockParse
    } as any
    global.UrlFetchApp = {
      fetch: mockfetch
    } as any
    const g = feedItems({
      database_id: '',
      feeds: [{ name: 'test-name-a', url: 'test-url-a' }],
      limit: 10
    })
    const items: [FeedToNotion.FeedItem, string][] = []
    for (const item of g) {
      items.push(item)
    }
    expect(mockfetch.mock.calls).toEqual([['test-url-a']])
    expect(mockParse.mock.calls).toEqual([[mockXmlText]])
    expect(items).toEqual([
      [
        {
          feedName: 'test-name-a',
          title: 'test-title',
          description: 'test-description',
          guid: 'test-link',
          link: 'test-link',
          pubDate: '2022-04-12T00:00:00.000Z',
          time: 1649721600000
        },
        mockXmlText
      ]
    ])
  })
})

describe('getFilterTransformer()', () => {
  it('should set enclosure from og:image', () => {
    const mockGen = function* (): Generator<[FeedToNotion.FeedItem, string]> {
      yield [
        {
          feedName: 'test-name',
          title: 'test-title-1',
          description: 'test-description-1',
          guid: 'test-guid-1',
          link: 'test-link-1',
          pubDate: '2022-04-12T00:00:00.000Z',
          time: 1649721600000
        },
        'test-xml-1'
      ]
      yield [
        {
          feedName: 'test-name',
          title: 'test-title-2',
          description: 'test-description-2',
          guid: 'test-guid-2',
          link: 'test-link-2',
          pubDate: '2022-04-12T00:00:00.000Z',
          time: 1649721600000,
          enclosure: { url: 'test-enclosure-2' }
        },
        'text-xml-2'
      ]
      yield [
        {
          feedName: 'test-name',
          title: 'test-title-3',
          description: 'test-description-3',
          guid: 'test-guid-3',
          link: 'test-link-3',
          pubDate: '2022-04-12T00:00:00.000Z',
          time: 1649721600000,
          enclosure: { url: 'test-enclosure-3' }
        },
        'test-xml-3'
      ]
      yield [
        {
          feedName: 'test-name',
          title: 'test-title-4',
          description: 'test-description-4',
          guid: '',
          link: 'test-link-4',
          pubDate: '2022-04-12T00:00:00.000Z',
          time: 1649721600000,
          enclosure: { url: 'test-enclosure-4' }
        },
        'test-xml-4'
      ]
      yield [
        {
          feedName: 'test-name',
          title: 'test-title-5',
          description: 'test-description-5',
          guid: 'test-guid-5',
          link: 'test-link-5',
          pubDate: '2022-03-12T00:00:00.000Z',
          time: 1647043200000,
          enclosure: { url: 'test-enclosure-5' }
        },
        'test-xml-5'
      ]
    }
    const t = getFilterFeedTransformer({
      after: new Date('2022-04-01T00:00:00.000Z').getTime(),
      storedItems: {
        'test-guid-2': {}
      }
    })
    const items: [FeedToNotion.FeedItem, string][] = []
    for (const item of t(mockGen())) {
      items.push(item)
    }
    expect(items).toEqual([
      [
        {
          feedName: 'test-name',
          title: 'test-title-1',
          description: 'test-description-1',
          guid: 'test-guid-1',
          link: 'test-link-1',
          pubDate: '2022-04-12T00:00:00.000Z',
          time: 1649721600000
        },
        'test-xml-1'
      ],
      [
        {
          feedName: 'test-name',
          title: 'test-title-3',
          description: 'test-description-3',
          guid: 'test-guid-3',
          link: 'test-link-3',
          pubDate: '2022-04-12T00:00:00.000Z',
          time: 1649721600000,
          enclosure: { url: 'test-enclosure-3' }
        },
        'test-xml-3'
      ]
    ])
  })
})
describe('fetchOgImagePreTransformer()', () => {
  it('should set enclosure from og:image', () => {
    const mockGen = function* (): Generator<[FeedToNotion.FeedItem, string]> {
      yield [
        {
          feedName: 'test-name',
          title: 'test-title-1',
          description: 'test-description-1',
          guid: 'test-guid-1',
          link: 'test-link-1',
          pubDate: '2022-04-12T00:00:00.000Z',
          time: 1649721600000
        },
        'test-xml-1'
      ]
      yield [
        {
          feedName: 'test-name',
          title: 'test-title-2',
          description: 'test-description-2',
          guid: 'test-guid-2',
          link: 'test-link-2',
          pubDate: '2022-04-12T00:00:00.000Z',
          time: 1649721600000,
          enclosure: { url: 'test-enclosure-2' }
        },
        'test-xml-1'
      ]
    }
    const mockHtml = [
      `
<html>
  <head>
  <meta property="og:image" content="test-og-image-1">
  </head>
</html>`,
      `
<html>
  <head>
  <meta property="og:image" content="test-og-image-2">
  </head>
</html>`
    ]
    const mockfetch = jest.fn().mockReturnValue({
      getContentText: jest
        .fn()
        .mockReturnValueOnce(mockHtml[0])
        .mockReturnValueOnce(mockHtml[1])
    })
    global.UrlFetchApp = {
      fetch: mockfetch
    } as any
    const items: [FeedToNotion.FeedItem, string][] = []
    for (const item of fetchOgImageFeedTransformer(mockGen())) {
      items.push(item)
    }
    expect(items).toEqual([
      [
        {
          feedName: 'test-name',
          title: 'test-title-1',
          description: 'test-description-1',
          guid: 'test-guid-1',
          link: 'test-link-1',
          pubDate: '2022-04-12T00:00:00.000Z',
          time: 1649721600000,
          enclosure: { url: 'test-og-image-1' }
        },
        'test-xml-1'
      ],
      [
        {
          feedName: 'test-name',
          title: 'test-title-2',
          description: 'test-description-2',
          guid: 'test-guid-2',
          link: 'test-link-2',
          pubDate: '2022-04-12T00:00:00.000Z',
          time: 1649721600000,
          enclosure: { url: 'test-enclosure-2' }
        },
        'test-xml-1'
      ]
    ])
  })

  it('should not set enclosure', () => {
    const mockGen = function* (): Generator<[FeedToNotion.FeedItem, string]> {
      yield [
        {
          feedName: 'test-name',
          title: 'test-title-1',
          description: 'test-description-1',
          guid: 'test-guid-1',
          link: 'test-link-1',
          pubDate: '2022-04-12T00:00:00.000Z',
          time: 1649721600000
        },
        'test-xml-1'
      ]
    }
    const mockHtml = [
      `
<html>
  <head>
  </head>
</html>`
    ]
    const mockfetch = jest.fn().mockReturnValue({
      getContentText: jest.fn().mockReturnValueOnce(mockHtml[0])
    })
    global.UrlFetchApp = {
      fetch: mockfetch
    } as any
    const items: [FeedToNotion.FeedItem, string][] = []
    for (const item of fetchOgImageFeedTransformer(mockGen())) {
      items.push(item)
    }
    expect(items).toEqual([
      [
        {
          feedName: 'test-name',
          title: 'test-title-1',
          description: 'test-description-1',
          guid: 'test-guid-1',
          link: 'test-link-1',
          pubDate: '2022-04-12T00:00:00.000Z',
          time: 1649721600000
        },
        'test-xml-1'
      ]
    ])
  })
})
