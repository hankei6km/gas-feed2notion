import { normalizeMarkdownSource } from '../src/util.js'

describe('normalizeMarkdownSource()', () => {
  it('should convert undefined to ""', () => {
    expect(normalizeMarkdownSource()).toEqual('')
  })
  it('should convert string to string', () => {
    expect(normalizeMarkdownSource('simple text')).toEqual('simple text')
  })
  it('should convert number to string', () => {
    expect(normalizeMarkdownSource(10)).toEqual('10')
  })
  it('should convert single row to string', () => {
    expect(normalizeMarkdownSource([['abc', 'efg', 123]])).toEqual(`abc
efg
123`)
  })
  it('should convert multiple rows to string', () => {
    expect(
      normalizeMarkdownSource([
        ['abc', 'efg', 123],
        ['ABC', 'EFG', 456]
      ])
    ).toEqual(`abc
efg
123
ABC
EFG
456`)
  })
})
