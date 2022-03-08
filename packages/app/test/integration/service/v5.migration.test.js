const mongoose = require('mongoose');

const { getInstance } = require('../setup-crowi');

describe('V5 page migration', () => {
  let crowi;
  let Page;
  let User;
  let UserGroup;
  let UserGroupRelation;

  let testUser1;

  let rootPage;

  const groupIdIsolate = new mongoose.Types.ObjectId();
  const groupIdA = new mongoose.Types.ObjectId();
  const groupIdB = new mongoose.Types.ObjectId();
  const groupIdC = new mongoose.Types.ObjectId();

  const pageId1 = new mongoose.Types.ObjectId();
  const pageId2 = new mongoose.Types.ObjectId();
  const pageId3 = new mongoose.Types.ObjectId();
  const pageId4 = new mongoose.Types.ObjectId();
  const pageId5 = new mongoose.Types.ObjectId();
  const pageId6 = new mongoose.Types.ObjectId();
  const pageId7 = new mongoose.Types.ObjectId();
  const pageId8 = new mongoose.Types.ObjectId();
  const pageId9 = new mongoose.Types.ObjectId();
  const pageId10 = new mongoose.Types.ObjectId();
  const pageId11 = new mongoose.Types.ObjectId();

  beforeAll(async() => {
    jest.restoreAllMocks();

    crowi = await getInstance();
    Page = mongoose.model('Page');
    User = mongoose.model('User');
    UserGroup = mongoose.model('UserGroup');
    UserGroupRelation = mongoose.model('UserGroupRelation');

    await crowi.configManager.updateConfigsInTheSameNamespace('crowi', { 'app:isV5Compatible': true });

    await User.insertMany([{ name: 'testUser1', username: 'testUser1', email: 'testUser1@example.com' }]);
    testUser1 = await User.findOne({ username: 'testUser1' });
    rootPage = await Page.findOne({ path: '/' });

    await UserGroup.insertMany([
      {
        _id: groupIdIsolate,
        name: 'groupIsolate',
      },
      {
        _id: groupIdA,
        name: 'groupA',
      },
      {
        _id: groupIdB,
        name: 'groupB',
        parent: groupIdA,
      },
      {
        _id: groupIdC,
        name: 'groupC',
        parent: groupIdB,
      },
    ]);

    await UserGroupRelation.insertMany([
      {
        relatedGroup: groupIdIsolate,
        relatedUser: testUser1._id,
      },
      {
        relatedGroup: groupIdA,
        relatedUser: testUser1._id,
      },
      {
        relatedGroup: groupIdB,
        relatedUser: testUser1._id,
      },
      {
        relatedGroup: groupIdC,
        relatedUser: testUser1._id,
      },
    ]);

    await Page.insertMany([
      {
        path: '/private1',
        grant: Page.GRANT_OWNER,
        creator: testUser1,
        lastUpdateUser: testUser1,
        grantedUsers: [testUser1._id],
      },
      {
        path: '/dummyParent/private1',
        grant: Page.GRANT_OWNER,
        creator: testUser1,
        lastUpdateUser: testUser1,
        grantedUsers: [testUser1._id],
      },
      {
        path: '/dummyParent/private1/private2',
        grant: Page.GRANT_OWNER,
        creator: testUser1,
        lastUpdateUser: testUser1,
        grantedUsers: [testUser1._id],
      },
      {
        path: '/dummyParent/private1/private3',
        grant: Page.GRANT_OWNER,
        creator: testUser1,
        lastUpdateUser: testUser1,
        grantedUsers: [testUser1._id],
      },
      {
        _id: pageId1,
        path: '/normalize_1',
        parent: rootPage._id,
        grant: Page.GRANT_PUBLIC,
        isEmpty: true,
      },
      {
        _id: pageId2,
        path: '/normalize_1/normalize_2',
        parent: pageId1,
        grant: Page.GRANT_USER_GROUP,
        grantedGroup: groupIdB,
        grantedUsers: [testUser1._id],
      },
      {
        _id: pageId3,
        path: '/normalize_1',
        grant: Page.GRANT_USER_GROUP,
        grantedGroup: groupIdA,
        grantedUsers: [testUser1._id],
      },
      {
        _id: pageId4,
        path: '/normalize_4',
        parent: rootPage._id,
        grant: Page.GRANT_PUBLIC,
        isEmpty: true,
      },
      {
        _id: pageId5,
        path: '/normalize_4/normalize_5',
        parent: pageId4,
        grant: Page.GRANT_USER_GROUP,
        grantedGroup: groupIdA,
        grantedUsers: [testUser1._id],
      },
      {
        _id: pageId6,
        path: '/normalize_4',
        grant: Page.GRANT_USER_GROUP,
        grantedGroup: groupIdIsolate,
        grantedUsers: [testUser1._id],
      },
      {
        path: '/normalize_7/normalize_8_gA',
        grant: Page.GRANT_USER_GROUP,
        creator: testUser1,
        grantedGroup: groupIdA,
        grantedUsers: [testUser1._id],
      },
      {
        path: '/normalize_7/normalize_8_gA/normalize_9_gB',
        grant: Page.GRANT_USER_GROUP,
        creator: testUser1,
        grantedGroup: groupIdB,
        grantedUsers: [testUser1._id],
      },
      {
        path: '/normalize_7/normalize_8_gC',
        grant: Page.GRANT_USER_GROUP,
        grantedGroup: groupIdC,
        grantedUsers: [testUser1._id],
      },
      {
        _id: pageId7,
        path: '/normalize_10',
        grant: Page.GRANT_PUBLIC,
        isEmpty: true,
        parent: rootPage._id,
        descendantCount: 3,
      },
      {
        _id: pageId8,
        path: '/normalize_10/normalize_11_gA',
        isEmpty: true,
        parent: pageId7,
        descendantCount: 1,
      },
      {
        _id: pageId9, // not v5
        path: '/normalize_10/normalize_11_gA',
        grant: Page.GRANT_USER_GROUP,
        grantedGroup: groupIdA,
        grantedUsers: [testUser1._id],
      },
      {
        _id: pageId10,
        path: '/normalize_10/normalize_11_gA/normalize_11_gB',
        grant: Page.GRANT_USER_GROUP,
        grantedGroup: groupIdB,
        grantedUsers: [testUser1._id],
        parent: pageId8,
        descendantCount: 0,
      },
      {
        _id: pageId11,
        path: '/normalize_10/normalize_12_gC',
        grant: Page.GRANT_USER_GROUP,
        grantedGroup: groupIdC,
        grantedUsers: [testUser1._id],
        parent: pageId7,
        descendantCount: 0,
      },

    ]);

  });

  // https://github.com/jest-community/eslint-plugin-jest/blob/v24.3.5/docs/rules/expect-expect.md#assertfunctionnames
  // pass unless the data is one of [false, 0, '', null, undefined, NaN]
  const expectAllToBeTruthy = (dataList) => {
    dataList.forEach((data, i) => {
      if (data == null) { console.log(`index: ${i}`) }
      expect(data).toBeTruthy();
    });
  };

  describe('normalizeParentRecursivelyByPages()', () => {

    const normalizeParentRecursivelyByPages = async(pages, user) => {
      return crowi.pageService.normalizeParentRecursivelyByPages(pages, user);
    };

    test('should migrate all pages specified by pageIds', async() => {
      jest.restoreAllMocks();

      const pagesToRun = await Page.find({ path: { $in: ['/private1', '/dummyParent/private1'] } });

      // migrate
      await normalizeParentRecursivelyByPages(pagesToRun, testUser1);
      const migratedPages = await Page.find({
        path: {
          $in: ['/private1', '/dummyParent', '/dummyParent/private1', '/dummyParent/private1/private2', '/dummyParent/private1/private3'],
        },
      });
      const migratedPagePaths = migratedPages.filter(doc => doc.parent != null).map(doc => doc.path);

      const expected = ['/private1', '/dummyParent', '/dummyParent/private1', '/dummyParent/private1/private2', '/dummyParent/private1/private3'];

      expect(migratedPagePaths.sort()).toStrictEqual(expected.sort());
    });

    test('should change all v4 pages with usergroup to v5 compatible and create new parent page', async() => {
      const page8 = await Page.findOne({ path: '/normalize_7/normalize_8_gA' });
      const page9 = await Page.findOne({ path: '/normalize_7/normalize_8_gA/normalize_9_gB' });
      const page10 = await Page.findOne({ path: '/normalize_7/normalize_8_gC' });
      expectAllToBeTruthy([page8, page9, page10]);

      await normalizeParentRecursivelyByPages([page8, page9, page10], testUser1);

      const page7 = await Page.findOne({ path: '/normalize_7' });
      const page8AF = await Page.findOne({ path: '/normalize_7/normalize_8_gA' });
      const page9AF = await Page.findOne({ path: '/normalize_7/normalize_8_gA/normalize_9_gB' });
      const page10AF = await Page.findOne({ path: '/normalize_7/normalize_8_gC' });
      expectAllToBeTruthy([page7, page8AF, page9AF, page10AF]);

      expect(page7.parent).toStrictEqual(rootPage._id);
      expect(page8AF.parent).toStrictEqual(page7._id);
      expect(page9AF.parent).toStrictEqual(page8AF._id);
      expect(page10AF.parent).toStrictEqual(page7._id);
    });

    test("should replace empty page with same path with new non-empty page and update all related children's parent", async() => {
      const page1 = await Page.findOne({ path: '/normalize_10' });
      const page2 = await Page.findOne({ path: '/normalize_10/normalize_11_gA', _id: pageId8 });
      const page3 = await Page.findOne({ path: '/normalize_10/normalize_11_gA', _id: pageId9 }); // not v5
      const page4 = await Page.findOne({ path: '/normalize_10/normalize_11_gA/normalize_11_gB' });
      const page5 = await Page.findOne({ path: '/normalize_10/normalize_12_gC' });
      expectAllToBeTruthy([page1, page2, page3, page4, page5]);
      await normalizeParentRecursivelyByPages([page3], testUser1);

      const page1AF = await Page.findOne({ path: '/normalize_10' });
      const page2AF = await Page.findOne({ path: '/normalize_10/normalize_11_gA', _id: pageId8 });
      const page3AF = await Page.findOne({ path: '/normalize_10/normalize_11_gA', _id: pageId9 });
      const page4AF = await Page.findOne({ path: '/normalize_10/normalize_11_gA/normalize_11_gB' });
      const page5AF = await Page.findOne({ path: '/normalize_10/normalize_12_gC' });
      expectAllToBeTruthy([page1AF, page3AF, page4AF, page5AF]);
      expect(page2AF).toBeNull();

      expect(page1AF.isEmpty).toBeTruthy();
      expect(page3AF.parent).toStrictEqual(page1AF._id);
      // Todo: enable the code below after this is solved: https://redmine.weseek.co.jp/issues/90060
      // expect(page4AF.parent).toStrictEqual(page3AF._id);
      expect(page5AF.parent).toStrictEqual(page1AF._id);

      expect(page3AF.isEmpty).toBeFalsy();
    });
  });

  describe('normalizeAllPublicPages()', () => {
    jest.setTimeout(60000);
    let createPagePaths;
    let allPossiblePagePaths;
    beforeAll(async() => {
      createPagePaths = [
        '/publicA', '/publicA/privateB', '/publicA/privateB/publicC', '/parenthesis/(a)[b]{c}d', '/parenthesis/(a)[b]{c}d/public', '/migratedD',
      ];
      allPossiblePagePaths = [...createPagePaths, '/parenthesis', '/'];

      // initialize pages for test
      await Page.insertMany([
        {
          path: '/publicA',
          grant: Page.GRANT_PUBLIC,
          creator: testUser1,
          lastUpdateUser: testUser1,
        },
        {
          path: '/publicA/privateB',
          grant: Page.GRANT_OWNER,
          creator: testUser1,
          lastUpdateUser: testUser1,
          grantedUsers: [testUser1._id],
        },
        {
          path: '/publicA/privateB/publicC',
          grant: Page.GRANT_PUBLIC,
          creator: testUser1,
          lastUpdateUser: testUser1,
        },
        {
          path: '/parenthesis/(a)[b]{c}d',
          grant: Page.GRANT_PUBLIC,
          creator: testUser1,
          lastUpdateUser: testUser1,
        },
        {
          path: '/parenthesis/(a)[b]{c}d/public',
          grant: Page.GRANT_PUBLIC,
          creator: testUser1,
          lastUpdateUser: testUser1,
        },
      ]);

      const parent = await Page.find({ path: '/' });
      await Page.insertMany([
        {
          path: '/migratedD',
          grant: Page.GRANT_PUBLIC,
          creator: testUser1,
          lastUpdateUser: testUser1,
          parent: parent._id,
        },
      ]);

      // migrate
      await crowi.pageService.normalizeAllPublicPages(Page.GRANT_PUBLIC);
      jest.setTimeout(30000);
    });

    test('should migrate all public pages', async() => {
      const migratedPages = await Page.find({
        path: {
          $in: allPossiblePagePaths,
        },
        parent: { $ne: null },
      });
      const migratedEmptyPages = await Page.find({
        path: {
          $in: allPossiblePagePaths,
        },
        isEmpty: true,
        parent: { $ne: null },
      });
      const nonMigratedPages = await Page.find({
        path: {
          $in: allPossiblePagePaths,
        },
        parent: null,
      });

      const migratedPaths = migratedPages.map(page => page.path).sort();
      const migratedEmptyPaths = migratedEmptyPages.map(page => page.path).sort();
      const nonMigratedPaths = nonMigratedPages.map(page => page.path).sort();

      const expectedMigratedPaths = allPossiblePagePaths.filter(path => path !== '/').sort();
      const expectedMigratedEmptyPaths = ['/publicA/privateB', '/parenthesis'].sort();
      const expectedNonMigratedPaths = ['/publicA/privateB', '/'].sort();

      expect(migratedPaths).toStrictEqual(expectedMigratedPaths);
      expect(migratedEmptyPaths).toStrictEqual(expectedMigratedEmptyPaths);
      expect(nonMigratedPaths).toStrictEqual(expectedNonMigratedPaths);
    });
  });

  describe('normalizeParentByPageId()', () => {
    const normalizeParentByPageId = async(page, user) => {
      return crowi.pageService.normalizeParentByPageId(page, user);
    };
    test('it should normalize not v5 page with usergroup that has parent group', async() => {
      const page1 = await Page.findOne({ _id: pageId1, path: '/normalize_1', isEmpty: true });
      const page2 = await Page.findOne({ _id: pageId2, path: '/normalize_1/normalize_2', parent: page1._id });
      const page3 = await Page.findOne({ _id: pageId3, path: '/normalize_1' }); // NOT v5

      expectAllToBeTruthy([page1, page2, page3]);
      await normalizeParentByPageId(page3, testUser1);

      // AF => After Migration
      const page3AF = await Page.findOne({ _id: pageId3, path: '/normalize_1' }); // v5 compatible
      const page2AF = await Page.findOne({ _id: pageId2, path: '/normalize_1/normalize_2', parent: page3AF._id });
      const page1AF = await Page.findOne({ _id: pageId1, path: '/normalize_1', isEmpty: true });

      expectAllToBeTruthy([page3AF, page2AF]);
      expect(page1AF).toBeNull();

      expect(page3AF.parent).toStrictEqual(rootPage._id);
      expect(page2AF.parent).toStrictEqual(page3AF._id);
    });

    test('it should normalize not v5 page with usergroup that has no parent or child group', async() => {
      const page4 = await Page.findOne({ _id: pageId4, path: '/normalize_4', isEmpty: true });
      const page5 = await Page.findOne({ _id: pageId5, path: '/normalize_4/normalize_5', parent: page4._id });
      const page6 = await Page.findOne({ _id: pageId6, path: '/normalize_4' }); // NOT v5

      expectAllToBeTruthy([page4, page5, page6]);

      let isThrown;
      try {
        await normalizeParentByPageId(page6, testUser1);
      }
      catch (err) {
        isThrown = true;
      }

      // AF => After Migration
      const page4AF = await Page.findOne({ _id: pageId4, path: '/normalize_4', isEmpty: true });
      const page5AF = await Page.findOne({ _id: pageId5, path: '/normalize_4/normalize_5', parent: page4._id });
      const page6AF = await Page.findOne({ _id: pageId6, path: '/normalize_4' }); // NOT v5

      expect(isThrown).toBeTruthy();
      expect(page4AF).toStrictEqual(page4);
      expect(page5AF).toStrictEqual(page5);
      expect(page6AF).toStrictEqual(page6);
    });
  });

  test('replace private parents with empty pages', async() => {
    const replacedPathPages = await Page.find({ path: '/publicA/privateB' }); // ex-private page

    const _newEmptyPage = replacedPathPages.filter(page => page.parent != null)[0];
    const newEmptyPage = {
      path: _newEmptyPage.path,
      grant: _newEmptyPage.grant,
      isEmpty: _newEmptyPage.isEmpty,
    };
    const expectedNewEmptyPage = {
      path: '/publicA/privateB',
      grant: Page.GRANT_PUBLIC,
      isEmpty: true,
    };

    const _privatePage = replacedPathPages.filter(page => page.parent == null)[0];
    const privatePage = {
      path: _privatePage.path,
      grant: _privatePage.grant,
      isEmpty: _privatePage.isEmpty,
    };
    const expectedPrivatePage = {
      path: '/publicA/privateB',
      grant: Page.GRANT_OWNER,
      isEmpty: false,
    };

    expect(replacedPathPages.length).toBe(2);
    expect(newEmptyPage).toStrictEqual(expectedNewEmptyPage);
    expect(privatePage).toStrictEqual(expectedPrivatePage);
  });

});
