// ==UserScript==
// @name         电商平台联合关键词屏蔽
// @namespace    http://tampermonkey.net/
// @version      4.0(20250324)
// @description  京东/淘宝多平台关键词联合屏蔽
// @author       Chris & DeepSeek-R1
// @match        https://search.jd.com/*
// @match        https://*.jd.com/*
// @match        https://www.jd.com/
// @match        *://*.taobao.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 全局关键词配置 (使用半角逗号分隔)
    const BLOCK_KEYWORDS = ['肖战', '王一博', '赵露思', '李现', '张翰', '周冬雨', '华晨宇','元气森林', '心相印', '六神', '舒客', '李宁', '饰之秀', '陌森', '猫人', '芙蕖', '飞利浦', '慕瑾繁饰', 'BJYL', '千宝莱', 'THOM WILLS', 'RALPH LAUREN', 'NormanWalsh', 'MZJV', '共田', 'Usmile'];

    // 平台检测
    const isJD = location.host.includes('jd.com');
    const isTB = location.host.includes('taobao.com');

    // 京东处理模块
    if(isJD) {
        const CONSOLE_STYLE = 'color:#FFEB3B;font-weight:bold;';
        let observer = new MutationObserver(handleJD);

        function handleJD() {
            const selectors = [
                'li.gl-item',
                'li[id^="ad-"]',
                '.goods-list li',
                'li.more2_item'
            ].join(',');

            document.querySelectorAll(selectors).forEach(item => {
                if (item.dataset.processed) return;

                const title = [
                    item.querySelector('.more2_info_name')?.textContent,
                    item.querySelector('.p-name em')?.textContent,
                    item.querySelector('[sku]')?.getAttribute('sku'),
                    item.querySelector('a[title]')?.title
                ].find(Boolean);

                if (title && checkKeywords(title)) {
                    item.style.cssText = `
                        display: none !important;
                        height: 0 !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    `;
                    item.dataset.processed = true;
                    console.log(`%c[京东] 已屏蔽：${title}`, CONSOLE_STYLE);
                }
            });
        }

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributeFilter: ['class', 'id']
        });
        window.addEventListener('scroll', () => setTimeout(handleJD, 1000));
        handleJD();
    }

    // 淘宝处理模块
 if(isTB) {
    let totalHits = 0;
    const itemSelector = '.tbpc-col.search-content-col';
    const TB_STYLE = 'color:#4CAF50;font-weight:bold;'; // 新增淘宝日志样式

    const observer = new MutationObserver(mutations => {
        mutations.forEach(() => processItems());
    });

    function processItems() {
        let currentHits = 0;

        document.querySelectorAll(`${itemSelector}:not([data-processed])`)
            。forEach(item => {
                const titleEl = item.querySelector('.title--qJ7Xg_90 span');
                if (!titleEl) return;

                const titleText = titleEl.textContent.trim();
                if (checkKeywords(titleText)) {
                    // 隐藏元素
                    item.style.cssText = `
                        display: none !important;
                        height: 0 !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    `;
                    item.dataset.processed = true;

                    // 输出日志
                    console.log(`%c[淘宝] 已屏蔽：${titleText}`, TB_STYLE);
                    currentHits++;
                }
            });

        // 更新计数器
        if (currentHits > 0) {
            totalHits += currentHits;
            console.log(`%c[淘宝] 本次新增 ${currentHits} 项，累计屏蔽：${totalHits} 件`, TB_STYLE);
        }
    }


        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        processItems();
    }

    // 通用关键词检测
    function checkKeywords(text) {
        return BLOCK_KEYWORDS.some(kw =>
            text.toLowerCase().includes(kw.toLowerCase())
        );
    }
})();
