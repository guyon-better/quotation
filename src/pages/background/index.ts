let selectedSentence = ''

chrome.runtime.onInstalled.addListener(() => {
	// 右键菜单管理
	chrome.contextMenus.create({
		"id": "0",
		"type" : "normal",
		"title" : "新增语录",
		contexts: ['selection'],
	});
});

chrome.contextMenus.onClicked.addListener(() => {
		addSentence()
	}
)

function addSentence() {
	chrome.storage.sync.get("sentences", ({ sentences = [] }) => {
		chrome.storage.sync.set({ sentences: [selectedSentence, ...sentences] });
		showNotification()
	});
}

chrome.runtime.onMessage.addListener(
(request) => {
	const { data, action } = request;
	if (action === 'add') {
		selectedSentence = data
	}
});

function showNotification() {
	chrome.notifications.create({
		type: 'basic',
		iconUrl: './images/icon.png',
		title: '',
		message: '操作成功',
		priority: 0,
	});
}