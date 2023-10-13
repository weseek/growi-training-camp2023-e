import React, { useState, useEffect } from 'react';

import axios from '~/utils/axios';

const SideMenu: React.FC = () => {
  const [newPost, setNewPost] = useState<any[]>();
  const [tag, setTag] = useState<any[]>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    axios.get(`${process.env.NEXT_PUBLIC_APP_SITE_URL}/_cms/list.json`)
      .then((response) => {
        setNewPost(response.data);
      })
      .catch((error) => {
        setError(`データの取得に失敗しました。\n${JSON.stringify(error)}`);
      });
    axios.get(`${process.env.NEXT_PUBLIC_APP_SITE_URL}/_cms/tags`)
      .then((response) => {
        setTag(response.data.data);
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
            <div className="pe-5">
              <div>
                <i className="fa-solid fa-house"></i>
                <div>最新記事</div>
                <ul className="list-caret">
                  {newPost.map((newPostData, index) => {
                    return (
                      <li className={`container pb-2${newPost.length - 1 === index ? '' : ' border-bottom'}`}>
                        <a href={`/${newPostData.page._id}`} className="new-post-list text-decoration-none">
                          <span className="ms-2">{newPostData.title}</span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div>
                <div>タグ</div>
                <ul className="list-caret">
                  {tag.map((tagData, index) => {
                    return (
                      <li className={`container pb-2${tag.length - 1 === index ? '' : ' border-bottom'}`}>
                        <a href="" className="new-post-list text-decoration-none">
                          <span className="ms-2">{tagData.name}</span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          )}
        </>
      ) : (
        { error }
      )}
    </>
  );
};

export default SideMenu;
