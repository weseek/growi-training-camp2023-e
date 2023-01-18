import React, { ChangeEvent, useCallback, useState } from 'react';

import { useTranslation } from 'next-i18next';

import AdminAppContainer from '~/client/services/AdminAppContainer';
import { toastSuccess, toastError } from '~/client/util/apiNotification';

import { withUnstatedContainers } from '../../UnstatedUtils';
import AdminUpdateButtonRow from '../Common/AdminUpdateButtonRow';

import AwsSetting from './AwsSetting';
import GcsSettings from './GcsSettings';

const fileUploadTypes = ['aws', 'gcs', 'gridfs', 'local'] as const;

type FileUploadSettingMoleculeProps = {
  fileUploadType: string
  isFixedFileUploadByEnvVar: boolean
  envFileUploadType?: string
  onChangeFileUploadType: (e: ChangeEvent, type: string) => void
}

export const FileUploadSettingMolecule = React.memo((props: FileUploadSettingMoleculeProps): JSX.Element => {
  const { t } = useTranslation(['admin', 'commons']);

  return (
    <>
      <p className="card well my-3">
        {t('admin:app_setting.file_upload')}
        <br />
        <br />
        <span className="text-danger">
          <i className="ti ti-unlink"></i>
          {t('admin:app_setting.change_setting')}
        </span>
      </p>

      <div className="row form-group mb-3">
        <label className="text-left text-md-right col-md-3 col-form-label">
          {t('admin:app_setting.file_upload_method')}
        </label>

        <div className="col-md-6 py-2">
          {fileUploadTypes.map((type) => {
            return (
              <div key={type} className="custom-control custom-radio custom-control-inline">
                <input
                  type="radio"
                  className="custom-control-input"
                  name="file-upload-type"
                  id={`file-upload-type-radio-${type}`}
                  checked={props.fileUploadType === type}
                  disabled={props.isFixedFileUploadByEnvVar}
                  onChange={(e) => { props?.onChangeFileUploadType(e, type) }}
                />
                <label className="custom-control-label" htmlFor={`file-upload-type-radio-${type}`}>{t(`admin:app_setting.${type}_label`)}</label>
              </div>
            );
          })}
        </div>
        {props.isFixedFileUploadByEnvVar && (
          <p className="alert alert-warning mt-2 text-left offset-3 col-6">
            <i className="icon-exclamation icon-fw">
            </i><b>FIXED</b><br />
            {/* eslint-disable-next-line react/no-danger */}
            <b dangerouslySetInnerHTML={{ __html: t('admin:app_setting.fixed_by_env_var', { fileUploadType: props.envFileUploadType }) }} />
          </p>
        )}
      </div>

      {props.fileUploadType === 'aws' && <AwsSetting />}
      {props.fileUploadType === 'gcs' && <GcsSettings />}
    </>
  );
});
FileUploadSettingMolecule.displayName = 'FileUploadSettingMolecule';


type FileUploadSettingProps = {
  adminAppContainer: AdminAppContainer
}

const FileUploadSetting = (props: FileUploadSettingProps): JSX.Element => {
  const { t } = useTranslation(['admin', 'commons']);
  const { adminAppContainer } = props;

  const {
    fileUploadType, isFixedFileUploadByEnvVar, envFileUploadType, retrieveError,
  } = adminAppContainer.state;

  const submitHandler = useCallback(async() => {
    try {
      await adminAppContainer.updateFileUploadSettingHandler();
      toastSuccess(t('toaster.update_successed', { target: t('admin:app_setting.file_upload_settings'), ns: 'commons' }));
    }
    catch (err) {
      toastError(err);
    }
  }, [adminAppContainer, t]);

  const onChangeFileUploadTypeHandler = useCallback((e: ChangeEvent, type: string) => {
    adminAppContainer.changeFileUploadType(type);
  }, [adminAppContainer]);

  return (
    <>
      <FileUploadSettingMolecule
        fileUploadType={fileUploadType}
        isFixedFileUploadByEnvVar={isFixedFileUploadByEnvVar}
        envFileUploadType={envFileUploadType}
        onChangeFileUploadType={onChangeFileUploadTypeHandler}/>
      <AdminUpdateButtonRow onClick={submitHandler} disabled={retrieveError != null} />
    </>
  );
};


/**
 * Wrapper component for using unstated
 */
const FileUploadSettingWrapper = withUnstatedContainers(FileUploadSetting, [AdminAppContainer]);

export default FileUploadSettingWrapper;
