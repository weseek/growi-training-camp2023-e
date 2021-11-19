import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckboxType } from '../../interfaces/search';

type Props = {
  isCheckboxDisabled: boolean,
  selectAllCheckboxType: CheckboxType,
  onClickDeleteButton?: () => void,
  onClickSelectAllCheckbox?: (nextSelectAllCheckboxType: CheckboxType) => void,
}

const DeleteSelectedPageGroup:FC<Props> = (props:Props) => {
  const { t } = useTranslation();
  const {
    onClickDeleteButton, onClickSelectAllCheckbox, selectAllCheckboxType,
  } = props;

  const onClickCheckbox = () => {
    if (onClickSelectAllCheckbox != null) {
      const next = selectAllCheckboxType === CheckboxType.ALL_CHECKED ? CheckboxType.NONE_CHECKED : CheckboxType.ALL_CHECKED;
      onClickSelectAllCheckbox(next);
    }

  };

  return (
    <>
      {/** todo: implement the design for CheckboxType = INDETERMINATE */}
      <input
        id="check-all-pages"
        type="checkbox"
        name="check-all-pages"
        className="custom-control custom-checkbox ml-1 align-self-center"
        disabled={props.isCheckboxDisabled}
        onClick={onClickCheckbox}
        checked={selectAllCheckboxType !== CheckboxType.NONE_CHECKED}
      />
      <button
        type="button"
        className="btn text-danger font-weight-light p-0 ml-3"
        disabled={checkboxState === CheckboxType.NONE_CHECKED}
        onClick={() => {
          if (onClickDeleteButton != null) {
            onClickDeleteButton();
          }
        }}
      >
        <i className="icon-trash"></i>
        {t('search_result.delete_all_selected_page')}
      </button>
    </>
  );

};

export default DeleteSelectedPageGroup;
