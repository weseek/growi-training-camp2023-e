import React, { useState, useRef } from 'react';

import { NextPage } from 'next';

import axios from '~/utils/axios';

const TestChatGPT: NextPage = () => {
  const [responseMessages, setResponseMessages] = useState<string[]>([]);
  const genreInputRef = useRef<HTMLInputElement>(null);

  const URL = 'https://api.openai.com/v1/chat/completions';
  const API_KEY = '';

  const handleSubmit = async(e) => {
    e.preventDefault();
    try {
      const genre = genreInputRef.current?.value;
      const requestText = `${genre}に関する4択の問題を1問出題して。問題文と選択肢のみを返して。`;

      const response = await axios.post(
        URL,
        {
          model: 'gpt-4',
          messages: [
            { role: 'user', content: requestText },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${API_KEY}`,
          },
        },
      );
      const chatGPTResponse = response.data.choices[0].message.content;
      setResponseMessages(prevResponseMessages => [...prevResponseMessages, chatGPTResponse]);
    }
    catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="border bg-white p-5">
      <form onSubmit={handleSubmit}>
        <label>
          ジャンル: <input id="genre" type="text" name="genre" ref={genreInputRef} />
        </label>
        <button type="submit">送信</button>
      </form>
      {responseMessages.map((responseMessage) => {
        return (<p className="card p-3 mt-4">{responseMessage}</p>);
      })}
    </div>
  );
};

export default TestChatGPT;
