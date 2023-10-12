import React, { useState, useEffect } from 'react';

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
  const [htmlString, setHTMLString] = useState();
  const [title, setTitle] = useState();
  const [error, setError] = useState<string>();

  useEffect(() => {
    axios.get(`${process.env.NEXT_PUBLIC_APP_SITE_URL}/_cms/${pageId}.json`)
      .then((response) => {
        setHTMLString(response.data.htmlString);
        setTitle(response.data.title);
      })
      .catch((error) => {
        setError(`データの取得に失敗しました。\n${JSON.stringify(error)}`);
      });
  }, [pageId]);

  return (
    <div className="border bg-white p-5">
      {error == null ? (
        <>
          {htmlString == null ? (
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          ) : (
            <>
              <h2 className="pb-5 fw-bold">{title}</h2>
              {parse(htmlString)}
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
