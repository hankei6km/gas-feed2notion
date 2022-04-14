import { jest } from '@jest/globals'

const saveXmlService = global.XmlService
const saveUrlFetchApp = global.UrlFetchApp
afterEach(() => {
  global.XmlService = saveXmlService
  global.UrlFetchApp = saveUrlFetchApp
})

describe('send()', () => {
  it('should return void', () => {
    const mockGetNamespace = jest.fn()
    const mockfetch = jest.fn().mockReturnValueOnce({
      getContentText: jest.fn().mockReturnValueOnce(
        JSON.stringify({
          results: [],
          next_cursor: null,
          has_more: false
        })
      )
    })
    global.XmlService = {
      getNamespace: mockGetNamespace
    }
    global.UrlFetchApp = {
      fetch: mockfetch
    }
    expect(
      send('test-api-key', {
        dataase_id: 'test-database-id',
        feeds: [],
        limit: 10
      })
    ).toBeUndefined()
    expect(mockGetNamespace).toBeCalledTimes(4)
    expect(mockfetch).toBeCalledTimes(1)
  })
})
describe('preseFeedTransformers()', () => {
  it('should get preset', () => {
    const p = preseFeedTransformers()
    expect(p.length).toEqual(1)
    expect(typeof p[0]).toEqual('function')
  })
})

describe('presetParamTransformers()', () => {
  it('should get preset', () => {
    const p = presetParamTransformers()
    expect(p.length).toEqual(1)
    expect(typeof p[0]).toEqual('function')
  })
})

describe('getWordsToMentionParamTeransFormer()', () => {
  it('should get preset', () => {
    const p = getWordsToMentionParamTeransFormer()
    expect(typeof p).toEqual('function')
  })
})
