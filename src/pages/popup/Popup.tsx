import React, { useEffect, useState } from "react";
import "@pages/popup/Popup.less";
import { Card } from 'antd';
import { CopyOutlined, ReloadOutlined, FileAddOutlined } from '@ant-design/icons';
import { CopyToClipboard } from 'react-copy-to-clipboard'

const Popup = () => {
  const [sentence, setSentence] = useState('');

  useEffect(() => {
    getSentence()
  }, []);

  async function getSentence() {
    const res = await fetch('https://api.oick.cn/dutang/api.php', {
      method: 'GET'
    })
    const nextSentence = await res.json()
    setSentence(nextSentence)
  }

  const handleAdd = () => {
    chrome.storage.sync.get("sentences", ({ sentences = [] }) => {
      chrome.storage.sync.set({ sentences: [sentence, ...sentences] });
    });
  }

  const handleReload = () => {
    getSentence()
  }

  return (
    <div className="popup-container">
      <Card 
        style={{ width: 300 }}
        actions={[
          <FileAddOutlined key='add' onClick={handleAdd}/>,
          <CopyToClipboard key="copy" text={sentence}>
            <CopyOutlined/>
          </CopyToClipboard>,
          <ReloadOutlined key="reload" onClick={handleReload}/>,
        ]}
      >
        <p style={{ minHeight: 60 }}>{ sentence }</p>
      </Card>
    </div>
  );
};

export default Popup;
