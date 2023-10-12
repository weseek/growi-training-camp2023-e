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
  const [error, setError] = useState<string>();
  const [pageData, setPageData] = useState<any>();

  useEffect(() => {
    axios.get(`${process.env.NEXT_PUBLIC_APP_SITE_URL}/_cms/${pageId}.json`)
      .then((response) => {
        setPageData(response.data);
      })
      .catch((error) => {
        setError(`データの取得に失敗しました。\n${JSON.stringify(error)}`);
      });
  }, [pageId]);
  console.log('pagdata', pageData);

  return (
    <div className="border bg-white p-5">
      {error == null ? (
        <>
          {pageData == null ? (
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          ) : (
            <>
              <div className="list-inline d-flex mb-4">
                <p className="me-4"> {dateFnsFormat(new Date(pageData.page.createdAt), 'yyyy.MM.dd')}</p>
                <div> {dateFnsFormat(new Date(pageData.page.updatedAt), 'yyyy.MM.dd')}</div>
              </div>
              <h2 className="pb-5 fw-bold">{pageData.title}</h2>
              {parse(pageData.htmlString)}
              <hr />
              <img src={pageData.page.creator.imageUrlCached} width="100" height="100" alt="" />
              <p><strong>{pageData.page.creator.name}</strong></p>
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
