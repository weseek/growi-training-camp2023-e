// TODO: replace with remark
import fm from 'front-matter';
import yaml from 'js-yaml';

export const extract = (markdown: string): Record<string, any> | undefined => {
  const extractedData = fm(markdown);

  const { frontmatter } = extractedData;
  if (frontmatter == null) {
    return undefined;
  }

  return yaml.load(frontmatter).cmsMetadata;
};
