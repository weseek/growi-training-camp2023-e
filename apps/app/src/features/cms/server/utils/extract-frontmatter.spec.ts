import { extract } from './extract-frontmatter';

describe('extract-frontmatter', () => {

  it('returns undefined when the document does not have frontmatter', () => {
    // when
    const result = extract('# Heading\nsome text');
    // then
    expect(result).toBeUndefined();
  });

  it('returns undefined when the frontmatter does not have "cmsMetadata" key', () => {
    // when
    const result = extract(`---
title: This is the Title
---

# Heading
some text
`);
    // then
    expect(result).toBeUndefined();
  });

  it('extract data collectly', () => {
    // when
    const result = extract(`---
title: This is the Title
cmsMetadata:
  foo: bar
---

# Heading
some text
`);
    // then
    expect(result).toStrictEqual({
      foo: 'bar',
    });
  });

});
