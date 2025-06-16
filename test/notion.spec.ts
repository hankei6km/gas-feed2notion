import { jest } from '@jest/globals'
import { createPage, getStoredItems } from '../src/notion'

const saveUrlFetchApp = global.UrlFetchApp
afterEach(() => {
  global.UrlFetchApp = saveUrlFetchApp
})

describe('createPage()', () => {
  it('should call create page api', () => {
    const mockfetch = jest.fn()
    global.UrlFetchApp = {
      fetch: mockfetch
    } as any
    createPage('test-api-key', 'test-param' as any)
    expect(mockfetch).toHaveBeenCalledWith('https://api.notion.com/v1/pages', {
      method: 'post',
      headers: {
        Authorization: `Bearer test-api-key`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-02-22'
      },
      payload: '"test-param"'
    })
  })
})

describe('getStoredItems()', () => {
  it('should stored items', () => {
    const mockfetch = jest
      .fn()
      .mockReturnValueOnce({
        getContentText: jest.fn().mockReturnValueOnce(
          JSON.stringify({
            results: [
              {
                properties: {
                  guid: {
                    rich_text: [{ type: 'text', plain_text: 'g1' }]
                  }
                }
              },
              {
                properties: {
                  guid: {
                    rich_text: [{ type: 'text', plain_text: 'g2' }]
                  }
                }
              }
            ],
            next_cursor: 'c1',
            has_more: true
          })
        )
      })
      .mockReturnValueOnce({
        getContentText: jest.fn().mockReturnValueOnce(
          JSON.stringify({
            results: [
              {
                properties: {
                  guid: {
                    rich_text: [{ type: 'text', plain_text: 'g3' }]
                  }
                }
              },
              {
                properties: {
                  guid: {
                    rich_text: [{ type: 'text', plain_text: 'g4' }]
                  }
                }
              }
            ],
            next_cursor: null,
            has_more: true
          })
        )
      })

    global.UrlFetchApp = {
      fetch: mockfetch
    } as any

    const after = 86400000 + 1000
    const storedItems = getStoredItems(
      'test-api-key',
      'test-database-id' as any,
      after
    )
    expect(storedItems).toEqual({
      g1: {
        properties: {
          guid: { rich_text: [{ type: 'text', plain_text: 'g1' }] }
        }
      },
      g2: {
        properties: {
          guid: { rich_text: [{ type: 'text', plain_text: 'g2' }] }
        }
      },
      g3: {
        properties: {
          guid: { rich_text: [{ type: 'text', plain_text: 'g3' }] }
        }
      },
      g4: {
        properties: {
          guid: { rich_text: [{ type: 'text', plain_text: 'g4' }] }
        }
      }
    })
    expect(mockfetch).toHaveBeenCalledWith(
      'https://api.notion.com/v1/databases/test-database-id/query',
      {
        method: 'post',
        headers: {
          Authorization: `Bearer test-api-key`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-02-22'
        },
        payload: JSON.stringify({
          filter: {
            or: [
              {
                property: 'pubDate',
                date: {
                  after: new Date(1000).toISOString()
                }
              }
            ]
          }
        })
      }
    )
  })
})
