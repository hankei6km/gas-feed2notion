describe('toHtml()', () => {
  it('should return html', () => {
    expect(
      toHtml(`# test1

<script>alert('danger')</script>

test test
`)
    ).toEqual(`<h1>test1</h1>

<p>test test</p>`)
  })

  it('should joined html', () => {
    expect(toHtml([['# test1', 'paragraph']])).toEqual(`<h1>test1</h1>
<p>paragraph</p>`)
  })
})

describe('toHtml_unsafe()', () => {
  it('should return html', () => {
    expect(
      toHtml_unsafe(`# test1

<script>alert('danger')</script>

test test
`)
    ).toEqual(`<h1>test1</h1>
<script>alert('danger')</script>
<p>test test</p>`)
  })

  it('should joined html', () => {
    expect(toHtml_unsafe([['# test1', 'paragraph']])).toEqual(`<h1>test1</h1>
<p>paragraph</p>`)
  })
})
