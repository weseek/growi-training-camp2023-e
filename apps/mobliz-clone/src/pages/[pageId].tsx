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
  const [htmlString, setHTMLString] = useState();
  const [error, setError] = useState<string>();

  // 試し
  const [dataTest, setDataTest] = useState<any>();

  useEffect(() => {
    axios.get(`${process.env.NEXT_PUBLIC_APP_SITE_URL}/_cms/${pageId}.json`)
      .then((response) => {
        setHTMLString(response.data.htmlString);
        setDataTest(response.data);
      })
      .catch((error) => {
        setError(`データの取得に失敗しました。\n${JSON.stringify(error)}`);
      });
  }, [pageId]);
  console.log('respo', dataTest);


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
              <p>{dateFnsFormat(new Date(dataTest?.page.createdAt), 'yyyy.MM.dd')}</p>
              <p>{dateFnsFormat(new Date(dataTest?.page.updatedAt), 'yyyy.MM.dd')}</p>

              {parse(htmlString)}
              <hr />
              <img src={dataTest?.page.creator.imageUrlCached} width="100" height="100" alt="" />
              <p><strong>{dataTest?.page.creator.name}</strong></p>
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
