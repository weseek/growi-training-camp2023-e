import React, { useState, useEffect } from 'react';

import parse from 'html-react-parser';
import { NextPage } from 'next';

import axios from '~/utils/axios';

const TopPage: NextPage = () => {
  const [data, setData] = useState<any[]>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    axios.get(`${process.env.NEXT_PUBLIC_APP_SITE_URL}/_cms/list.json`)
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        setError(`データの取得に失敗しました。\n${JSON.stringify(error)}`);
      });
  }, []);

  return (
    <>
      {error == null ? (
        <>
          {data == null ? (
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          ) : (
            <>
              {data.map((pageData, index) => {
                return (
                  <div className={`border bg-white p-5${index === 0 ? '' : ' mt-5'}`}>
                    <div className="index-preview overflow-hidden">
                      {parse(pageData.htmlString)}
                    </div>
                    <a href={`/${pageData.page._id}`} className="btn btn-outline-primary text-decoration-none rounded-0 mt-4">
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
