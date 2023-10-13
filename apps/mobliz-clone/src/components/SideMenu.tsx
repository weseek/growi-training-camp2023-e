import React, { useState, useEffect } from 'react';

import axios from '~/utils/axios';

const SideMenu: React.FC = () => {
  const [data, setData] = useState<any[]>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    axios.get(`${process.env.NEXT_PUBLIC_APP_SITE_URL}/_cms/tags`)
      .then((response) => {
        setData(response.data.data);
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
              <div>
                <p>最新記事</p>
              </div>
              <div>
                <div>タグ</div>
                <ul className="p-2">
                  {data.map((pageData, index) => {
                    return (
                      <li className="container">
                        <div className="row">
                          <div className={`col-8 ${index === 0 ? ' border-bottom' : ''}`}>
                            <p className="my-2 ml-5">{`${pageData.name}`}</p>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </>
          )}
        </>
      ) : (
        <div>
          <p>{error}</p>
        </div>
      )}
    </>
  );
};

export default SideMenu;
