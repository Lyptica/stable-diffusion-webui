/**
 * id指定のDOMを from -> to へ移動する関数
 * 
 * @param {string} from 移動させたいDOMのCSSSelector 
 * @param {string} to 移動先のDOMのCSSSelector
 * @param {string} operation 操作 (firstChild = 子要素の先頭, lastChild = 子要素の末尾)
 * @param {number} fromIndex 要素が複数見つかった時用に指定するindex
 * @param {number} toIndex 要素が複数見つかった時用に指定するindex
 * @returns 早期リターン
 */
function moveDOM(from, to, operation, fromIndex = 0, toIndex = 0) {
    const fromObjectNodeList = gradioApp().querySelectorAll(from);
    const fromObject = fromObjectNodeList?.item(fromIndex);

    const targetObjectNodeList = gradioApp().querySelectorAll(to);
    const targetObject = targetObjectNodeList?.item(toIndex);

    if (!fromObject || !targetObject) {
        console.log('moveDOM(): fromDOM or targetDOM was not found.');
        return;
    }

    if (operation === 'firstChild') {
        targetObject.insertBefore(fromObject, targetObject.firstElementChild);
    }

    if (operation === 'lastChild') {
        targetObject.appendChild(fromObject);
    }
}

/**
 * 画面が読み込まれた後にレイアウトを変更する関数
 * 
 * @returns boolean 変更が完了したか
 */
function fixLayouts() {
    console.log(`fixLayouts applying...: ${new Date()}`);

    if (!gradioApp().querySelector('#txt2img_styles_row')) {
        return false;
    }

    // Stylesはプロンプト入力欄の先頭に移動
    moveDOM('#txt2img_styles_row', '#txt2img_prompt_container', 'firstChild');

    // Generateボタンはプロンプト入力欄の先頭に移動
    moveDOM('#txt2img_generate_box', '#txt2img_prompt_container', 'firstChild');

    // Easy-Generateボタンはプロンプト入力欄の先頭に移動 (Extension)
    moveDOM('#txt2img_actions_column > div.easy_generate_forever_container', '#txt2img_prompt_container', 'firstChild');

    // 花札とかのボタンはプロンプト入力欄の末尾に移動
    moveDOM('#txt2img_tools', '#txt2img_prompt_container', 'lastChild');

    // LoRAとか選ぶフレームは花札の下に移動 (花札とフレームが同じID使ってるので、indexを指定)
    moveDOM('#txt2img_extra_networks', '#txt2img_prompt_container', 'lastChild', 1);
    
    // プレビュー画像の部分をGenerateボタンとかあるとこの末尾に移動
    moveDOM('#txt2img_results', '#txt2img_actions_column', 'lastChild');
    
    // txt2img_prompt_containerのGRID指定を消して、上半分のレイアウトを半々にする
    const txt2imgPromptContainer = gradioApp().getElementById('txt2img_prompt_container');
    txt2imgPromptContainer.style.flexGrow = null;

    // 花札の右側のマージンを消す
    const hanafuda = gradioApp().getElementById('txt2img_tools');
    hanafuda.style.width = 'fit-content';

    // 花札はGenerateForeverの左側に移動 *注意: Extensionに依存しているので、アップデートに注意
    moveDOM('#txt2img_tools', '#txt2img_prompt_container > div.easy_generate_forever_container > div', 'firstChild');

    // 保存ボタンとかはめったに使わないのでresultの末尾に移動
    moveDOM('#image_buttons_txt2img', '#txt2img_results', 'lastChild');

    return true;
}

/**
 * fixLayouts() が成功するまで画面をウォッチする関数
 */
function fixLayoutsObserver() {
    const observer = new MutationObserver((mutationsList, observer) => {
        const childListMutation = mutationsList.find(mutation => mutation.type === 'childList');
        if (!childListMutation) return;

        const isFoundTargetDOM = fixLayouts();
        if (!isFoundTargetDOM) return;

        // MutationObserverのウォッチを解除
        observer.disconnect();
    });

    // ウォッチ対象の親要素を取得
    const parentElement = gradioApp();

    // MutationObserverの設定
    const config = { childList: true };

    // MutationObserverを開始
    observer.observe(parentElement, config);
}

// ウォッチ関数を登録
document.addEventListener("DOMContentLoaded", fixLayoutsObserver);
