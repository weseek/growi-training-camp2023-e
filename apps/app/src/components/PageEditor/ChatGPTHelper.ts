import fm from 'front-matter';
import yaml from 'js-yaml';

import axios from '~/utils/axios';
import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:PageEditor:ChatGPTHelper');

// TODO: このメソッドの代わりに '~/features/cms/server/utils' を元にした CMS と LMS の両方に対応した utils を作成してそれを使用する
const extractMetadata = (markdown: string): Record<string, any> | undefined => {
  const extractedData = fm(markdown);

  const { frontmatter } = extractedData;
  if (frontmatter == null) {
    return undefined;
  }

  return yaml.load(frontmatter);
};

// cms もしくは lms の frontmatter が存在しない場合 unefined を返す
const getCMSOrLMSMetadataAndType = (metadata) => {
  if (metadata?.cms != null) {
    return { cmsOrLMSMetadata: metadata.cms, generateTextType: '記事' };
  }
  if (metadata?.lms != null) {
    return { cmsOrLMSMetadata: metadata.lms, generateTextType: '教材' };
  }
};

export const generateCMSOrLMSText = async(markdownText: string): Promise<string | undefined> => {
  const URL = 'https://api.openai.com/v1/chat/completions';
  const API_KEY = '';

  const metadata = extractMetadata(markdownText);

  const cmsOrLMSMetadataAndType = getCMSOrLMSMetadataAndType(metadata);
  if (cmsOrLMSMetadataAndType == null) {
    return;
  }

  const { cmsOrLMSMetadata, generateTextType } = cmsOrLMSMetadataAndType;

  const title = cmsOrLMSMetadata?.title;
  const autogen = cmsOrLMSMetadata?.autogen;

  try {
    // TODO: frontMatter と、frontMatter を切り離した markdown の両方を変数に持たせ、frontMatter は ChatGPT に渡さずに response にくっつけて返す
    const requestText = `
      ${autogen == null ? '' : `${autogen}という要素を入れた、`}${title == null ? '以下の markdown 部分の内容に合う' : `「${title}」というタイトルの`}
      ${generateTextType}を日本語で markdown の形式で出力してください。
      その際、最初に入っていた frontmatter をインデントや改行なども一切変えず、含まれた状態で出力してください。
      さらに、その際に # から始まるセクションタイトルのみが入った markdown があった場合、そのセクションタイトルを雛形として適切な内容を入れてください。

      ${markdownText}
    `;

    const response = await axios.post(
      URL,
      {
        model: 'gpt-4',
        messages: [
          { role: 'user', content: requestText },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
      },
    );
    return response.data.choices[0].message.content;
  }
  catch (error) {
    logger.error(error);
  }
};
