import { jest } from '@jest/globals'
import { CreatePageParameters } from '@notionhq/client/build/src/api-endpoints'
import { FeedToNotion } from '../src/feed2notion.js'
import type { FeedItem } from 'domutils'

jest.unstable_mockModule('../src/util.js', () => {
  const mockFeedItems = jest.fn()
  const mockGetFilterFeedTransformer =
    jest.fn<
      () => (
        ite: Generator<FeedToNotion.FeedItem>
      ) => IterableIterator<FeedToNotion.FeedItem>
    >()
  const mockFetchOgImageFeedTransformer =
    jest.fn<
      (
        ite: Generator<FeedToNotion.FeedItem>
      ) => IterableIterator<FeedToNotion.FeedItem>
    >()
  const reset = (items: FeedToNotion.FeedItem[]) => {
    mockFeedItems.mockReset().mockImplementation(function* () {
      for (const i of items) {
        yield i
      }
    })
    mockGetFilterFeedTransformer.mockReset().mockImplementation(
      () =>
        function* (ite: Generator<FeedToNotion.FeedItem>) {
          for (const i of ite) {
            yield i
          }
        }
    )
    mockFetchOgImageFeedTransformer
      .mockReset()
      .mockImplementation(function* (ite: Generator<FeedToNotion.FeedItem>) {
        for (const i of ite) {
          yield i
        }
      })
  }

  reset([])
  return {
    feedItems: mockFeedItems,
    getFilterFeedTransformer: mockGetFilterFeedTransformer,
    fetchOgImageFeedTransformer: mockFetchOgImageFeedTransformer,
    _reset: reset,
    _getMocks: () => ({
      mockFeedItems,
      mockGetFilterFeedTransformer,
      mockFetchOgImageFeedTransformer
    })
  }
})

const mockUtil = await import('../src/util.js')
const {
  mockFeedItems,
  mockGetFilterFeedTransformer,
  mockFetchOgImageFeedTransformer
} = (mockUtil as any)._getMocks()
const { getWordsToMentionParamTeransFormer, genCreatePageParameters } =
  await import('../src/params.js')

describe('getWordsToMentionParamTeransFormer()', () => {
  it('should mention to user when word detcted', () => {
    function* mockGen(): Generator<
      [CreatePageParameters, FeedToNotion.FeedItem, string]
    > {
      yield [
        {
          parent: {
            database_id: 'test-database-id'
          },
          properties: {},
          children: [
            {
              object: 'block',
              type: 'paragraph',
              paragraph: {
                rich_text: [
                  {
                    type: 'text',
                    text: {
                      content: 'test-description-1'
                    }
                  }
                ]
              }
            }
          ]
        },
        {
          feedName: 'test-name-1',
          title: 'test-title-1',
          description: 'ABC',
          guid: 'test-guid-1',
          link: 'test-link-1',
          pubDate: '2022-04-12T00:00:00.000Z',
          enclosure: { url: 'test-enclosure-1' },
          time: 1649721600000
        },
        'test-xml-1'
      ]
      yield [
        {
          parent: {
            database_id: 'test-database-id'
          },
          properties: {},
          children: [
            {
              object: 'block',
              type: 'paragraph',
              paragraph: {
                rich_text: [
                  {
                    type: 'text',
                    text: {
                      content: 'test-description-2'
                    }
                  }
                ]
              }
            }
          ]
        },
        {
          feedName: 'test-name-2',
          title: 'EFG',
          description: 'test-description-2',
          guid: 'test-guid-2',
          link: 'test-link-2',
          pubDate: '2022-04-12T00:00:00.000Z',
          enclosure: { url: 'test-enclosure-2' },
          time: 1649721600000
        },
        'test-xml-2'
      ]
      yield [
        {
          parent: {
            database_id: 'test-database-id'
          },
          properties: {},
          children: [
            {
              object: 'block',
              type: 'paragraph',
              paragraph: {
                rich_text: [
                  {
                    type: 'text',
                    text: {
                      content: 'test-description-3'
                    }
                  }
                ]
              }
            }
          ]
        },
        {
          feedName: 'test-name-3',
          title: 'test-title-3',
          description: 'test-description-3',
          guid: 'test-guid-3',
          link: 'test-link-3',
          pubDate: '2022-04-12T00:00:00.000Z',
          enclosure: { url: 'test-enclosure-3' },
          time: 1649721600000
        },
        'test-xml-2'
      ]
    }
    const t = getWordsToMentionParamTeransFormer(['ABC', /E.G/], 'test-user-id')
    const params: [CreatePageParameters, FeedToNotion.FeedItem, string][] = []
    for (const param of t(mockGen())) {
      params.push(param)
    }
    expect(params.length).toEqual(3)
    expect(params[0]).toEqual([
      {
        parent: {
          database_id: 'test-database-id'
        },
        properties: {},
        children: [
          {
            object: 'block',
            type: 'paragraph',
            paragraph: {
              rich_text: [
                {
                  type: 'mention',
                  mention: {
                    user: {
                      id: 'test-user-id'
                    }
                  }
                }
              ]
            }
          },
          {
            object: 'block',
            type: 'paragraph',
            paragraph: {
              rich_text: [
                {
                  type: 'text',
                  text: {
                    content: 'test-description-1'
                  }
                }
              ]
            }
          }
        ]
      },
      {
        feedName: 'test-name-1',
        title: 'test-title-1',
        description: 'ABC',
        guid: 'test-guid-1',
        link: 'test-link-1',
        pubDate: '2022-04-12T00:00:00.000Z',
        enclosure: { url: 'test-enclosure-1' },
        time: 1649721600000
      },
      'test-xml-1'
    ])
    expect(params[1]).toEqual([
      {
        parent: {
          database_id: 'test-database-id'
        },
        properties: {},
        children: [
          {
            object: 'block',
            type: 'paragraph',
            paragraph: {
              rich_text: [
                {
                  type: 'mention',
                  mention: {
                    user: {
                      id: 'test-user-id'
                    }
                  }
                }
              ]
            }
          },
          {
            object: 'block',
            type: 'paragraph',
            paragraph: {
              rich_text: [
                {
                  type: 'text',
                  text: {
                    content: 'test-description-2'
                  }
                }
              ]
            }
          }
        ]
      },
      {
        feedName: 'test-name-2',
        title: 'EFG',
        description: 'test-description-2',
        guid: 'test-guid-2',
        link: 'test-link-2',
        pubDate: '2022-04-12T00:00:00.000Z',
        enclosure: { url: 'test-enclosure-2' },
        time: 1649721600000
      },
      'test-xml-2'
    ])
    expect(params[2]).toEqual([
      {
        parent: {
          database_id: 'test-database-id'
        },
        properties: {},
        children: [
          {
            object: 'block',
            type: 'paragraph',
            paragraph: {
              rich_text: [
                {
                  type: 'text',
                  text: {
                    content: 'test-description-3'
                  }
                }
              ]
            }
          }
        ]
      },
      {
        feedName: 'test-name-3',
        title: 'test-title-3',
        description: 'test-description-3',
        guid: 'test-guid-3',
        link: 'test-link-3',
        pubDate: '2022-04-12T00:00:00.000Z',
        enclosure: { url: 'test-enclosure-3' },
        time: 1649721600000
      },
      'test-xml-2'
    ])
  })
})

describe('genCreatePageParameters()', () => {
  it('should return CreatePageParameters items', () => {
    const mockItems: [FeedToNotion.FeedItem, string][] = [
      [
        {
          feedName: 'test-name-1',
          title: 'test-title-1',
          description: 'test-description-1',
          guid: 'test-guid-1',
          link: 'test-link-1',
          pubDate: '2022-04-12T00:00:00.000Z',
          enclosure: { url: 'test-enclosure-1' },
          time: 1649721600000
        },
        'test-xml-1'
      ],
      [
        {
          feedName: 'test-name-2',
          title: 'test-title-2',
          description: 'test-description-2',
          guid: 'test-guid-2',
          link: 'test-link-2',
          pubDate: '2022-04-12T00:00:00.000Z',
          enclosure: { url: 'test-enclosure-2' },
          time: 1649721600000
        },
        'test-xml-2'
      ]
    ]
    ;(mockUtil as any)._reset(mockItems)
    const g = genCreatePageParameters(
      {
        database_id: 'test-database-id',
        feeds: [{ name: 'test-name', url: 'test-url' }],
        limit: 10
      },
      { after: 0, storedItems: { 'guid-1': 'item-1' } }
    )

    const params: [CreatePageParameters, FeedToNotion.FeedItem, string][] = []
    for (const param of g) {
      params.push(param)
    }

    expect(mockGetFilterFeedTransformer).toHaveBeenCalledWith({
      after: 0,
      storedItems: { 'guid-1': 'item-1' }
    })
    expect(mockFetchOgImageFeedTransformer).toHaveBeenCalledTimes(1)
    expect(params).toEqual([
      [
        {
          parent: {
            database_id: 'test-database-id'
          },
          properties: {
            title: {
              title: [{ type: 'text', text: { content: 'test-title-1' } }]
            },
            tags: {
              multi_select: [
                {
                  name: 'test-name-1'
                }
              ]
            },
            guid: {
              rich_text: [{ type: 'text', text: { content: 'test-guid-1' } }]
            },
            pubDate: {
              date: { start: '2022-04-12T00:00:00.000Z' }
            },
            link: {
              url: 'test-link-1'
            },
            description: {
              rich_text: [
                { type: 'text', text: { content: 'test-description-1' } }
              ]
            }
          },
          children: [
            {
              object: 'block',
              type: 'image',
              image: {
                external: { url: 'test-enclosure-1' }
              }
            },
            {
              object: 'block',
              type: 'paragraph',
              paragraph: {
                rich_text: [
                  {
                    type: 'text',
                    text: {
                      content: 'test-description-1'
                    }
                  }
                ]
              }
            }
          ]
        },
        {
          feedName: 'test-name-1',
          title: 'test-title-1',
          description: 'test-description-1',
          guid: 'test-guid-1',
          link: 'test-link-1',
          pubDate: '2022-04-12T00:00:00.000Z',
          enclosure: { url: 'test-enclosure-1' },
          time: 1649721600000
        },
        'test-xml-1'
      ],
      [
        {
          parent: {
            database_id: 'test-database-id'
          },
          properties: {
            title: {
              title: [{ type: 'text', text: { content: 'test-title-2' } }]
            },
            tags: {
              multi_select: [
                {
                  name: 'test-name-2'
                }
              ]
            },
            guid: {
              rich_text: [{ type: 'text', text: { content: 'test-guid-2' } }]
            },
            pubDate: {
              date: { start: '2022-04-12T00:00:00.000Z' }
            },
            link: {
              url: 'test-link-2'
            },
            description: {
              rich_text: [
                { type: 'text', text: { content: 'test-description-2' } }
              ]
            }
          },
          children: [
            {
              object: 'block',
              type: 'image',
              image: {
                external: { url: 'test-enclosure-2' }
              }
            },
            {
              object: 'block',
              type: 'paragraph',
              paragraph: {
                rich_text: [
                  {
                    type: 'text',
                    text: {
                      content: 'test-description-2'
                    }
                  }
                ]
              }
            }
          ]
        },
        {
          feedName: 'test-name-2',
          title: 'test-title-2',
          description: 'test-description-2',
          guid: 'test-guid-2',
          link: 'test-link-2',
          pubDate: '2022-04-12T00:00:00.000Z',
          enclosure: { url: 'test-enclosure-2' },
          time: 1649721600000
        },
        'test-xml-2'
      ]
    ])
  })
})
