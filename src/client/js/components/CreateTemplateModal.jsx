import React from 'react';
import PropTypes from 'prop-types';

import { Modal, ModalHeader, ModalBody } from 'reactstrap';

import { withTranslation } from 'react-i18next';
import { pathUtils } from 'growi-commons';
import urljoin from 'url-join';
import { createSubscribedElement } from './UnstatedUtils';

import PageContainer from '../services/PageContainer';

const CreateTemplateModal = (props) => {
  const { t, pageContainer } = props;

  const { path, isCreateTemplatePageModalShown } = pageContainer.state;
  const parentPath = pathUtils.addTrailingSlash(path);

  function generateUrl(label) {
    return encodeURI(urljoin(parentPath, label, '#edit'));
  }

  /**
   * @param {string} target Which hierarchy to create [children, decendants]
   */
  function renderTemplateCard(target, label) {
    return (
      <div className="card card-select-template">
        <div className="card-header">{ t(`template.${target}.label`) }</div>
        <div className="card-body">
          <p className="text-center"><code>{label}</code></p>
          <p className="form-text text-muted text-center"><small>{t(`template.${target}.desc`) }</small></p>
        </div>
        <div className="card-footer text-center">
          <a
            href={generateUrl(label)}
            className="btn btn-sm btn-primary"
            id={`template-button-${target}`}
          >
            { t('Edit') }
          </a>
        </div>
      </div>
    );
  }

  return (
    <Modal isOpen={isCreateTemplatePageModalShown} toggle={pageContainer.closeCreateTemplatePageModal} className="grw-create-page">
      <ModalHeader tag="h4" toggle={pageContainer.closeCreateTemplatePageModal} className="bg-primary text-light">
        {t('template.modal_label.Create/Edit Template Page')}
      </ModalHeader>
      <ModalBody>
        <div className="form-group">
          <label className="mb-4">
            <code>{parentPath}</code><br />
            { t('template.modal_label.Create template under') }
          </label>
          <div className="row">
            <div className="col-md-6">
              {renderTemplateCard('children', '_template')}
            </div>
            <div className="col-md-6">
              {renderTemplateCard('decendants', '__template')}
            </div>
          </div>
        </div>
      </ModalBody>
    </Modal>

  );
};


/**
 * Wrapper component for using unstated
 */
const CreateTemplateModalWrapper = (props) => {
  return createSubscribedElement(CreateTemplateModal, props, [PageContainer]);
};


CreateTemplateModal.propTypes = {
  t: PropTypes.func.isRequired, //  i18next
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
};

export default withTranslation()(CreateTemplateModalWrapper);
