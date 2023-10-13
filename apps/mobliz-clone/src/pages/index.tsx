import React, { useState, useEffect } from 'react';

import dateFnsFormat from 'date-fns/format';
import parse from 'html-react-parser';
import { NextPage } from 'next';

import axios from '~/utils/axios';

const TopPage: NextPage = () => {
  const [resData, setResData] = useState<any[]>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    axios.get(`${process.env.NEXT_PUBLIC_APP_SITE_URL}/_cms/list.json`)
      .then((response) => {
        setResData(response.data);
      })
      .catch((error) => {
        setError(`データの取得に失敗しました。\n${JSON.stringify(error)}`);
      });
  }, []);

  return (
    <>
      {error == null ? (
        <>
          {resData == null ? (
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          ) : (
            <>
              {resData.map((data, index) => {
                return (
                  <div className={`border bg-white p-5${index === 0 ? '' : ' mt-5'}`}>
                    <div className="list-inline d-flex mb-4">
                      <p className="me-4"> {dateFnsFormat(new Date(data.page.createdAt), 'yyyy.MM.dd')}</p>
                      <div> {dateFnsFormat(new Date(data.page.updatedAt), 'yyyy.MM.dd')}</div>
                    </div>
                    <div className="index-preview overflow-hidden">
                      <a href={`/${data.page._id}`} className="post-title text-decoration-none">
                        <h2 className="post-title mb-5 fw-bold">{data.title}</h2>
                      </a>
                      {parse(data.htmlString)}
                    </div>
                    <a href={`/${data.page._id}`} className="btn btn-outline-primary text-decoration-none rounded-0 mt-4">
                      続きを読む
                    </a>
                  </div>
                );
              })}
            </>
          )}
        </>
      ) : (
        <div className="border bg-white p-5">
          <p>{error}</p>
        </div>
      )}
    </>
  );
};

export default TopPage;
