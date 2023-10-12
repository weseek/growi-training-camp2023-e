import React, { useState, useEffect } from 'react';

import axios from '~/utils/axios';

const SideMenu: React.FC = () => {
  const [tag, setTag] = useState<any[]>();
  const [newPost, setNewPost] = useState<any[]>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    axios.get(`${process.env.NEXT_PUBLIC_APP_SITE_URL}/_cms/tags`)
      .then((response) => {
        setTag(response.data.data);
      })
      .catch((error) => {
        setError(`データの取得に失敗しました。\n${JSON.stringify(error)}`);
      });
  }, []);

  useEffect(() => {
    axios.get(`${process.env.NEXT_PUBLIC_APP_SITE_URL}/_cms/list.json`)
      .then((response) => {
        setNewPost(response.data);
      })
      .catch((error) => {
        setError(`データの取得に失敗しました。\n${JSON.stringify(error)}`);
      });
  }, []);
  return (
    <>
      {error == null ? (
        <>
          {tag == null || newPost == null ? (
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          ) : (
            <>
              <div>
                <div>最新記事</div>
                <ul className="p-2">
                  {newPost.map((newPostData, index) => {
                    return (
                      <li className="container">
                        <div className="row">
                          <div className={`col-10 ${newPost.length - 1 === index ? '' : ' border-bottom'}`}>
                            <p className="my-2 ml-5">{`${newPostData.title}`}</p>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div>
                <div>タグ</div>
                <ul className="p-2">
                  {tag.map((tagData, index) => {
                    return (
                      <li className="container">
                        <div className="row">
                          <div className={`col-10 ${tag.length - 1 === index ? '' : ' border-bottom'}`}>
                            <p className="my-2 ml-5">{`${tagData.name}`}</p>
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
