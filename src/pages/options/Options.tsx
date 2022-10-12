import React, { useEffect, useMemo, useState, useRef } from "react";
import "@pages/options/Options.less";
import { Button, Card, Input, List, message, Modal } from 'antd';
import { EditOutlined, DeleteOutlined, CopyOutlined } from '@ant-design/icons';
import {SortableContainer, SortableElement} from 'react-sortable-hoc';
import {arrayMoveImmutable} from 'array-move';
import CopyToClipboard from 'react-copy-to-clipboard';

const Options: React.FC = () => {
  const [sentences, setSentences] = useState<string[]>([]);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>('');
  const operatorTypeRef = useRef({ type: '', index: -1 })

  useEffect(() => {
    chrome.storage.sync.get("sentences", ({ sentences }) => {
      setSentences(sentences ?? [])
    });
  }, []);

  // 排序, 移动顺序
  const onSortEnd = ({oldIndex, newIndex}: {oldIndex: number, newIndex: number}) => {
    const nextSentences = arrayMoveImmutable(sentences, oldIndex, newIndex)
    setSentences(nextSentences)
    chrome.storage.sync.set({ sentences: nextSentences });
  }

  function handleOperatorClick(type: 'add' | 'edit' | 'delete', index: number) {
    switch (type) {
      case 'add':
      case 'edit':
        operatorTypeRef.current = {
          type,
          index
        }
        setIsModalVisible(true)
        setInputValue(sentences[index])
        break;
      case 'delete':{
        const nextSentences = [...sentences].filter((_item, sentenceIndex) => {
          return index !== sentenceIndex
        })
        chrome.storage.sync.set({ sentences: nextSentences });
        setSentences(nextSentences)
        message.success('操作成功')
        break;
      }
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setInputValue(e.target.value)
  }

  const handleOk = () => {
    if(!inputValue) {
      message.error('请填写后提交')
      return
    }
    let nextSentences: string[] = (sentences ?? []).slice()
    if (operatorTypeRef?.current?.type === 'add') {
      nextSentences = [inputValue, ...nextSentences]
    } else {
      nextSentences[operatorTypeRef?.current?.index] = inputValue
    }
    
    setSentences(nextSentences)
    chrome.storage.sync.set({ sentences: nextSentences });
    setIsModalVisible(false)
    message.success('操作成功')
  }

  const SortableItem = useMemo(() => SortableElement<{ value: string, sortIndex: number }>(({value, sortIndex}: {value: string, sortIndex: number}) => {
    return (
      <List.Item 
        actions={[
          <CopyToClipboard key="copy" text={value}>
            <CopyOutlined/>
          </CopyToClipboard>,
          <EditOutlined key="edit" className="edit-btn" onClick={(_e) => handleOperatorClick('edit', sortIndex)}/>, 
          <DeleteOutlined key="delete" className="delete-btn" onClick={(_e) => handleOperatorClick('delete', sortIndex)}/>
        ]}>
          {value}
      </List.Item>
    )
  }), [sentences]);
  
  const SortableList = useMemo(() => SortableContainer<{ items: string[] }>(({items}: { items: string[] }) => {
    return (
      <List>
        {items?.map((value, index) => (
          <SortableItem 
            key={`item-${value}-${index}`} 
            index={index}
            // index 索引无法获取，需要另外指定 sortIndex
            sortIndex={index}
            value={value}
            />
        ))}
      </List>
    );
  }), [sentences]);

  return (
    <div className='options-container'>
      <Card 
        title='语录' 
        actions={[
          <Button key='add' type="primary" block onClick={() => handleOperatorClick('add', -1)}>
            新增
          </Button>,
        ]}>
        { (sentences && sentences.length) ? <SortableList distance={1} items={sentences} onSortEnd={onSortEnd}/> : '暂无数据' }
      </Card>
      <Modal 
        title="新增" 
        visible={isModalVisible} 
        destroyOnClose
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
        okText='确定'
        cancelText="取消"
      >
        <Input.TextArea
          value={inputValue}
          allowClear 
          showCount 
          maxLength={200} 
          placeholder='请填写语录' 
          onChange={handleInputChange}
        />
      </Modal>
    </div>
  );
};

export default Options;
