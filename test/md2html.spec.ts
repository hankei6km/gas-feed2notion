import { MD2html } from '../src/md2html.js'

describe('MD2html.toHtml()', () => {
  it('should return html', () => {
    expect(
      MD2html.toHtml(`# test1
test test
`)
    ).toEqual(`<h1>test1</h1>
<p>test test</p>`)
  })

  it('should return blank', () => {
    expect(MD2html.toHtml(``)).toEqual(``)
  })

  it('should sanitize html', () => {
    expect(
      MD2html.toHtml(`# test1

<div>
<p>paragraph</p>
<script>alert("danger")</script>
</div>

test test
`)
    ).toEqual(`<h1>test1</h1>
<div>
<p>paragraph</p>

</div>
<p>test test</p>`)
  })

  it('should joined html', () => {
    expect(MD2html.toHtml([['# test1', 'paragraph']])).toEqual(`<h1>test1</h1>
<p>paragraph</p>`)
  })
})

describe('MD2html.toHtml_unsafe()', () => {
  it('should not sanitize html', () => {
    expect(
      MD2html.toHtml_unsafe(`# test1

<div>
<p>paragraph</p>
<script>alert("danger")</script>
</div>

test test
`)
    ).toEqual(`<h1>test1</h1>
<div>
<p>paragraph</p>
<script>alert("danger")</script>
</div>
<p>test test</p>`)
  })

  it('should joined html', () => {
    expect(MD2html.toHtml_unsafe([['# test1', 'paragraph']]))
      .toEqual(`<h1>test1</h1>
<p>paragraph</p>`)
  })
})
