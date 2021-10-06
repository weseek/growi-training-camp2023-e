// This is the root component for #search-page

import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { withUnstatedContainers } from './UnstatedUtils';
import AppContainer from '~/client/services/AppContainer';

import { toastError } from '~/client/util/apiNotification';
import SearchResult from './SearchPage/SearchResult';
import SearchPageForm from './SearchPage/SearchPageForm';
// TODO: change locatin
import SearchPageLayout from './SearchPageNew/SearchPageLayout';
import SearchResultContent from './SearchPageNew/SearchResultContent';
import SearchResultList from './SearchPageNew/SearchResultList';
import SearchControl from './SearchPageNew/SearchControl';

class SearchPage extends React.Component {

  constructor(props) {
    super(props);
    // NOTE : selectedPages is deletion related state, will be used later in story 77535, 77565.
    // deletionModal, deletion related functions are all removed, add them back when necessary.
    // i.e ) in story 77525 or any tasks implementing deletion functionalities
    this.state = {
      searchingKeyword: decodeURI(this.props.query.q) || '',
      searchedKeyword: '',
      searchedPages: [],
      searchResultMeta: {},
      selectedPage: {},
      selectedPages: new Set(),
    };

    this.search = this.search.bind(this);
    this.changeURL = this.changeURL.bind(this);
    this.selectPageToShow = this.selectPageToShow.bind(this);
    this.toggleCheckBox = this.toggleCheckBox.bind(this);
  }

  componentDidMount() {
    const keyword = this.state.searchingKeyword;
    if (keyword !== '') {
      this.search({ keyword });
    }
  }

  static getQueryByLocation(location) {
    const search = location.search || '';
    const query = {};

    search.replace(/^\?/, '').split('&').forEach((element) => {
      const queryParts = element.split('=');
      query[queryParts[0]] = decodeURIComponent(queryParts[1]).replace(/\+/g, ' ');
    });

    return query;
  }

  changeURL(keyword, refreshHash) {
    let hash = window.location.hash || '';
    // TODO 整理する
    if (refreshHash || this.state.searchedKeyword !== '') {
      hash = '';
    }
    if (window.history && window.history.pushState) {
      window.history.pushState('', `Search - ${keyword}`, `/_search?q=${keyword}${hash}`);
    }
  }

  search(data) {
    const keyword = data.keyword;
    if (keyword === '') {
      this.setState({
        searchingKeyword: '',
        searchedPages: [],
        searchResultMeta: {},
      });

      return true;
    }

    this.setState({
      searchingKeyword: keyword,
    });

    this.props.appContainer.apiGet('/search', { q: keyword })
      .then((res) => {
        this.changeURL(keyword);

        // TODO: remove creating dummy snippet lines when the data with snippet is abole to be retrieved
        res.data.forEach((page) => {
          page.snippet = `dummy snippet dummpy snippet dummpy snippet dummpy snippet dummpy snippet
            dummpy snippet dummpy snippet dummpy snippet dummpy snippet`;
        });

        this.setState({
          searchedKeyword: keyword,
          searchedPages: res.data,
          searchResultMeta: res.meta,
          selectedPage: res.data[0],
        });
      })
      .catch((err) => {
        toastError(err);
      });
  }

  selectPageToShow= (pageId) => {
    // TODO : this part can be improved.
    // pageId is this form: #id_613eda3717b2d80c4874dfb9
    let index;
    let i = 0;
    const pId = pageId.slice(4);
    this.state.searchedPages.forEach((page) => {
      if (pId === page._id) { index = i }
      i++;
    });
    this.setState({
      selectedPage: this.state.searchedPages[index],
    });
  }

  toggleCheckBox = (page) => {
    if (this.state.selectedPages.has(page)) {
      this.state.selectedPages.delete(page);
    }
    else {
      this.state.selectedPages.add(page);
    }
  }

  renderSearchResultContent = () => {
    return (
      <SearchResultContent
        appContainer={this.props.appContainer}
        searchingKeyword={this.state.searchingKeyword}
        selectedPage={this.state.selectedPage}
      >
      </SearchResultContent>
    );
  }

  renderSearchResultList = () => {
    return (
      <SearchResultList
        pages={this.state.searchedPages}
        deletionMode={false}
        selectedPage={this.state.selectedPage}
        selectedPages={this.state.selectedPages}
        handleChange={this.toggleCheckBox}
        clickHandler={this.selectPageToShow}
      >
      </SearchResultList>
    );
  }

  renderSearchControl = () => {
    return (
      <SearchControl
        t={this.props.t}
        searchingKeyword={this.state.searchingKeyword}
        appContainer={this.props.appContainer}
        search={this.search}
      >
      </SearchControl>
    );
  }

  render() {
    return (
      <div>
        <SearchPageLayout
          SearchControlComponent={this.renderSearchControl()}
          SearchResultList={this.renderSearchResultList()}
          SearchResultContent={this.renderSearchResultContent()}
          searchResultMeta={this.state.searchResultMeta}
          searchingKeyword={this.state.searchedKeyword}
        >
        </SearchPageLayout>


        {/* <SearchResult
          pages={this.state.searchedPages}
          searchingKeyword={this.state.searchingKeyword}
          searchResultMeta={this.state.searchResultMeta}
        >
          <SearchPageForm
            t={this.props.t}
            keyword={this.state.searchingKeyword}
            appContainer={this.props.appContainer}
            onSearchFormChanged={this.search}
          />
        </SearchResult> */}
      </div>
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const SearchPageWrapper = withUnstatedContainers(SearchPage, [AppContainer]);

SearchPage.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,

  query: PropTypes.object,
};
SearchPage.defaultProps = {
  // pollInterval: 1000,
  query: SearchPage.getQueryByLocation(window.location || {}),
};

export default withTranslation()(SearchPageWrapper);
