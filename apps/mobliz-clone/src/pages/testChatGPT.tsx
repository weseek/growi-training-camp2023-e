import React, { useState, useRef } from 'react';

import { NextPage } from 'next';

import axios from '~/utils/axios';

const TestChatGPT: NextPage = () => {
  const [responseMessage, setResponseMessage] = useState();
  const genreInputRef = useRef<HTMLInputElement>(null);

  const URL = 'https://api.openai.com/v1/completions';
  const API_KEY = '';

  const handleSubmit = async(e) => {
    e.preventDefault();
    try {
      const genre = genreInputRef.current?.value;
      const requestText = `${genre}に関する4択の問題を1問出題して`;

      const response = await axios.post(
        URL,
        {
          model: 'gpt-3.5-turbo',
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
      setResponseMessage(chatGPTResponse);
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
      <p className="card mt-4">{responseMessage}</p>
    </div>
  );
};

export default TestChatGPT;
