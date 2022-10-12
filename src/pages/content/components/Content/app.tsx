import { useEffect, useRef, useState } from "react";
import { createPopper } from '@popperjs/core/lib/popper-lite.js';
import preventOverflow from '@popperjs/core/lib/modifiers/preventOverflow.js';

export default function App() {
  const focusTargetRef = useRef<any>();
  const toolTargetRef = useRef<any>();
  const [sentences, setSentences] = useState([]);

  useEffect(() => {
    // capture: true 聚焦事件不会冒泡，但是可以在捕获阶段触发
    document.body.addEventListener('focus', handleFocus, true)
    document.body.addEventListener('blur', handleBlur, true)
    // 监听文字选中
    document.addEventListener("selectionchange", handleSelectionChange)

    return () => {
      document.body.removeEventListener('focus', handleFocus, true)
      document.body.removeEventListener('blur', handleBlur, true)
      document.removeEventListener("selectionchange", handleSelectionChange)
    }
  }, []);

  function handleFocus(event: any) {
    // 只有可编辑元素才弹窗
    const target = event?.target
    if(target?.isContentEditable || target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') {
      chrome.storage.sync.get("sentences", ({ sentences }) => {

        if (!sentences || !sentences?.length) {
          return
        }
        setSentences(sentences)
      });
      
      focusTargetRef.current = target
      const popperInstance = createPopper(target as HTMLElement, toolTargetRef.current, {
        modifiers: [
          preventOverflow,
            {
              name: 'flip',
              options: {
                fallbackPlacements: ['left', 'bottom'],
              },
            },
            {
              name: 'offset',
              options: {
                offset: [50, 50],
              },
            },
        ],
        placement: 'top-start',
      });
      toolTargetRef.current.setAttribute('data-show', '');
      popperInstance.update();
    }
  }

  function handleBlur() {
    setTimeout(() => {
      toolTargetRef.current.removeAttribute('data-show');
    }, 300)
  }

  function handleSelectionChange() {
    // 获取选中文本
    chrome?.runtime?.sendMessage({ action: 'add', data: document.getSelection()?.toString() });
  }

  function handleInput(info: string) {
    const target = focusTargetRef?.current
    if(target?.isContentEditable) {
      focusTargetRef.current.innerText = info
    } else if(target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') {
      focusTargetRef.current.value = info
    }

    // 自定义触发输入事件
    const event = new Event('input', { bubbles: false, cancelable: false })
    focusTargetRef.current.dispatchEvent(event);
  }

  return (
    <>
      <div id="tooltip" ref={toolTargetRef}>
        { sentences?.map((sentence, index) => (
          <div className='sentence-item' key={index} onClick={() => handleInput(sentence)}>{sentence}</div>
        )) }
      </div>
    </>
  );
}
