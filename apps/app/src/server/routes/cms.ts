import md from 'markdown-it';
import emoji from 'markdown-it-emoji';

import loggerFactory from '~/utils/logger';

const ApiResponse = require('../util/apiResponse');

const logger = loggerFactory('growi:routes:cms:pages');

module.exports = function(crowi) {
  const Page = crowi.model('Page');

  const actions: any = {};
  const api: any = {};

  actions.api = api;

  api.list = async function(req, res) {
    // const nameSpace = req.params.nameSpace;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const queryOptions = { offset, limit: limit + 1 };

    // if (nameSpace == null) {
    //   return res.json(ApiResponse.error('Parameter nameSpace is required.'));
    // }

    let pages;

    try {
      // TODO: namespace を考慮する
      const result = await Page.findListByStartWith('', undefined, queryOptions);

      // TODO: latestRevisionData が付いている pages を、1つずつではなくまとめて取得する
      pages = await Promise.all(result.pages.map(async(page) => {
        const reGetPage = await Page.findByIdAndViewer(page._id);
        reGetPage.initLatestRevisionField(undefined);
        return reGetPage.populateDataToShowRevision();
      }));
    }
    catch (err) {
      logger.error('get-pages-failed', err);
      return res.json(ApiResponse.error(err));
    }

    if (pages.length > limit) {
      pages.pop();
    }

    const pagesWithHTMLString = pages.map((page) => {
      return { page, htmlString: md({ html: true }).use(emoji).render(page.revision.body) };
    });

    return res.json(ApiResponse.success(pagesWithHTMLString));
  };

  api.get = async function(req, res) {
    const pageId = req.params.pageId;

    if (pageId == null) {
      return res.json(ApiResponse.error('Parameter pageId is required.'));
    }

    let page;

    try {
      page = await Page.findByIdAndViewer(pageId);
    }
    catch (err) {
      logger.error('get-page-failed', err);
      return res.json(ApiResponse.error(err));
    }

    if (page == null) {
      return res.json(ApiResponse.error(`Page('${pageId}' is not found or forbidden`));
    }

    if (page != null) {
      try {
        page.initLatestRevisionField(undefined);

        // populate
        page = await page.populateDataToShowRevision();
      }
      catch (err) {
        logger.error('populate-page-failed', err);
        return res.json(ApiResponse.error('Populate page failed'));
      }
    }

    const htmlString = md({ html: true }).use(emoji).render(page.revision.body);

    return res.json(ApiResponse.success({ page, htmlString }));
  };

  return actions;
};
