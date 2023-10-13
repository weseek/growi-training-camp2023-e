import React, { useState, useEffect } from 'react';

import dateFnsFormat from 'date-fns/format';
import parse from 'html-react-parser';
import { NextPage, GetServerSideProps } from 'next';
import { useRouter } from 'next/router';

import axios from '~/utils/axios';

type Props = {
  pageId: string
}

const DetailPage: NextPage<Props> = (props: Props) => {
  const router = useRouter();
  const pageId = router.query.pageId ?? props.pageId;
  const [resData, setResData] = useState<any>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    axios.get(`${process.env.NEXT_PUBLIC_APP_SITE_URL}/_cms/${pageId}.json`)
      .then((response) => {
        setResData(response.data);
      })
      .catch((error) => {
        setError(`データの取得に失敗しました。\n${JSON.stringify(error)}`);
      });
  }, [pageId]);

  return (
    <div className="border bg-white p-5">
      {error == null ? (
        <>
          {resData == null ? (
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          ) : (
            <>
              <div className="list-inline d-flex mb-4">
                <p className="me-4"><i className="fa fa-clock-o me-2" />{dateFnsFormat(new Date(resData.page.createdAt), 'yyyy.MM.dd')}</p>
                <p><i className="fa fa-repeat me-2" />{dateFnsFormat(new Date(resData.page.updatedAt), 'yyyy.MM.dd')}</p>
              </div>
              <h2 className="pb-5 fw-bold">{resData.title}</h2>
              {parse(resData.htmlString)}
              <hr />
              <img src={resData.page.creator.imageUrlCached} width="100" height="100" alt="" />
              <p><strong>{resData.page.creator.name}</strong></p>
            </>
          )}
        </>
      ) : (
        <p>{error}</p>
      )}
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async(context) => {
  const pageId = context.query.pageId;

  if (typeof pageId !== 'string') {
    return {
      notFound: true,
    };
  }

  return { props: { pageId } };
};

export default DetailPage;
