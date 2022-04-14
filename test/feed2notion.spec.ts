import { jest } from '@jest/globals'
import { fetchOgImageFeedTransformer } from '../src/util.js'

const saveDateNow = Date.now
afterEach(() => {
  Date.now = saveDateNow
})

jest.unstable_mockModule('../src/notion.js', () => {
  const mockCreatePage = jest.fn()
  const mockGetSortedItems = jest.fn()
  const reset = () => {
    mockCreatePage.mockReset()
    mockGetSortedItems.mockReset().mockReturnValue('test-sorted-items')
  }

  reset()
  return {
    createPage: mockCreatePage,
    getStoredItems: mockGetSortedItems,
    _reset: reset,
    _getMocks: () => ({
      mockCreatePage,
      mockGetSortedItems
    })
  }
})

jest.unstable_mockModule('../src/params.js', () => {
  const mockCardImageParamTeransFormer = jest.fn()
  const mockGetWordsToMentionParamTeransFormer = jest.fn()
  const mockGenCreatePageParameters = jest.fn()
  const reset = (items: any[]) => {
    mockCardImageParamTeransFormer.mockReset()
    mockGetWordsToMentionParamTeransFormer.mockReset()
    mockGenCreatePageParameters.mockReset().mockImplementation(function* () {
      for (const i of items) {
        yield i
      }
    })
  }

  reset([])
  return {
    cardImageParamTeransFormer: mockCardImageParamTeransFormer,
    getWordsToMentionParamTeransFormer: mockGetWordsToMentionParamTeransFormer,
    genCreatePageParameters: mockGenCreatePageParameters,
    _reset: reset,
    _getMocks: () => ({
      mockCardImageParamTeransFormer,
      mockGetWordsToMentionParamTeransFormer,
      mockGenCreatePageParameters
    })
  }
})

const mockNotion = await import('../src/notion.js')
const mockParams = await import('../src/params.js')
const { mockCreatePage, mockGetSortedItems } = (mockNotion as any)._getMocks()
const {
  mockCardImageParamTeransFormer,
  mockGetWordsToMentionParamTeransFormer,
  mockGenCreatePageParameters
} = (mockParams as any)._getMocks()
const { FeedToNotion } = await import('../src/feed2notion.js')

afterEach(() => {
  ;(mockNotion as any)._reset()
})

describe('FeedToNotion.send()', () => {
  it('should call createPage', () => {
    ;(mockParams as any)._reset([
      ['test-1', '', ''],
      ['test-2', '', '']
    ])
    const fakeNow = 345600000 // デフォルトでは 3 日前になるので、4 日分を設定しておく
    Date.now = () => fakeNow

    FeedToNotion.send('test-api-key', {
      database_id: 'test-database-id',
      feeds: [
        {
          name: 'test-name',
          url: 'test-url'
        }
      ],
      limit: 10
    })
    expect(mockGetSortedItems).toBeCalledWith(
      'test-api-key',
      'test-database-id',
      86400000 // 3 日前に戻された値
    )
    expect(mockCreatePage).toBeCalledWith('test-api-key', 'test-1')
    expect(mockCreatePage).toBeCalledWith('test-api-key', 'test-2')
  })
})

describe('FeedToNotion.preseFeedTransformers()', () => {
  it('should get preset', () => {
    expect(FeedToNotion.preseFeedTransformers()).toEqual([
      fetchOgImageFeedTransformer
    ])
  })
})

describe('FeedToNotion.presetParamTransformers()', () => {
  it('should get preset', () => {
    expect(FeedToNotion.presetParamTransformers()).toEqual([
      mockCardImageParamTeransFormer
    ])
  })
})

describe('FeedToNotion.getWordsToMentionParamTeransFormer()', () => {
  it('should get transformer', () => {
    expect(FeedToNotion.getWordsToMentionParamTeransFormer()).toEqual(
      mockGetWordsToMentionParamTeransFormer
    )
  })
})
